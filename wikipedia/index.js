import { leafletAddWikipediaArticlesToTheMap, leafletInitMap } from '../ez-leaflet.js';
import { wikipediaQuery } from '../ez-opendata.js';
const language = window.navigator.language?.split('-').at(0);
const renderMap = async (map, markers) => {
    const { lat, lng } = map.getCenter();
    const articles = await wikipediaQuery(lat, lng, language);
    return leafletAddWikipediaArticlesToTheMap(map, articles, markers);
};
const main = async () => {
    // markers is a Map<pageid of the wikipedia article, leaflet marker instance>
    const markers = new Map();
    const { map } = await leafletInitMap();
    await renderMap(map, markers);
    map.on('moveend', async () => await renderMap(map, markers));
};
main();
//# sourceMappingURL=index.js.map