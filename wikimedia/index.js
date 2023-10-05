import { leafletAddWikimedia, leafletInitMap } from '../ez-leaflet.js';
import { wikidataQuery, wikimediaQuery } from '../ez-opendata.js';

const renderMap = async (map) => {
    const { _northEast, _southWest } = map.getBounds()
    // const wdata = await wikidataQuery(_northEast, _southWest)
    try {
        const wmedia = await wikimediaQuery(_northEast, _southWest)
        return leafletAddWikimedia(map, wmedia)
    } catch (error) {
        alert(error.info)
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