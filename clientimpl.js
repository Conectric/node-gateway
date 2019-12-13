// Template implementation.
const moment = require('moment')

const formatPayload = payload => {
  // Add custom payload formatting logic here.  To see what's
  // in payload, simply console.log it here.
  return payload
}

const buildAPIURL = (config, payload) => {
  // Add custom API URL creation logic here.  Has access
  // to the config.json file through 'config', and the 
  // results of calling formatPayload on the message payload
  // through 'payload'.  This can access any value in config.json
  // as config.<name>.  To see what's in payload, simply 
  // console.log it here.
  return config.apiUrl
}

const buildAPIHeaders = (config, payload) => {
  // Returns an object describing HTTP headers to be 
  // added when calling the API URL returned by 
  // buildAPIURL.  If none are required, simply return 
  // an empty object.  Has access to the config.json 
  // file through 'config', and the results of calling 
  // formatPayload on the message payload through 'payload'.

  // Example:
  // { 'x-some-header-name': 'secretpassword' }

  return {
    'x-some-secret-header': config.apiToken
  }
}

const getAPIVerb = () => {
  // Should return 'POST' or 'PUT'.  This is the HTTP
  // verb that will be used when calling the API.

  return 'POST'
}

const onMeterReadFail = (meterSerialNumber) => {
  // Called whenever a meter reading fails due to a 
  // message not being received after the configurable
  // number of retries has been reached.

  console.log(`Meter reading failed for meter ${meterSerialNumber}`)
}

module.exports = {
  formatPayload,
  buildAPIURL,
  buildAPIHeaders,
  getAPIVerb,
  onMeterReadFail
}