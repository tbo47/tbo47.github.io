import { leafletAddWikidata, leafletInitMap } from '../ez-leaflet.js';
import { wikidataQuery } from '../ez-opendata.js';
const renderMap = async (map, markers) => {
    const { _northEast, _southWest } = map.getBounds();
    const wdata = await wikidataQuery(_northEast, _southWest);
    return leafletAddWikidata(map, wdata, markers);
};
(async () => {
    const { map } = await leafletInitMap();
    // markers is a Map<wikidata instance, leaflet marker instance>
    const markers = new Map();
    await renderMap(map, markers);
    map.on('moveend', async () => await renderMap(map, markers));
})();
