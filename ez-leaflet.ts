// Description: A library to query open data sources (wikipedia, openstreetmap, wikimedia...).

declare var L: any

import {
    OpenstreetmapPoi,
    WikidataArticle,
    WikimediaItem,
    WikipediaArticle,
    wikimediaGetAuthor,
    wikimediaGetAuthorLink,
    wikimediaInfo,
} from './ez-opendata.js'
import { getCurrentPosition, getLatLngZoomFromUrl, saveLatLngZoomToUrl } from './ez-web-utils.js'

const OSM = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export const getCurrentOsmPositionLink = async (z = 17) => {
    const [longitude, latitude] = await getCurrentPosition()
    return `https://www.openstreetmap.org/#map=${z}/${latitude}/${longitude}`
}

/**
 *
 */
export const leafletInitMap = async (): Promise<{ map: L.Map }> => {
    const map = L.map('map')
    L.tileLayer(OSM).addTo(map)
    const moveAction = () => {
        saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom())
    }
    map.on('zoomend', moveAction)
    map.on('moveend', moveAction)

    const { lat, lng, zoom } = getLatLngZoomFromUrl()
    if (lat && lng && zoom) {
        map.setView([Number(lat), Number(lng)], Number(zoom))
    } else {
        const [longitude, latitude] = await getCurrentPosition()
        map.setView([latitude, longitude], 14)
        map.on('locationfound', (e: any) => L.circle(e.latlng, e.accuracy / 2).addTo(map))
    }
    return { map }
}

/**
 *
 * @param map Leaflet map instance
 * @param pois the POIs to add to the map
 * @param markers the Map of all markers already on the map. We want to add the `pois` to the `markers`.
 * @returns the array of added POIs
 */
export const leafletAddPOIsToTheMap = (
    layerGroup: L.LayerGroup,
    pois: OpenstreetmapPoi[],
    markers: Map<OpenstreetmapPoi, L.Marker>
) => {
    const poiIdsAlreadyOnTheMap = Array.from(markers.keys())
    const poisToAdd = pois.filter((p) => !poiIdsAlreadyOnTheMap.some((p2) => p.id === p2.id))
    poisToAdd
        .filter((p) => p.lat && p.lon)
        .forEach((p) => {
            const extra = []
            extra.push(`<a href="${p.osm_url}" target="osm" title="Contribute on openstreetmap">osm</a>`)
            if (p.website) extra.push(`<a href="${p.website}" target="w" title="Visit the website">web</a>`)
            const addr = p[`addr:street`] ? (p[`addr:housenumber`] || ``) + ' ' + p[`addr:street`] : ``
            const name = p.name?.replaceAll(`&`, ` `)
            if (addr) {
                extra.push(
                    `<a href="https://www.google.com/search?q=${name} ${addr}" target="g" title="Search in google">g</a>`
                )
                extra.push(
                    `<a href="https://www.bing.com/search?q=${name} ${addr}" target="b" title="Search in bing">b</a>`
                )
            }
            const cuisine = p.cuisine ? `<div>${p.cuisine.split(';').join(', ')}</div>` : ``
            const html = `<div>${p.name}</div><div>${cuisine}</div><div>${extra.join(' | ')}`
            const marker = L.marker([p.lat, p.lon]).bindPopup(html).addTo(layerGroup)
            markers.set(p, marker)
        })
    return poisToAdd
}

export const leafletCreateLayerOnMap = (map: L.Map) => {
    const lg = L.layerGroup()
    lg.addTo(map)
    return lg
}

/**
 * Add wikipedia articles to the map.
 */
export const leafletAddWikipediaArticlesToTheMap = (
    map: L.Map,
    articles: Array<WikipediaArticle>,
    markers: Map<number, L.Marker>
) => {
    const lg = L.layerGroup()
    const articlesToAdd = articles.filter((a) => !markers.has(Number(a.pageid)))
    articlesToAdd.forEach(({ url, title, lat, lon, pageid }) => {
        const html = `<div><a href="${url}" target="osm" title="Wiki">${title}</a></div>`
        const marker = L.marker([lat, lon]).bindPopup(html).addTo(lg)
        markers.set(Number(pageid), marker)
    })
    lg.addTo(map)
    return lg // TODO add all markers to the same layer group
}

/**
 * Add wikidata items to the map.
 */
export const leafletAddWikidata = (map: L.Map, items: WikidataArticle[], markers: Map<WikidataArticle, L.Marker>) => {
    const lg = L.layerGroup()
    const articleIDsAlreadyOnTheMap = Array.from(markers.keys())
    const itemsToAdd = items.filter((i) => !articleIDsAlreadyOnTheMap.some((i2) => i.id === i2.id))
    itemsToAdd.forEach((i: WikidataArticle) => {
        const html = `<a href="${i.q.value}" target="wd" title="Wiki">${i.id}</a>`
        const marker = L.marker([i.lat, i.lng]).bindPopup(html).addTo(lg)
        markers.set(i, marker)
    })
    lg.addTo(map)
}

/**
 * Add wikimedia pictures to the map.
 * https://www.mediawiki.org/wiki/API:Imageinfo
 */
export const leafletAddWikimedia = (map: L.Map, items: WikimediaItem[]) => {
    const lg = L.layerGroup()
    const markers = new Map<number, L.Marker>()
    items.forEach(({ dist, lat, lon, ns, pageid, primary, title }) => {
        const marker = L.marker([lat, lon]).addTo(lg) as L.Marker
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
