import { leafletAddWikidata, leafletInitMap } from '../ez-leaflet.js'
import { WikidataArticle, wikidataQuery } from '../ez-opendata.js'

const renderMap = async (map: L.Map, markers: Map<WikidataArticle, L.Marker>) => {
    const { _northEast, _southWest } = map.getBounds() as any
    const wdata = await wikidataQuery(_northEast, _southWest)
    return leafletAddWikidata(map, wdata, markers)
}

const main = async () => {
    const { map } = await leafletInitMap()
    // markers is a Map<wikidata instance, leaflet marker instance>
    const markers = new Map<WikidataArticle, L.Marker>()
    await renderMap(map, markers)
    map.on('moveend', async () => await renderMap(map, markers))
}

main()
