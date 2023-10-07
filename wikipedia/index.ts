import { wikipediaQuery } from '../ez-opendata.js';
import { leafletAddWikipediaArticlesToTheMap, leafletInitMap } from '../ez-leaflet.js';

const language = window.navigator.language?.split('-').at(0)

const renderMap = async (map: L.Map, markers: Map<number, L.Marker>) => {
    const { lat, lng } = map.getCenter()
    const articles = await wikipediaQuery(lat, lng, language)
    return leafletAddWikipediaArticlesToTheMap(map, articles, markers)
}

(async () => {
    // markers is a Map<pageid of the wikipedia article, leaflet marker instance>
    const markers = new Map<number, L.Marker>();
    const { map } = await leafletInitMap()
    await renderMap(map, markers)
    map.on('moveend', async () => await renderMap(map, markers))
})()
