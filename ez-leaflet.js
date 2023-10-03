// Description: A library to query open data sources (wikipedia, openstreetmap, wikimedia...).

/**
 * Get the current location of the user. Will only work on https or localhost.
 * @returns { latitude, longitude }
 */
export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => resolve(position.coords))
        } else {
            reject('Geolocation is not supported by this browser.')
        }
    })
}

export const getCurrentOsmPositionLink = async (z = 17) => {
    const { latitude, longitude } = await getCurrentPosition()
    return `https://www.openstreetmap.org/#map=${z}/${latitude}/${longitude}`
}

/**
 * 
 * @returns {Promise.<{map, bounds}>}
 */
export const leafletInitMap = () => {
    return new Promise((resolve, reject) => {
        const map = L.map('map').fitWorld()

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map)

        map.on('locationfound', e => {
            L.circle(e.latlng, e.accuracy / 2).addTo(map)
            resolve({ map, ...e })
        })
        map.on('locationerror', e => reject(e))
        map.locate({ setView: true, maxZoom: 16 })
    })
}

export const leafletAddPOIsToTheMap = (map, pois) => {
    const lg = L.layerGroup()
    const markers = new Map()
    pois.filter(p => p.lat && p.lon).forEach(p => {
        const extra = []
        extra.push(`<a href="${p.osm_url}" target="osm" title="Contribute on openstreetmap">osm</a>`)
        if (p.website) extra.push(`<a href="${p.website}" target="w" title="Visit the website">web</a>`)
        const addr = p[`addr:street`] ? (p[`addr:housenumber`] || ``) + ' ' + p[`addr:street`] : ``
        const name = p.name?.replaceAll(`&`, ` `)
        if (addr) {
            extra.push(`<a href="https://www.google.com/search?q=${name} ${addr}" target="g" title="Search in google">g</a>`)
            extra.push(`<a href="https://www.bing.com/search?q=${name} ${addr}" target="b" title="Search in bing">b</a>`)
        }
        const cuisine = p.cuisine ? `<div>${p.cuisine.split(';').join(', ')}</div>` : ``
        const html = `<div>${p.name}</div><div>${cuisine}</div><div>${extra.join(" | ")}`
        const marker = L.marker([p.lat, p.lon]).bindPopup(html).addTo(lg)
        markers.set(p, marker)
    })
    lg.addTo(map)
    return markers
}

/**
 * Add wikipedia articles to the map.
 * @param {*} map 
 * @param {Array.<title, lat, lon>} articles 
 * @returns {Map.<title, L.marker>}
 */
export const leafletAddWikipediaArticlesToTheMap = (map, articles) => {
    const lg = L.layerGroup()
    const markers = new Map()
    articles.forEach(({ url, title, lat, lon }) => {
        const html = `<div><a href="${url}" target="osm" title="Wiki">${title}</a></div>`
        const marker = L.marker([lat, lon]).bindPopup(html).addTo(lg)
        markers.set(title, marker)
    })
    lg.addTo(map)
    return markers
}

/**
 * Add wikidata items to the map.
 */
export const leafletAddWikidata = (map, items) => {
    const lg = L.layerGroup()
    const markers = new Map()
    console.log(items)
    items.forEach(({ commonscat, image, location, q, qLabel }) => {
        const name = commonscat?.value || qLabel.value
        const imgUrl = image?.value?.replace('http://', 'https://')
        const imgHtml = imgUrl ? ` | <a href="${imgUrl}" target="wd" title="Wiki">pic</a>` : ''
        const [lng, lat] = location?.value?.slice(6, -1).split(' ').map(s => parseFloat(s))
        const html = `<div>
                        <a href="${q.value}" target="wd" title="Wiki">${name}</a>
                        ${imgHtml}
                     </div>`
        const marker = L.marker([lat, lng]).bindPopup(html).addTo(lg)
        markers.set(name, marker)
    })
    lg.addTo(map)
    return markers
}
