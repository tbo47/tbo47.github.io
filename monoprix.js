const fs = require('fs')

const FILE_JSON = 'monoprix.json'
const FILE_HTML = 'monoprix.html'

const fetchInfo = async () => {
    let output = ''
    for (let i = 1; i < 3_000; i++) {
        const url = `https://api.woosmap.com/stores/${i}?key=woos-ef21433b-45e1-3752-851f-6653279c035a`
        const response = await fetch(url, { headers: { Referer: 'https://www.monoprix.fr/' } })
        try {
            output += JSON.stringify(await response.json()) + ','
        } catch (e) {}
    }
    fs.writeFileSync(FILE_JSON, '[' + output + ']')
}

const parseInfo = () => {
    const raw = fs.readFileSync(FILE_JSON)
    const dataArray = JSON.parse(raw)
    let output = ''
    dataArray.forEach((data) => {
        const [lon, lat] = data.geometry.coordinates
        const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=19/${lat}/${lon}`
        output += `<a href="${osmUrl}">${osmUrl}</a><br>`
        const { phone, website } = data.properties.contact
        output += `${phone} <a href="${website}">${website}</a><br><br>`
    })
    fs.writeFileSync(FILE_HTML, '<html><body>' + output + '</body></html>')
}

const main = async () => {
    await fetchInfo()
    parseInfo()
}

main()
