import { maplibreAddWikimedia, maplibreHasBoundsChanged, maplibreInitMap } from '../ez-maplibre.js'
import {
    WikimediaItem,
    wikimediaGetAuthor,
    wikimediaGetAuthorLink,
    wikimediaQueryBound,
    wikimediaSetHeightInfo,
} from '../ez-opendata.js'
import { saveLatLngZoomToUrl } from '../ez-web-utils.js'

const onPicClick = async (pic: WikimediaItem, marker: any, picExtraInfo: any) => {
    const detailsEle = document.getElementById('details')!
    detailsEle.innerHTML = `Loading...`
    const user = await wikimediaGetAuthor(picExtraInfo.title, pic.pageid)
    const userLink = wikimediaGetAuthorLink(user)
    detailsEle.style.flex = `2`
    const h = Math.floor(detailsEle.getBoundingClientRect().height)
    const thumbInfo = await wikimediaSetHeightInfo([pic.pageid], h)
    const thumbUrl = thumbInfo[pic.pageid].imageinfo[0].thumburl
    const html = `<div class="detail">
            <a href="${picExtraInfo.descriptionurl}" target="wm" title="${picExtraInfo.name}"><img src="${thumbUrl}"></a>
        </div>`
    // <a href="${userLink}" target="mp">More</a>
    detailsEle.innerHTML = html
    detailsEle.style.height = `${h}px`
}

const renderMap = async (map: any, markers: Map<WikimediaItem, any>) => {
    try {
        const pics = await wikimediaQueryBound(map.getBounds())
        maplibreAddWikimedia(map, pics, markers, onPicClick)
    } catch (error) {
        console.error(error)
    }
    saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom())
}

;(async () => {
    /**
     * Map<wikimedia pic-> leaflet marker>
     */
    const markers = new Map<WikimediaItem, any>()
    const map = await maplibreInitMap()
    await renderMap(map, markers)

    let isFetchingData = false
    let bounds = map.getBounds()
    const onChange = async () => {
        if (!isFetchingData && maplibreHasBoundsChanged(map, bounds)) {
            bounds = map.getBounds()
            isFetchingData = true
            await renderMap(map, markers)
            isFetchingData = false
        }
    }
    map.on('mouseup', onChange)
    map.on('zoomend', onChange)
})()
