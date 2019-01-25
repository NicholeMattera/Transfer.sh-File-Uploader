// Transfer.sh File Uploader
// Copyright (C) 2019 Steven Mattera
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

const express = require('express')
const busboy = require('connect-busboy')
const influx = require('influx')
const v1 = require('./routes/v1.route')
const config = require('./config.json')

// Setup Influx
let influxdb = null
if (config.influxdb) {
    influxdb = new influx.InfluxDB(config.influxdb)
}

const app = express()
app.use(busboy())
app.set('etag', false)

// Remove express header and prevent caching
app.use((req, res, next) => {
    res.removeHeader('X-Powered-By')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    next()
})

// Record traffic to InfluxDB
app.use((req, res, next) => {
    if (!influxdb) {
        next()
    }

    req.influxdb = influxdb

    influxdb.writeMeasurement('visit', [{
        tags: { path: req.path },
        fields: { count: 1 },
        timestamp: new Date()
    }])

    next()
})

app.use('/v1', v1)

app.listen(config.portNumber, () => {
    console.log(`Server is listening on ${ config.portNumber }`)
})
