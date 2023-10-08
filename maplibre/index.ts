import { maplibreAddWikimedia, maplibreHasBoundsChanged, maplibreInitMap } from '../ez-maplibre.js';
import { WikimediaItem, wikimediaQueryBound } from '../ez-opendata.js';
import { saveLatLngZoomToUrl } from '../ez-web-utils.js';

const renderMap = async (map: any, markers: Map<WikimediaItem, any>) => {
    try {
        const pics = await wikimediaQueryBound(map.getBounds())
        maplibreAddWikimedia(map, pics, markers)
    } catch (error) {
        console.error(error)
    }
    saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom())
}

;(async () => {
    /**
     * Map<wikimedia pic-> leaflet marker>
     */
    const markers = new Map<WikimediaItem, any>()
    const map = await maplibreInitMap()
    await renderMap(map, markers)

    let isFetchingData = false
    let bounds = map.getBounds()
    const onChange = async () => {
        if (!isFetchingData && maplibreHasBoundsChanged(map, bounds)) {
            bounds = map.getBounds()
            isFetchingData = true
            await renderMap(map, markers)
            isFetchingData = false
        }
    }
    map.on('mouseup', onChange)
    map.on('zoomend', onChange)
})()
