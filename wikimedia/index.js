import { leafletAddWikimedia, leafletInitMap } from '../ez-leaflet.js';
import { wikimediaQuery } from '../ez-opendata.js';

const renderMap = async (map) => {
    const { _northEast, _southWest } = map.getBounds()
    try {
        const wmedia = await wikimediaQuery(_northEast, _southWest)
        return leafletAddWikimedia(map, wmedia)
    } catch (error) {
        document.getElementById('error').innerHTML = error.info
        document.getElementById('error').style.display = 'block'
        setTimeout(() => {
            document.getElementById('error').style.display = 'none'
        }, 5000)
        return []
    }
}

const getLatLng = () => {
    const url = new URL(window.location);
    const lat = url.searchParams.get('lat')
    const lng = url.searchParams.get('lng')
    return { lat, lng }
}

const setLatLng = (lat, lng) => {
    url.searchParams.set('lat', lat)
    url.searchParams.set('lng', lng)
    window.location.href = url.href
}

(async () => {
    const { map } = await leafletInitMap()
    let markers = await renderMap(map)
    map.on('moveend', async () => {
        markers.forEach(marker => map.removeLayer(marker))
        markers = await renderMap(map)
    })
})();