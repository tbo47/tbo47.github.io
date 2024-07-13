const fs = require('fs')

const BASE = `https://www.magasins-u.com/`
const FILE_JSON = 'u.json'

const fetchInfo = async () => {
    const output = []
    const url = BASE + `annuaire-magasin.m21635`
    const response = await fetch(url, { headers: { Referer: BASE } })
    const content = await response.text()
    const shopLinks = content
        .split('\n')
        .filter((line) => line.includes('u-list-magasin__link'))
        .map((l) => l.split('"')[3])

    const promises = shopLinks.map(async (shopLink) => {
        try {
            const r = await fetch(shopLink, { headers: { Referer: BASE } })
            const c = await r.text()
            const rawCoord = c.split('\n').find((line) => line.includes('google.com/maps'))
            const [lon, lat] = rawCoord
                .split('"')[1]
                .split('=')[2]
                .split('%2C')
                .map((co) => parseFloat(co))
            const shop = { shopLink, lon, lat }
            console.log(shop)
            output.push(shop)
        } catch (e) {}
    })
    await Promise.all(promises)
    fs.writeFileSync(FILE_JSON, JSON.stringify(output))
}

fetchInfo()
