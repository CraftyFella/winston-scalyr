# winston-scalyr

A [Scalyr][0] transport for [winston][1]

## Getting started

Install the [winston-scalyr](https://www.npmjs.com/package/winston-scalyr) package from npm:

``` bash
  $ npm install winston-scalyr
```

To configure the transport

```javascript
const winston = require('winston')
const scalyr = require('winston-scalyr')
const transports = []
transports.push(
    new scalyr.ScalyrTransport({
      logfile: 'your-service-name',
      serverHost: os.hostname(),
      session: `something-unique-host-version-service-name`,
      token: 'your-secret-token-from-scalyr'
    })
winston.createLogger({
  level: 'info',
  transports
})
```
**logfile** The name of the log file being written to. This will probably be the name of your service.

**serviceHost** machine the service is running on

**session** This should be unique for this service, version and host

**token** "Write Logs" API token. Find API tokens at [https://www.scalyr.com/keys][2].

### Optional parameters

**maxBatchSize** The maximum number of events to include in a single batch.

**frequencyMs** The time to wait between checking for event batches.

**sessionInfo** Additional information about the session. See [https://www.scalyr.com/help/api][3]

**level** Level of messages that this transport should log.

**autoStart** Allows you to manually call flush, or close the logger to push all logs.

[0]: https://www.scalyr.com
[1]: https://github.com/flatiron/winston
[2]: https://www.scalyr.com/keys
[3]: https://www.scalyr.com/help/api

## Building

### Requirements

* yarn
* typescript
* node 10 or greater

clone to repository

then run `./build.sh`

This should install the modules via yarn, run the tests and create the package

### Examples

Both examples require an environment variable setup for the `SCALYR_TOKEN`

```
export SCALYR_TOKEN=my-token
```

#### Simple

```node build/simple.js```

#### Restify

```node build/restify.js```