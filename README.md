# Conectric Gateway for Node.js

Gateway code to receive sensor and EKM v4 meter readings from the Conectric mesh network and forward it to a HTTP POST API.

Message formats to send to the API, and the format of the API URL used are configured in a file called `clientimpl.js`, described in the "Setup" section.

## Installation

Clone this repo then:

```
cd <directory where repo was cloned to>
npm install
```

Note that if you are upgrading from an older version of this software, you should run `rm -rf node_modules` before running `npm install`.  This ensures that you have all of the dependencies at their expected versions.

## Setup

Plug a Conectric USB router into an available USB port.

Edit `config.json` to set the correct API base URL and other parameters.  Edit `meters.json` to include your EKM v4 meters.

Then:

```
$ npm install
$ npm start
```

## config.json

Contains configurable parameters.

```
{
    "apiUrl": "<API URL to post data to> e.g. https://mydomain.com/api/endpoint",
    "requestTimeout": <Seconds that a meter read can run for before being considered timed out, min 1>,
    "readingInterval": <Seconds between successfully reading a meter and starting the next read, min 1>,
    "useMillisecondTimestamps": <true to use millisecond precision timestamps, false for second precision>,
    "useFahrenheitTemps": <true for Fahrenheit temperature data, false for Celsius>,
    "sendStatusMessages": <true to enable sensor status message processing, false to disable>,
    "sendEventCount": <true to send event count information, false to disable>,
    "sendRawData": <true to send raw undecoded message data in messages, false to disable>,
    "sendHopData": <true to send hop count data in messages, false to disable>
}
```

You may also add your own extra parameters in, which can be referenced in your customized `clientimpl.js` file.

## meters.json

Contains an array of EKM v4 meters to be read, and information about which RS485 hub each meter is connected to.

```
{
    "meters": [
        {
            "serialNumber": "000300004299",
            "rs485HubID": "0000",
            "version": 4,
            "password": "00000000",
            "ctRatio": 100
        },
        ...
    ]
}
```

The values `password` and `ctRatio` are optional, and used by a separate configuration tool that sets the meter's CT ratio.  Values are as follows:

* `password`: An eight digit number, default meter password is 00000000.
* `ctRatio`: The CT ratio that should be set for the meter, values are between 100 and 5000.

To run this without any meters, use:

```
{
    "meters": [
    ]
}
```

### clientImpl.js

This file exports two functions that the gateway code requires you to provide implementations for:

* `formatPayload` should perform any required transformations on the message payload that is to be sent to the API.
* `buildApiUrl` should return the full URL of the API endpoint to post a message to.

A stub implementation of each is provided in the file `clientImpl_template.js`.  You should copy this to `clientImpl.js` and add your own specific code here.

Both functions have access to the moment library for date formatting. `buildApiUrl` additionally has access to any values that you add to `config.json` so you should put API keys etc in here and reference them in your code using the `config` object.