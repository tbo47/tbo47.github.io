import { leafletAddWikimedia, leafletInitMap } from '../ez-leaflet.js';
import { wikimediaQuery } from '../ez-opendata.js';

const showErrorMessage = (error: { code: 'toobig' | string, info: string }) => {
    const errorDiv = document.getElementById('error')
    if (!errorDiv) return
    errorDiv.innerHTML = error.info
    errorDiv.style.display = 'block'
    setTimeout(() => errorDiv.style.display = 'none', 2000)
}

const renderMap = async (map: L.Map, markers: Map<number, L.Marker>) => {
    const bounds = map.getBounds()
    try {
        const pics = await wikimediaQuery(bounds.getNorthEast(), bounds.getSouthWest(), 5000)
        const picsToAdd = pics.filter(p => !markers.has(p.pageid))
        const newMarkers = leafletAddWikimedia(map, picsToAdd)
        newMarkers.forEach((marker, id) => markers.set(id, marker))
    } catch (error) {
        showErrorMessage(error as any)
    }
}

/**
 * Map<id of the wikimedia page -> leaflet marker>
 */
const markers = new Map<number, L.Marker>();

(async () => {
    const { map } = await leafletInitMap()
    await renderMap(map, markers)
    map.on('moveend', async () => await renderMap(map, markers))
})()