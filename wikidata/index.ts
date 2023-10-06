import { leafletAddWikidata, leafletInitMap } from '../ez-leaflet.js';
import { wikidataQuery } from '../ez-opendata.js';

const renderMap = async (map: L.Map) => {
    const { _northEast, _southWest } = map.getBounds() as any
    const wdata = await wikidataQuery(_northEast, _southWest)
    return leafletAddWikidata(map, wdata)
}

(async () => {
    const { map } = await leafletInitMap()
    let markers = await renderMap(map)
    map.on('moveend', async () => {
        markers.forEach(marker => map.removeLayer(marker))
        markers = await renderMap(map)
    })
})();