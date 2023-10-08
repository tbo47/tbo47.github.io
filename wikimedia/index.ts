import { leafletAddWikimedia, leafletInitMap } from '../ez-leaflet.js'
import { wikimediaQueryBound } from '../ez-opendata.js'

const showErrorMessage = (error: { info: string }) => {
    const errorDiv = document.getElementById('error')
    if (!errorDiv) return
    errorDiv.innerHTML = error.info
    errorDiv.style.display = 'block'
    setTimeout(() => (errorDiv.style.display = 'none'), 2000)
}

const renderMap = async (map: L.Map, markers: Map<number, L.Marker>) => {
    try {
        const pics = await wikimediaQueryBound(map.getBounds())
        const picsToAdd = pics.filter((p) => !markers.has(p.pageid))
        const newMarkers = leafletAddWikimedia(map, picsToAdd)
        newMarkers.forEach((marker, id) => markers.set(id, marker))
    } catch (error) {
        showErrorMessage(error as any)
    }
}

;(async () => {
    /**
     * Map<id of the wikimedia page -> leaflet marker>
     */
    const markers = new Map<number, L.Marker>() // TODO replace id by instance
    const { map } = await leafletInitMap()
    await renderMap(map, markers)
    let isFetchingData = false
    map.on('moveend', async () => {
        if (isFetchingData) return
        isFetchingData = true
        await renderMap(map, markers)
        isFetchingData = false
    })
})()
