const gateway = require('conectric-usb-gateway-beta')
const moment = require('moment')
const request = require('request')
const Joi = require('@hapi/joi')
const ekmdecoder = require('./ekmdecoder')
const clientImpl = require('./clientimpl')

let ekmData = {
  dataChunksA: [],
  dataChunksB: []
}

let config
let meterReadingInterval
let chunkReadingInterval
let currentMeter = 0
let meterMappings
let metersEnabled = false
let expectedTrackingId
let retryCount = 0

const moveToNextMeter = () => {
  retryCount = 0

  if (currentMeter === meterMappings.meters.length - 1) {
    currentMeter = 0
  } else {
    currentMeter++
  }
}

const getCurrentMeter = () => {
  return meterMappings.meters[currentMeter]
}

const verifyConfig = () => {
  const validationResult = Joi.validate(config, Joi.object().keys({
    apiUrl: Joi.string().uri(),
    requestTimeout: Joi.number().integer().min(1).required(),
    maxRetries: Joi.number().integer().min(0).required(),
    readingInterval: Joi.number().integer().min(1).required(),
    useMillisecondTimestamps: Joi.boolean().required(),
    useFahrenheitTemps: Joi.boolean().required(),
    sendStatusMessages: Joi.boolean().required(),
    sendEventCount: Joi.boolean().required(),
    sendRawData: Joi.boolean().required(),
    sendHopData:  Joi.boolean().required()
  }).required().options({
    allowUnknown: true
  }))

  if (validationResult.error) {
      console.error('Errors detected in config file:')
      console.error(validationResult.error.message)
      process.exit(1)
  }

  // Set the parameters that are passed in seconds to be 
  // milliseconds.
  config.requestTimeout = config.requestTimeout * 1000
  config.readingInterval = config.readingInterval * 1000
}

const encodeMeterSerialNumber = serialNumber => {
  let encodedMeterSerialNumber = ''

  for (let n = 0; n < serialNumber.length; n++) {
    encodedMeterSerialNumber = `${encodedMeterSerialNumber}3${serialNumber[n]}`
  }

  return encodedMeterSerialNumber
}

const verifyMeterMappings = () => {
  const validationResult = Joi.validate(meterMappings, Joi.object().keys({
    meters: Joi.array().items(Joi.object().keys({
      serialNumber: Joi.string().length(12).required(),
      rs485HubId: Joi.string().length(4).required(),
      version: Joi.number().integer().min(3).max(4).required(),
      password: Joi.string().length(8).regex(/[0-9]{8}/).optional(),
      ctRatio: Joi.number().integer().min(100).max(5000).optional()
    }).optional())
  }).required().options({
    allowUnknown: false
  }))

  if (validationResult.error) {
    console.error('Errors detected in config file:')
    console.error(validationResult.error.message)
    process.exit(1)
  }

  for (const meter of meterMappings.meters) {
    meter.hexSerialNumber = encodeMeterSerialNumber(meter.serialNumber)
  }

  metersEnabled = (meterMappings.meters.length > 0)

  if (! metersEnabled) {
    console.log('Meter reading functionality disabled - no meters found in meters.json.')
  }
}

const sendToAPI = (message) => {
  const reformattedPayload = clientImpl.formatPayload({
    gatewayId: gateway.macAddress,
    ...message
  })

  const uri = clientImpl.buildAPIURL(config, reformattedPayload)

  console.log(uri)
  console.log(reformattedPayload)

  const requestConfig = {
    method: clientImpl.getAPIVerb(),
    uri,
    json: true,
    body: reformattedPayload
  }

  // Add in any custom headers.
  const requestHeaders = clientImpl.buildAPIHeaders(config, reformattedPayload)

  if (Object.keys(requestHeaders).length > 0) {
    requestConfig.headers = requestHeaders
  }

  request(
    requestConfig,
    (err, res, body) => {
      if (err) {
        console.error('Error sending to API:')
        console.error(err)
      } else {
        if (res.statusCode === 200) {
          console.log('Sent message successfully.')
        } else {
          console.error(`Error sending to API, statusCode: ${res.statusCode}`)
          console.error(res.body)
        }
      }
    }
  )
}

const clearMeterReadingInterval = () => {
  clearTimeout(meterReadingInterval)
  meterReadingInterval = undefined
}

const setChunkReadingInterval = () => {
  chunkReadingInterval = setTimeout(() => {
    chunkReadingInterval = undefined

    if (retryCount < config.maxRetries) {
      retryCount++

      const genTrackingId = randomTrackingId()
      const meter = getCurrentMeter()

      gateway.sendRS485ChunkRequest({
        chunkNumber: ekmData.chunkToRequest,
        chunkSize: ekmData.chunkSize,
        destination: meter.rs485HubId,
        trackingId: `${genTrackingId}`
      })

      setChunkReadingInterval()

      if (meter.version === 3) {
        console.log(`Sent retry request (${retryCount}) for chunk ${ekmData.chunkToRequest} with tracking ID:${genTrackingId}.`)
      } else {
        console.log(`Sent retry request (${retryCount}) for message ${ekmData.currentMessageType} chunk ${ekmData.chunkToRequest} with tracking ID:${genTrackingId}.`)
      }

      // Set the expected tracking ID for when the reply comes back.
      expectedTrackingId = genTrackingId
    } else {
      clientImpl.onMeterReadFail(meter.serialNumber)
      console.log('Starting a new reading request.')
      retryCount = 0
      ekmData.currentMessageType = 'A'
      ekmData.dataChunksA = []
      ekmData.dataChunksB = []
  
      moveToNextMeter()
      const meter = getCurrentMeter()
      sendMeterRequest(meter.hexSerialNumber, meter.rs485HubId)  
    }
  }, config.requestTimeout)
}

