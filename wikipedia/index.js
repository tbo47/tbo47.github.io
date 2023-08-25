import { addWikipediaArticlesToTheMap, initLeafletMap, wikipediaQuery } from '../ez-opendata.js';

const renderMap = async (map) => {
    const { lat, lng } = map.getCenter()
    const language = window.navigator.language?.split('-').at(0);
    const articles = await wikipediaQuery(lat, lng, language)
    const markers = addWikipediaArticlesToTheMap(map, articles)
}

(async () => {
    const { map } = await initLeafletMap()
    await renderMap(map)
    map.on('moveend', () => renderMap(map))
})();