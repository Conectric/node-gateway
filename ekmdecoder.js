const roundTo = require('round-to')

const ekmdecoder = {
  subMeterV3Mapping: [
    { fieldName: 'model',             startPos:   2, endPos: 5,   isHexNumber: true                                   },
    { fieldName: 'firmware',          startPos:   6, endPos: 7,   isHexNumber: true,                  isNumeric: true },
    { fieldName: 'meter_address',     startPos:   8, endPos: 31,  decode: true                                        },
    { fieldName: 'kwh_tot',           startPos:  32, endPos: 47,  decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'kwh_tariff_1',      startPos:  48, endPos: 63,  decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'kwh_tariff_2',      startPos:  64, endPos: 79,  decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'kwh_tariff_3',      startPos:  80, endPos: 95,  decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'kwh_tariff_4',      startPos:  96, endPos: 111, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'rev_kwh_tot',       startPos: 112, endPos: 127, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'rev_kwh_tariff_1',  startPos: 128, endPos: 143, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'rev_kwh_tariff_2',  startPos: 144, endPos: 159, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'rev_kwh_tariff_3',  startPos: 160, endPos: 175, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'rev_kwh_tariff_4',  startPos: 176, endPos: 191, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'rms_volts_ln_1',    startPos: 192, endPos: 199, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'rms_volts_ln_2',    startPos: 200, endPos: 207, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'rms_volts_ln_3',    startPos: 208, endPos: 215, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'amps_ln_1',         startPos: 216, endPos: 225, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'amps_ln_2',         startPos: 226, endPos: 235, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'amps_ln_3',         startPos: 236, endPos: 245, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'rms_watts_ln_1',    startPos: 246, endPos: 259, decode: true,                       isNumeric: true },
    { fieldName: 'rms_watts_ln_2',    startPos: 260, endPos: 273, decode: true,                       isNumeric: true },
    { fieldName: 'rms_watts_ln_3',    startPos: 274, endPos: 287, decode: true,                       isNumeric: true },
    { fieldName: 'rms_watts_tot',     startPos: 288, endPos: 301, decode: true,                       isNumeric: true },
    { fieldName: 'cos_theta_ln_1',    startPos: 304, endPos: 309, decode: true,     decimalPlaces: 2, isNumeric: true },
    { fieldName: 'cos_theta_ln_2',    startPos: 312, endPos: 317, decode: true,     decimalPlaces: 2, isNumeric: true },
    { fieldName: 'cos_theta_ln_3',    startPos: 320, endPos: 325, decode: true,     decimalPlaces: 2, isNumeric: true },
    { fieldName: 'max_demand',        startPos: 326, endPos: 341, decode: true,     decimalPlaces: 1, isNumeric: true },
    { fieldName: 'max_demand_period', startPos: 342, endPos: 343, decode: true,                       isNumeric: true },
    { fieldName: 'meter_time',        startPos: 344, endPos: 371, decode: true,                                       },
    { fieldName: 'ct_ratio',          startPos: 372, endPos: 379, decode: true,                       isNumeric: true },
    { fieldName: 'pulse_cnt_1',       startPos: 380, endPos: 395, decode: true,                       isNumeric: true },
    { fieldName: 'pulse_cnt_2',       startPos: 396, endPos: 411, decode: true,                       isNumeric: true },
    { fieldName: 'pulse_cnt_3',       startPos: 412, endPos: 427, decode: true,                       isNumeric: true },
    { fieldName: 'pulse_ratio_1',     startPos: 428, endPos: 435, decode: true,                       isNumeric: true },
    { fieldName: 'pulse_ratio_2',     startPos: 436, endPos: 443, decode: true,                       isNumeric: true },
    { fieldName: 'pulse_ratio_3',     startPos: 444, endPos: 451, decode: true,                       isNumeric: true },            
    { fieldName: 'state_inputs',      startPos: 452, endPos: 457, decode: true,                       isNumeric: true }
    // { fieldName: 'reserved',          startPos: 458, endPos: 497, decode: false                                       },
    // { fieldName: 'unknown',           startPos: 498, endPos: 505, decode: false                                       },            
    // { fieldName: 'crc',               startPos: 506, endPos: 509, isHexNumber: true                                   }
  ],

  subMeterV4aMapping: [
    { fieldName: 'kwh_scale',              startPos: 460, endPos: 461, decode: true,                   isNumeric: true },
    { fieldName: 'model',                  startPos:   2, endPos:  5,  isHexNumber: true                               },
    { fieldName: 'firmware',               startPos:   6, endPos:  7,  isHexNumber: true,              isNumeric: true },
    { fieldName: 'meter_address',          startPos:   8, endPos:  31, decode: true                                    },
    { fieldName: 'kwh_tot',                startPos:  32, endPos:  47, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'reactive_energy_tot',    startPos:  48, endPos:  63, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'rev_kwh_tot',            startPos:  64, endPos:  79, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'kwh_ln_1',               startPos:  80, endPos:  95, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'kwh_ln_2',               startPos:  96, endPos: 111, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'kwh_ln_3',               startPos: 112, endPos: 127, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'rev_kwh_ln_1',           startPos: 128, endPos: 143, decode: true, decimalPlaces: -1, isNumeric: true }, 
    { fieldName: 'rev_kwh_ln_2',           startPos: 144, endPos: 159, decode: true, decimalPlaces: -1, isNumeric: true }, 
    { fieldName: 'rev_kwh_ln_3',           startPos: 160, endPos: 175, decode: true, decimalPlaces: -1, isNumeric: true }, 
    { fieldName: 'resettable_kwh_tot',     startPos: 176, endPos: 191, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'resettable_rev_kwh_tot', startPos: 192, endPos: 207, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'rms_volts_ln_1',         startPos: 208, endPos: 215, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
    { fieldName: 'rms_volts_ln_2',         startPos: 216, endPos: 223, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
    { fieldName: 'rms_volts_ln_3',         startPos: 224, endPos: 231, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
    { fieldName: 'amps_ln_1',              startPos: 232, endPos: 241, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
    { fieldName: 'amps_ln_2',              startPos: 242, endPos: 251, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
    { fieldName: 'amps_ln_3',              startPos: 252, endPos: 261, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
    { fieldName: 'rms_watts_ln_1',         startPos: 262, endPos: 275, decode: true,                   isNumeric: true },
    { fieldName: 'rms_watts_ln_2',         startPos: 276, endPos: 289, decode: true,                   isNumeric: true },
    { fieldName: 'rms_watts_ln_3',         startPos: 290, endPos: 303, decode: true,                   isNumeric: true },
    { fieldName: 'rms_watts_tot',          startPos: 304, endPos: 317, decode: true,                   isNumeric: true },
    { fieldName: 'power_factor_ln_1',      startPos: 318, endPos: 325, decode: true, decimalPlaces: 2                  },
    { fieldName: 'power_factor_ln_2',      startPos: 326, endPos: 333, decode: true, decimalPlaces: 2                  },
    { fieldName: 'power_factor_ln_3',      startPos: 334, endPos: 341, decode: true, decimalPlaces: 2                  },
    { fieldName: 'reactive_pwr_ln_1',      startPos: 342, endPos: 355, decode: true,                   isNumeric: true },
    { fieldName: 'reactive_pwr_ln_2',      startPos: 356, endPos: 369, decode: true,                   isNumeric: true },
    { fieldName: 'reactive_pwr_ln_3',      startPos: 370, endPos: 383, decode: true,                   isNumeric: true },  
    { fieldName: 'reactive_pwr_tot',       startPos: 384, endPos: 397, decode: true,                   isNumeric: true },
    { fieldName: 'line_freq',              startPos: 398, endPos: 405, decode: true, decimalPlaces: 2, isNumeric: true, divisor: 1 },
    { fieldName: 'pulse_cnt_1',            startPos: 406, endPos: 421, decode: true,                   isNumeric: true },
    { fieldName: 'pulse_cnt_2',            startPos: 422, endPos: 437, decode: true,                   isNumeric: true },
    { fieldName: 'pulse_cnt_3',            startPos: 438, endPos: 453, decode: true,                   isNumeric: true },
    { fieldName: 'state_inputs',           startPos: 454, endPos: 455, decode: true,                   isNumeric: true },
    { fieldName: 'state_watts_dir',        startPos: 456, endPos: 457, decode: true,                   isNumeric: true },
    { fieldName: 'state_out',              startPos: 458, endPos: 459, decode: true,                   isNumeric: true },
    { fieldName: 'kwh_scale',              startPos: 460, endPos: 461, decode: true,                   isNumeric: true },
  //  { fieldName: 'reserved_a',             startPos: 462, endPos: 465, decode: false                                   },
    { fieldName: 'meter_time',             startPos: 466, endPos: 493, decode: true,                                   }
  //  { fieldName: 'reserved_b',             startPos: 494, endPos: 505, decode: false                                   },
  //  { fieldName: 'crc',                    startPos: 506, endPos: 509, isHexNumber: true                               }
  ],

  subMeterV4bMapping: [
  //  { fieldName: 'model',                 startPos:   2, endPos:   5, isHexNumber: true },
  //  { fieldName: 'firmware',              startPos:   6, endPos:   7, isHexNumber: true },
  //  { fieldName: 'meter_address',         startPos:   8, endPos:  31, decode: true },
    { fieldName: 'kwh_tariff_1',          startPos:  32, endPos:  47, decode: true, decimalPlaces: 1, isNumeric: true },
    { fieldName: 'kwh_tariff_2',          startPos:  48, endPos:  63, decode: true, decimalPlaces: 1, isNumeric: true },
    { fieldName: 'kwh_tariff_3',          startPos:  64, endPos:  79, decode: true, decimalPlaces: 1, isNumeric: true },
    { fieldName: 'kwh_tariff_4',          startPos:  80, endPos:  95, decode: true, decimalPlaces: 1, isNumeric: true },
    { fieldName: 'rev_kwh_tariff_1',      startPos:  96, endPos: 111, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'rev_kwh_tariff_2',      startPos: 112, endPos: 127, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'rev_kwh_tariff_3',      startPos: 128, endPos: 143, decode: true, decimalPlaces: -1, isNumeric: true },
    { fieldName: 'rev_kwh_tariff_4',      startPos: 144, endPos: 159, decode: true, decimalPlaces: -1, isNumeric: true },
  //  { fieldName: 'rms_volts_ln_1',        startPos: 160, endPos: 167, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
  //  { fieldName: 'rms_volts_ln_2',        startPos: 168, endPos: 175, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
  //  { fieldName: 'rms_volts_ln_3',        startPos: 176, endPos: 183, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
  //  { fieldName: 'amps_ln_1',             startPos: 184, endPos: 193, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
  //  { fieldName: 'amps_ln_2',             startPos: 194, endPos: 203, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
  //  { fieldName: 'amps_ln_3',             startPos: 204, endPos: 213, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1 },
  //  { fieldName: 'rms_watts_ln_1',        startPos: 214, endPos: 227, decode: true,                   isNumeric: true },
  //  { fieldName: 'rms_watts_ln_2',        startPos: 228, endPos: 241, decode: true,                   isNumeric: true },
  //  { fieldName: 'rms_watts_ln_3',        startPos: 242, endPos: 255, decode: true,                   isNumeric: true },
  //  { fieldName: 'rms_watts_tot',         startPos: 256, endPos: 269, decode: true,                   isNumeric: true },
    { fieldName: 'cos_theta_ln_1',        startPos: 272, endPos: 277, decode: true, decimalPlaces: 2, isNumeric: true },
    { fieldName: 'cos_theta_ln_2',        startPos: 280, endPos: 285, decode: true, decimalPlaces: 2, isNumeric: true },
    { fieldName: 'cos_theta_ln_3',        startPos: 288, endPos: 293, decode: true, decimalPlaces: 2, isNumeric: true },
    { fieldName: 'rms_watts_max_demand',  startPos: 294, endPos: 309, decode: true, decimalPlaces: 1, isNumeric: true, divisor: 1},
    { fieldName: 'max_demand_period',     startPos: 310, endPos: 311, decode: true,                   isNumeric: true },
    { fieldName: 'pulse_ratio_1',         startPos: 312, endPos: 319, decode: true,                   isNumeric: true },
    { fieldName: 'pulse_ratio_2',         startPos: 320, endPos: 327, decode: true,                   isNumeric: true },
    { fieldName: 'pulse_ratio_3',         startPos: 328, endPos: 335, decode: true,                   isNumeric: true },
    { fieldName: 'ct_ratio',              startPos: 336, endPos: 343, decode: true,                   isNumeric: true },
    { fieldName: 'auto_reset_max_demand', startPos: 344, endPos: 345, decode: true,                   isNumeric: true },
    { fieldName: 'pulse_output_ratio',    startPos: 346, endPos: 353, decode: true,                   isNumeric: true },
  //  { fieldName: 'reserved',              startPos: 354, endPos: 465, decode: false },
  //  { fieldName: 'meter_time',            startPos: 466, endPos: 493, decode: true,                                    },
  //  { fieldName: 'type',                  startPos: 494, endPos: 497, decode: false },
  //  { fieldName: 'end',                   startPos: 498, endPos: 505, decode: false }
  ],

  haystackMapping: {
    id: { fields: ['meter_address'] },
    volt_A: { fields: ['rms_volts_ln_1'] },
    volt_B: { fields: ['rms_volts_ln_2'] },
    volt_C: { fields: ['rms_volts_ln_3'] },
    current_A: { fields: ['amps_ln_1'] },
    current_B: { fields: ['amps_ln_2'] },
    current_C: { fields: ['amps_ln_3'] },
    power_A: { fields: ['rms_watts_ln_1'], transform: val => val / 1000 },
    power_B: { fields: ['rms_watts_ln_2'], transform: val => val / 1000 },
    power_C: { fields: ['rms_watts_ln_3'], transform: val => val / 1000 },
    reactive_power_A: { fields: ['reactive_pwr_ln_1'], transform: val => val / 1000 },
    reactive_power_B: { fields: ['reactive_pwr_ln_2'], transform: val => val / 1000 },
    reactive_power_C: { fields: ['reactive_pwr_ln_3'], transform: val => val / 1000 },
    pf_A: { fields: ['cos_theta_ln_1'] },
    pf_B: { fields: ['cos_theta_ln_2'] },
    pf_C: { fields: ['cos_theta_ln_3'] },
    power: { fields: ['rms_watts_tot'], transform: val => val / 1000 },
    power_reactive: { fields: ['reactive_pwr_tot'], transform: val => val / 1000 },
    state_current_dir: { fields: ['state_watts_dir'] },
    freq: { fields: ['line_freq'] },
    power_max: { fields: ['max_demand', 'rms_watts_max_demand'], transform: val => val / 1000 },
    power_max_period: { fields: ['max_demand_period'] },
    power_max_auto_reset: { fields: ['auto_reset_max_demand'] },
    energy_A: { fields: ['kwh_ln_1'] },
    energy_B: { fields: ['kwh_ln_2'] },
    energy_C: { fields: ['kwh_ln_3'] },
    energy: { fields: ['kwh_tot'] },
    power_reactive_h: { fields: ['reactive_energy_tot'] },
    energy_tariff_1: { fields: ['kwh_tariff_1'] },
    energy_tariff_2: { fields: ['kwh_tariff_2'] },
    energy_tariff_3: { fields: ['kwh_tariff_3'] },
    energy_tariff_4: { fields: ['kwh_tariff_4'] },
    energy_export_A: { fields: ['rev_kwh_ln_1'] },
    energy_export_B: { fields: ['rev_kwh_ln_2'] },
    energy_export_C: { fields: ['rev_kwh_ln_3'] },
    energy_export: { fields: ['rev_kwh_tot'] },
    energy_export_tariff_1: { fields: ['rev_kwh_tariff_1'] },
    energy_export_tariff_2: { fields: ['rev_kwh_tariff_2'] },
    energy_export_tariff_3: { fields: ['rev_kwh_tariff_3'] },
    energy_export_tariff_4: { fields: ['rev_kwh_tariff_4'] },
    energy_resettable: { fields: ['resettable_kwh_tot'] },
    energy_export_resettable: { fields: ['resettable_rev_kwh_tot'] },
    state_pulse_inputs: { fields: ['state_inputs'] },
    state_out_cmd: { fields: ['state_out'] },
    pulse_hisTotalized_1: { fields: ['pulse_cnt_1'] },
    pulse_hisTotalized_2: { fields: ['pulse_cnt_2'] },
    pulse_hisTotalized_3: { fields: ['pulse_cnt_3'] },
    pulse_ratio_1: { fields: ['pulse_ratio_1'] },
    pulse_ratio_2: { fields: ['pulse_ratio_2'] },
    pulse_ratio_3: { fields: ['pulse_ratio_3'] },
    pulse_output_ratio: { fields: ['pulse_output_ratio'] },
    sensor_ct_ratio: { fields: ['ct_ratio'] },
    decimal: { fields: ['kwh_scale'] },
    meter_time: { fields: ['meter_time'], transform: (val) => {
      if (! val || val.length !== 14) { 
        return
      }

      // ISO 8601 date, EKM uses 2 digit years so let's get the
      // current UTC century's first two digits...
      return `${new Date().toUTCString().substring(12, 14)}${val.substring(0, 2)}-${val.substring(2, 4)}-${val.substring(4, 6)}T${val.substring(8, 10)}:${val.substring(10, 12)}:${val.substring(12)}.000Z`
    }}
  },

  decodeV3Message: (msgPayload, haystack) => {
    const obj = ekmdecoder.hex2Obj(msgPayload, ekmdecoder.subMeterV3Mapping)

    return (haystack ? ekmdecoder.toHaystack(obj) : obj)
  },

  decodeV4Message: (msgAPayload, msgBPayload, haystack) => {
    let obj = ekmdecoder.hex2Obj(msgAPayload, ekmdecoder.subMeterV4aMapping)
    Object.assign(obj, ekmdecoder.hex2Obj(msgBPayload, ekmdecoder.subMeterV4bMapping, obj.kwh_scale))

    return (haystack ? ekmdecoder.toHaystack(obj) : obj)
  },

  toHaystack: (obj) => {
    const haystackObj = {}

    for (let key of Object.keys(ekmdecoder.haystackMapping)) {
      const candidateKeys = ekmdecoder.haystackMapping[key].fields

      // Default to null if we don't find a value.
      haystackObj[key] = null

      for (let candidateKey of candidateKeys) {
        if (obj.hasOwnProperty(candidateKey)) {
          const transform = ekmdecoder.haystackMapping[key].transform
          haystackObj[key] = transform ? transform(obj[candidateKey]) : obj[candidateKey]
          break
        }
      }
    }

    return haystackObj
  },

  hex2Obj: (h, mapping, kwhScale) => {
    const hex = h.toString()
  
    let res = {}
    let i
  
    for (let currField of mapping) {
      let str = ''
  
      for (i = currField.startPos; i <= currField.endPos; i+=2) {
        if (currField.isHexNumber || ! currField.decode) {
          // Leave this as hex
          str += hex.substr(i, 2)
        } else {
          // Decode this to ASCII
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
        }
      }
  
      if (currField.isHexNumber) {
        // Look at the whole field as a single hex number
        str = `${parseInt(str, 16)}`
      }

      let decimalPlaces = 0

      if (currField.decimalPlaces === -1) {
        decimalPlaces = (kwhScale ? kwhScale : res.kwh_scale)
      } else if (currField.decimalPlaces && currField.decimalPlaces > 0) {
        decimalPlaces = currField.decimalPlaces
      }
  
      if (decimalPlaces > 0) {
        // Insert decimal point at appropriate place
        let dotPos = str.length - decimalPlaces
        str = `${str.substring(0, dotPos)}.${str.substring(dotPos)}`
      } 
  
      // Convert to a number if needed
      if (currField.isNumeric) {
        let val
  
        if (decimalPlaces > 0) {
          // Parse string to float?
          val = parseFloat(str)
        } else {
          val = parseInt(str)
        }

        if (currField.hasOwnProperty('divisor')) {
          val = roundTo((val / currField.divisor), decimalPlaces)
        }
  
        res[currField.fieldName] = val
      } else {
        res[currField.fieldName] = str
      }
    }
  
    return res
  },

  // EKM CRC-16 Table
  CRCTABLE: [
    0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241,
    0xc601, 0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440,
    0xcc01, 0x0cc0, 0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40,
    0x0a00, 0xcac1, 0xcb81, 0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841,
    0xd801, 0x18c0, 0x1980, 0xd941, 0x1b00, 0xdbc1, 0xda81, 0x1a40,
    0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01, 0x1dc0, 0x1c80, 0xdc41,
    0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0, 0x1680, 0xd641,
    0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081, 0x1040,
    0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240,
    0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441,
    0x3c00, 0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41,
    0xfa01, 0x3ac0, 0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840,
    0x2800, 0xe8c1, 0xe981, 0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41,
    0xee01, 0x2ec0, 0x2f80, 0xef41, 0x2d00, 0xedc1, 0xec81, 0x2c40,
    0xe401, 0x24c0, 0x2580, 0xe541, 0x2700, 0xe7c1, 0xe681, 0x2640,
    0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0, 0x2080, 0xe041,
    0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281, 0x6240,
    0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441,
    0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41,
    0xaa01, 0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840,
    0x7800, 0xb8c1, 0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41,
    0xbe01, 0x7ec0, 0x7f80, 0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40,
    0xb401, 0x74c0, 0x7580, 0xb541, 0x7700, 0xb7c1, 0xb681, 0x7640,
    0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101, 0x71c0, 0x7080, 0xb041,
    0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0, 0x5280, 0x9241,
    0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481, 0x5440,
    0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40,
    0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841,
    0x8801, 0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40,
    0x4e00, 0x8ec1, 0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41,
    0x4400, 0x84c1, 0x8581, 0x4540, 0x8701, 0x47c0, 0x4680, 0x8641,
    0x8201, 0x42c0, 0x4380, 0x8341, 0x4100, 0x81c1, 0x8081, 0x4040
],

  ekm_calc_crc16: (buf) => {
    var crc = 0xffff
    for (var i = 0, len = buf.length; i < len; i++) {
      var c = buf[i]
      var index = (crc ^ c.charCodeAt( 0 )) & 0xff
      var crct = ekmdecoder.CRCTABLE[index]
      crc=(crc>>8)^crct
    }
    crc = (crc << 8) | (crc >> 8)
    crc &= 0x7F7F
    return crc
  },

  crcCheck: (msg) => {
    if (! msg || msg.length % 2 !== 0) {
      return false
    }

    let buf = ''

    // Start from the second byte and omit the final 2 bytes.
    for (let n = 2; n < msg.length - 4; n += 2) {
      buf = `${buf}${String.fromCharCode(parseInt(msg.substring(n, n + 2), 16))}`
    }

    let checkSumBytes = msg.substring(msg.length - 4)
    const calculatedCrc = ekmdecoder.ekm_calc_crc16(buf).toString(16)

    while (checkSumBytes.startsWith('0')) {
      checkSumBytes = checkSumBytes.substring(1)
    }

    const result = checkSumBytes === calculatedCrc

    return result
  }
}

module.exports = ekmdecoder