const clearChunkReadingInterval = () => {
  clearTimeout(chunkReadingInterval)
  chunkReadingInterval = undefined
}

const randomTrackingId = () => {
  return ('0000'+ Math.floor(Math.random() * 65535).toString(16)).substr(-4)
}

const sendMeterRequest = (meterSerialNumberHex, destination) => {
  const meter = getCurrentMeter()
  let genTrackingId = randomTrackingId()
  let message

  if (meter.version === 3) {
    message = `2F3F${meterSerialNumberHex}210D0A`
  } else {
    // v4 meter.
    message = `2F3F${meterSerialNumberHex}303${ekmData.currentMessageType === 'A' ? 0 : 1}210D0A`
  }

  gateway.sendRS485Request({
    message,
    destination,
    hexEncodePayload: false,
    trackingId: `${genTrackingId}`
  })

  // Set the expected tracking ID for when the reply comes back.
  expectedTrackingId = genTrackingId

  if (meter.version === 3) {
    console.log(`Sent request to ${meterSerialNumberHex} with tracking ID:${genTrackingId}.`)    
  } else {
    console.log(`Sent request for ${ekmData.currentMessageType} message to ${meterSerialNumberHex} with tracking ID:${genTrackingId}.`)
  }

  clearMeterReadingInterval()

  meterReadingInterval = setTimeout(() => {
    meterReadingInterval = undefined

    console.log('Starting a new reading request.')
    retryCount = 0
    ekmData.currentMessageType = 'A'
    ekmData.dataChunksA = []
    ekmData.dataChunksB = []

    moveToNextMeter()
    const meter = getCurrentMeter()
    sendMeterRequest(meter.hexSerialNumber, meter.rs485HubId)
  }, config.requestTimeout)
}

const startNextMeterRequest = () => {
  setTimeout(() => {
    console.log('Starting a new reading request.')
    retryCount = 0
    ekmData.currentMessageType = 'A'
    ekmData.dataChunksA = []
    ekmData.dataChunksB = []
    moveToNextMeter()
    const meter = getCurrentMeter()
    sendMeterRequest(meter.hexSerialNumber, meter.rs485HubId)
  }, config.readingInterval)
}

const onGatewayReady = () => {
  console.log('Gateway is ready to send messages.')
  ekmData.currentMessageType = 'A'

  if (metersEnabled) {
    const meter = getCurrentMeter()
    sendMeterRequest(meter.hexSerialNumber, meter.rs485HubId)
  }
}

