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

module.exports = {
  formatPayload,
  buildAPIURL
}