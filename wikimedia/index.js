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

(async () => {
    const { map } = await leafletInitMap()
    let markers = await renderMap(map)
    map.on('moveend', async () => {
        markers.forEach(marker => map.removeLayer(marker))
        markers = await renderMap(map)
    })
})();