import { leafletAddWikidata, leafletInitMap } from '../ez-leaflet.js';
import { wikidataQuery } from '../ez-opendata.js';

const renderMap = async (map) => {
    const { _northEast, _southWest } = map.getBounds()
    const items = await wikidataQuery(_northEast, _southWest)
    return leafletAddWikidata(map, items)
}

(async () => {
    const { map } = await leafletInitMap()
    let markers = await renderMap(map)
    map.on('moveend', async () => {
        markers.forEach(marker => map.removeLayer(marker))
        markers = await renderMap(map)
    })
})();