const onSensorMessage = sensorMessage => {
  let isMeterReadingMessage = false
  const meterReadingMessages = ['rs485ChunkEnvelopeResponse', 'rs485ChunkResponse']

  if (meterReadingMessages.includes(sensorMessage.type)) {
    isMeterReadingMessage = true
  }

  if ((! metersEnabled) && (isMeterReadingMessage)) {
    // If this gateway is not configured for meter reading, ignore 
    // meter reading messages.
    return
  }

  // Ignore sensor messages...
  //if (sensorMessage.type !== 'rs485ChunkEnvelopeResponse' && sensorMessage.type !== 'rs485ChunkResponse') { return }

  if (isMeterReadingMessage && sensorMessage.hasOwnProperty('trackingId')) {
    // This is a meter reading message with a tracking ID, check to see
    // if it is the message we are expecting...
    if (sensorMessage.trackingId !== expectedTrackingId) {
      console.log(`Ignoring ${sensorMessage.type} message with tracking ID ${sensorMessage.trackingId}, expected tracking ID ${expectedTrackingId}`)
      return
    }
  }

  console.log(sensorMessage)

  try {
    if (sensorMessage.type === 'rs485ChunkEnvelopeResponse') {
      // Stop the timeout.
      clearMeterReadingInterval()
      const meter = getCurrentMeter()

      if (ekmData.currentMessageType === 'A') {
        ekmData.dataChunksA = []
        ekmData.dataChunksB = []
      }
      ekmData.chunkSize = sensorMessage.payload.chunkSize
      ekmData.chunkToRequest = 0
      ekmData.numChunks = sensorMessage.payload.numChunks

      const genTrackingId = randomTrackingId()

      gateway.sendRS485ChunkRequest({
        chunkNumber: ekmData.chunkToRequest,
        chunkSize: ekmData.chunkSize,
        destination: sensorMessage.sensorId,
        trackingId: `${genTrackingId}`
      })

      setChunkReadingInterval()

      if (meter.version === 3) {
        console.log(`Sent request for chunk ${ekmData.chunkToRequest} with tracking ID:${genTrackingId}.`)
      } else {
        console.log(`Sent request for message ${ekmData.currentMessageType} chunk ${ekmData.chunkToRequest} with tracking ID:${genTrackingId}.`)
      }

      // Set the expected tracking ID for when the reply comes back.
      expectedTrackingId = genTrackingId
    } else if (sensorMessage.type === 'rs485ChunkResponse') {
      // Stop the timeout.
      clearChunkReadingInterval()

      const meter = getCurrentMeter()

      if (ekmData.chunkToRequest < (ekmData.numChunks - 1)) {
        if (ekmData.currentMessageType === 'A') {
          ekmData.dataChunksA.push(sensorMessage.payload.data)
        } else {
          ekmData.dataChunksB.push(sensorMessage.payload.data)
        }

        console.log(`Received chunk ${ekmData.chunkToRequest}`)
        ekmData.chunkToRequest++

        const genTrackingId = randomTrackingId()

        gateway.sendRS485ChunkRequest({
          chunkNumber: ekmData.chunkToRequest,
          chunkSize: ekmData.chunkSize,
          destination: sensorMessage.sensorId,
          trackingId: `${genTrackingId}`
        })

        setChunkReadingInterval()

        if (meter.version === 3) {
          console.log(`Sent request for chunk ${ekmData.chunkToRequest} with tracking ID:${genTrackingId}.`)
        } else {
          console.log(`Sent request for message ${ekmData.currentMessageType} chunk ${ekmData.chunkToRequest} with tracking ID:${genTrackingId}.`)
        }

        // Set the expected tracking ID for when the reply comes back.
        expectedTrackingId = genTrackingId
      } else {
        console.log(`Received chunk ${ekmData.chunkToRequest}`)

        // Drop the last byte from the final chunk.
        if (ekmData.currentMessageType === 'A') {
          ekmData.dataChunksA.push(sensorMessage.payload.data.substring(0, sensorMessage.payload.data.length - 2))
        } else {
          ekmData.dataChunksB.push(sensorMessage.payload.data.substring(0, sensorMessage.payload.data.length - 2))
        }
    
        if (ekmData.currentMessageType === 'A') {
          // Check CRC on A message
          if (! ekmdecoder.crcCheck(ekmData.dataChunksA.join(''))) {
            console.log(`Meter message ${meter.version === 4 ? 'A' : ''} CRC check failed, skipping this meter for now.`)
            startNextMeterRequest()
          } else {
            console.log(`Meter message ${meter.version === 4 ? 'A' : ''} CRC check passed.`)

            if (meter.version === 3) {
              // All done here for a v3 meter.
              sendToAPI({
                type: 'meter',
                meterModel: 'ekm3',
                timestamp: sensorMessage.timestamp,
                sensorId: sensorMessage.sensorId,
                sequenceNumber: sensorMessage.sequenceNumber,
                payload: {
                  battery: sensorMessage.payload.battery,
                  ...ekmdecoder.decodeV3Message(ekmData.dataChunksA.join(''))
                }
              })
      
              // Set off the reading process again.
              startNextMeterRequest()
            } else {
              // Send EKM v4 meter message type B
              ekmData.currentMessageType = 'B'
              sendMeterRequest(meter.hexSerialNumber, meter.rs485HubId)
            }
          }
        } else {
          if (! ekmdecoder.crcCheck(ekmData.dataChunksB.join(''))) {
            console.log('Meter message B CRC check failed, skipping this meter for now.')
            startNextMeterRequest()
          } else {
            console.log('Meter message B CRC check passed.')
            // We now have the complete meter reading.
            sendToAPI({
              type: 'meter',
              meterModel: 'ekm4',
              timestamp: sensorMessage.timestamp,
              sensorId: sensorMessage.sensorId,
              sequenceNumber: sensorMessage.sequenceNumber,
              payload: {
                battery: sensorMessage.payload.battery,
                ...ekmdecoder.decodeV4Message(ekmData.dataChunksA.join(''), ekmData.dataChunksB.join(''))
              }
            })
    
            // Set off the reading process again.
            startNextMeterRequest()
          }
        }
      }
    } else {
      // This is a normal message.
      sendToAPI(sensorMessage)
    }
  } catch (err) {
    console.error('Error occurred sending message to API:')
    console.error(err)
  }
}

// Load configuration file.
try {
  config = require('./config.json')
} catch (e) {
  console.error('Failed to load config.json!')
  process.exit(1)
}

// Verify configuration file.
verifyConfig()

// Load meters file.
try {
  meterMappings = require('./meters.json')
} catch (e) {
  console.error('Failed to load meters.json!')
  process.exit(1)
}

// Verify meters file.
verifyMeterMappings()

gateway.runGateway({
  onSensorMessage,
  onGatewayReady,
  useTrackingId: true,
  useFahrenheitTemps: config.useFahrenheitTemps,
  sendStatusMessages: config.sendStatusMessages,
  sendEventCount: config.sendEventCount,
  sendRawData: config.sendRawData,
  sendHopData: config.sendHopData,
  useMillisecondTimestamps: config.useMillisecondTimestamps
})
