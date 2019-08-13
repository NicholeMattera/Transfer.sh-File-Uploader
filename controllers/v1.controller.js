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

const request = require('request')

module.exports.postUpload = (req, res) => {
    let fileFound = false

    req.pipe(req.busboy)
    req.busboy.on('file', (fieldName, file, fileName) => {
        if (fieldName == 'file') {
            fileFound = true
            
            request.put(`https://transfer.sh/${ fileName }`, { body: file }, (err, httpResponse, body) => {
                if (err) {
                    res.status(500)
                    res.send(err)
                    return
                }

                if (httpResponse.statusCode !== 200) {
                    res.status(500)
                    res.send(`Did not recieve 200 from transfer.sh. (${ httpResponse.statusCode })`)
                    return
                }

                res.status(200)
                res.send(body)
                return
            })
        }
    })

    req.busboy.on('finish', () => {
        if (!fileFound) {
            res.status(400)
            res.send('Bad Request')
            return
        }
    })
}