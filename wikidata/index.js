import { leafletAddWikidata, leafletInitMap } from '../ez-leaflet.js';
import { wikidataQuery } from '../ez-opendata.js';

const renderMap = async (map) => {
    const { _northEast, _southWest } = map.getBounds()
    const wdata = await wikidataQuery(_northEast, _southWest)
    return leafletAddWikidata(map, wdata)
}

(async () => {
    const { map } = leafletInitMap()
    let markers = await renderMap(map)
    map.on('moveend', async () => {
        markers.forEach(marker => map.removeLayer(marker))
        markers = await renderMap(map)
    })
})();