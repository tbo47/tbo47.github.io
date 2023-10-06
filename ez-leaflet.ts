// Description: A library to query open data sources (wikipedia, openstreetmap, wikimedia...).
declare var L: any 

import { OpenstreetmapPoi, WikidataArticle, WikimediaItem, WikipediaArticle, wikimediaGetAuthor, wikimediaGetAuthorLink, wikimediaInfo } from "./ez-opendata.js"

const DEFAULT_CENTER = { latitude: 48.863, longitude: 2.368 }
const OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

/**
 * Get the current location of the user. Will only work on https or localhost.
 * @returns { latitude, longitude }
 */
export const getCurrentPosition = (): Promise<{ latitude: number, longitude: number }> => {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => resolve(position.coords), () => resolve(DEFAULT_CENTER))
        } else {
            resolve(DEFAULT_CENTER)
        }
    })
}

export const getCurrentOsmPositionLink = async (z = 17) => {
    const { latitude, longitude } = await getCurrentPosition()
    return `https://www.openstreetmap.org/#map=${z}/${latitude}/${longitude}`
}

/**
 * 
 */
export const leafletInitMap = async (): Promise<{ map: L.Map }> => {
    const map = L.map('map')
    L.tileLayer(OSM).addTo(map)
    const moveAction = () => {
        const pos = map.getCenter()
        setLatLngZoomIfNeeded(pos.lat.toString(), pos.lng.toString(), map.getZoom().toString())
    }
    map.on('zoomend', moveAction)
    map.on('moveend', moveAction)

    const { lat, lng, zoom } = getLatLngZoomFromUrl()
    if (lat && lng && zoom) {
        map.setView([Number(lat), Number(lng)], Number(zoom));
    } else {
        const { latitude, longitude } = await getCurrentPosition()
        map.setView([latitude, longitude], 14)
        map.on('locationfound', (e: any) => L.circle(e.latlng, e.accuracy / 2).addTo(map))
    }
    return { map }
}

export const leafletAddPOIsToTheMap = (map: L.Map, pois: OpenstreetmapPoi[]) => {
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
 * @param {Array.<title, lat, lon>} articles 
 * @returns {Map.<title, L.marker>}
 */
export const leafletAddWikipediaArticlesToTheMap = (map: L.Map, articles: Array<WikipediaArticle>): Map<string, L.Marker> => {
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
export const leafletAddWikidata = (map: L.Map, items: WikidataArticle[]) => {
    const lg = L.layerGroup()
    const markers = new Map()
    items.forEach(({ commonscat, image, location, q, qLabel }) => {
        const name = commonscat?.value || qLabel.value
        const imgUrl = image?.value?.replace('http://', 'https://')
        const imgHtml = imgUrl ? ` | <a href="${imgUrl}" target="wd" title="Wiki">pic</a>` : ''
        const [lng, lat] = location?.value?.slice(6, -1).split(' ').map((s: string) => parseFloat(s))
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

/**
 * Add wikimedia pictures to the map.
 * https://www.mediawiki.org/wiki/API:Imageinfo
 */
export const leafletAddWikimedia = (map: L.Map, items: WikimediaItem[]) => {
    const lg = L.layerGroup()
    const markers = new Map()
    items.forEach(({ dist, lat, lon, ns, pageid, primary, title }) => {
        const marker = L.marker([lat, lon]).addTo(lg)
        marker.on('click', async () => {
            const info = await wikimediaInfo(pageid, 600)
            const user = await wikimediaGetAuthor(info.title, pageid)
            const userLink = wikimediaGetAuthorLink(user)
            const html = `<div>
                            <a href="${info.descriptionurl}" target="wm">${info.name}<img src="${info.thumburl}"></a>
                            <a href="${userLink}" target="mp">More photos from ${user}</a>
                          </div>`
            marker.bindPopup(html).openPopup()
        })
        markers.set(pageid, marker)
    })
    lg.addTo(map)
    return markers
}

export const getLatLngZoomFromUrl = () => {
    const url = new URL(window.location as any);
    const lat = url.searchParams.get('lat')
    const lng = url.searchParams.get('lng')
    const zoom = url.searchParams.get('z')
    return { lat, lng, zoom }
}

export const setLatLngZoomIfNeeded = (latNew: string, lngNew: string, zoomNew: string) => {
    const { lat, lng, zoom } = getLatLngZoomFromUrl()
    if (latNew === lat && lngNew === lng && zoomNew === zoom) return
    const url = new URL(window.location as any);
    url.searchParams.set('lat', latNew)
    url.searchParams.set('lng', lngNew)
    url.searchParams.set('z', zoomNew)
    window.location.href = url.href
}
