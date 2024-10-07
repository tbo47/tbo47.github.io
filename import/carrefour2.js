const fs = require('fs')

const fetchData = async () => {
    const shops = JSON.parse(fs.readFileSync('carrefour.json'))
    const output = []
    console.log(shops)
    output.push(`<h2>Missing OSM website</h2>`)
    shops.map((shop) => {
        const { f, lon, lat, osm, osm_area } = shop
        if (osm && !osm.website) {
            output.push(`<a href="${osm.osm_url_edit}" target="osmedit">${osm.osm_url_edit}</a><br>${f.properties.contact.website} <br><br>`)
        }
    })
    output.push(`<h2>Missing OSM poi</h2>`)
    shops.map((shop) => {
        const { f, lon, lat, osm, osm_area } = shop
        if (!osm) {
            output.push(`<a href="${osm_area}" target="osmarea">${osm_area}</a><br>${f.properties.contact.website}<br><br>`)
        }
    })
    fs.writeFileSync(`carrefour.html`, `<html><body>` + output.join('') + `</body></html>`)
    return output
}

fetchData()
