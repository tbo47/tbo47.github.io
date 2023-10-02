import { wikipediaQuery } from '../ez-opendata.js';
import { leafletAddWikipediaArticlesToTheMap, leafletInitMap } from '../ez-leaflet.js';

const renderMap = async (map) => {
    const { lat, lng } = map.getCenter()
    const language = window.navigator.language?.split('-').at(0);
    const articles = await wikipediaQuery(lat, lng, language)
    const markers = leafletAddWikipediaArticlesToTheMap(map, articles)
}

(async () => {
    const { map } = await leafletInitMap()
    await renderMap(map)
    map.on('moveend', () => renderMap(map))
})();