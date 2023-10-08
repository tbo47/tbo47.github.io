import { WikimediaItem, wikimediaGetAuthor, wikimediaGetAuthorLink, wikimediaInfo } from './ez-opendata.js'
import { getCurrentPosition, getLatLngZoomFromUrl } from './ez-web-utils.js'

declare var maplibregl: any

const DEFAULT_ZOOM = 16
const MARKER_OPTIONS = {
    color: '#FFFFFF',
}

export const maplibreInitMap = async () => {
    let { lat, lng, zoom } = getLatLngZoomFromUrl()
    let center = [lng, lat]
    if (!lat || !lng || !zoom) {
        center = await getCurrentPosition()
        zoom = DEFAULT_ZOOM
    }

    const style = {
        version: 8,
        sources: {
            osm: {
                type: 'raster',
                tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                maxzoom: 19,
            },
        },
        layers: [
            {
                id: 'osm',
                type: 'raster',
                source: 'osm', // This must match the source key above
            },
        ],
    }
    const map = new maplibregl.Map({ container: 'map', style, center, zoom })
    return map
}

export const maplibreAddWikimedia = async (map: any, pics: WikimediaItem[], markers: Map<WikimediaItem, any>) => {
    const picsAlreadyOnTheMap = Array.from(markers.keys())
    const picsToAdd = pics.filter((p) => !picsAlreadyOnTheMap.some((p2) => p.pageid === p2.pageid))

    picsToAdd.forEach(async (pic) => {
        const width = Math.min(Math.floor(window.innerWidth * 0.8), 600)
        const info = await wikimediaInfo(pic.pageid, width)
        const user = await wikimediaGetAuthor(info.title, pic.pageid)
        const userLink = wikimediaGetAuthorLink(user)
        const html = `<div>
                        <a href="${info.descriptionurl}" target="wm">${info.name}<img src="${info.thumburl}"></a>
                        <a href="${userLink}" target="mp">More photos from ${user}</a>
                      </div>`

        const marker = new maplibregl.Marker(MARKER_OPTIONS)
            .setLngLat([pic.lon, pic.lat])
            .setPopup(new maplibregl.Popup().setHTML(html))
            .addTo(map)

        markers.set(pic, marker)
    })
}

export const maplibreHasBoundsChanged = (map: any, knownBounds: any) => {
    const currentBounds = map.getBounds()
    if (currentBounds.getNorthEast().lat !== knownBounds.getNorthEast().lat) return true
    if (currentBounds.getNorthEast().lat !== knownBounds.getNorthEast().lat) return true
    if (currentBounds.getSouthWest().lng !== knownBounds.getSouthWest().lng) return true
    if (currentBounds.getSouthWest().lng !== knownBounds.getSouthWest().lng) return true
    return false
}
