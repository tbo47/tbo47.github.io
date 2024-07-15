const fs = require('fs')

const fetchData = async () => {
    const shops = JSON.parse(fs.readFileSync('monoprix.json'))
    const output = []
    shops.map((shop) => {
        const [lon, lat] = shop.geometry.coordinates
        const { phone, website } = shop.properties.contact
        const { osm } = shop
        if (osm && osm.website !== website) {
            output.push(`<a href="${website}" target="_blank">${shop.properties.name}</a> | ${phone} | `)
            output.push(`<a href="${osm.osm_url}" target="_blank">${osm.brand}</a><br>`)
        }
    })
    fs.writeFileSync(`monoprix.html`, `<html><body>` + output.join('') + `</body></html>`)
}

fetchData()
