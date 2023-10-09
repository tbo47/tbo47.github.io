import { maplibreAddWikimedia, maplibreHasBoundsChanged, maplibreInitMap } from '../ez-maplibre.js'
import { WikimediaItem, wikimediaGetThumb, wikimediaQueryBound } from '../ez-opendata.js'
import { getLatLngZoomFromUrl, saveLatLngZoomToUrl, swapListening } from '../ez-web-utils.js'

const detailsEle = document.getElementById('details')!

/**
 * This function is called every time a picture is clicked on the map.
 */
const onPicClick = async (pic: WikimediaItem, map: any) => {
    detailsEle.innerHTML = `Loading...`
    detailsEle.style.flex = `2`
    const { height, width } = detailsEle.getBoundingClientRect()
    const thumb = await wikimediaGetThumb(pic.pageid, height, width)
    // const user = await wikimediaGetAuthor(thumbInfo.title, pic.pageid)
    // const userLink = wikimediaGetAuthorLink(user)
    const html = `<div class="detail"><img src="${thumb.thumburl}"></div>`
    // <a href="${userLink}" target="mp">More</a>
    detailsEle.innerHTML = html
    detailsEle.addEventListener('dblclick', () => {
        window.open(thumb.descriptionurl, '_blank');
    })
    detailsEle.addEventListener('click', () => {
        map.flyTo({ center: [pic.lon, pic.lat], zoom: 16 })
    })
    // detailsEle.style.height = `${h}px`
    saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom(), pic.pageid)
}

/**
 * If the picture in the details section is not on the map anymore, hide the details.
 */
const hideDetailsIfNotOnPageAnymore = (pics: WikimediaItem[]) => {
    if (!pics.find((p) => p.pageid === getLatLngZoomFromUrl().id)) {
        detailsEle.innerHTML = ``
        detailsEle.style.flex = `0`
    }
}

/**
 * This function is called every time the map is moved or zoomed.
 * We call Wikimedia Common REST endpoint and place the pictures on the map if needed.
 */
const renderMap = async (map: any, markers: Map<WikimediaItem, any>) => {
    try {
        const pics = await wikimediaQueryBound(map.getBounds())
        const newMarkers = await maplibreAddWikimedia(map, pics, markers)
        newMarkers.forEach((marker, pic) => {
            marker.getElement().addEventListener('click', () => onPicClick(pic, map))
        })
        // TODO hideDetailsIfNotOnPageAnymore(pics)
        saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom(), getLatLngZoomFromUrl().id)
    } catch (error) {
        console.error(error)
    }
}

/**
 * Called only once when the page is loaded. It loads the details section for the picture in the URL.
 */
const initialShowPicInDetails = (map: any, markers: Map<WikimediaItem, any>) => {
    const urlPicId = getLatLngZoomFromUrl().id
    if (urlPicId) {
        markers.forEach((marker, pic) => {
            if (pic.pageid === urlPicId) {
                onPicClick(pic, map)
            }
        })
    }
}

const initSwipeLogic = (map: any, markers: Map<WikimediaItem, any>) => {
    swapListening(detailsEle, (type) => {
        const urlPicId = getLatLngZoomFromUrl().id
        let add = 0
        if (type === 'swipeleft') add = -1
        else if (type === 'swiperight') add = 1
        else return

        Array.from(markers.keys()).every((pic, index, pics) => {
            if (pic.pageid === urlPicId && index === 0) {
                add = pics.length - 1
            } else if (pic.pageid === urlPicId && index === pics.length - 1) {
                add = 1 - pics.length
            }
            if (pic.pageid === urlPicId) {
                const newPic = pics[index + add]
                onPicClick(newPic, map)
                map.flyTo({ center: [newPic.lon, newPic.lat], zoom: 16 })
                return false
            }
            return true
        })
    })
}

const initMapEventsListening = (map: any, markers: Map<WikimediaItem, any>) => {
    let isFetchingData = false
    let bounds = map.getBounds()
    const onChange = async () => {
        if (!isFetchingData && maplibreHasBoundsChanged(map, bounds)) {
            bounds = map.getBounds()
            isFetchingData = true
            await renderMap(map, markers)
            setTimeout(() => (isFetchingData = false), 100)
        }
    }
    map.on('mouseup', onChange)
    map.on('zoomend', onChange)
    map.on('touchend', onChange)
}

/**
 * Main function
 */
;(async () => {
    /**
     * Map<wikimedia picture, maplibre marker>
     */
    const markers = new Map<WikimediaItem, any>()
    const map = await maplibreInitMap()
    await renderMap(map, markers)
    initialShowPicInDetails(map, markers)
    initMapEventsListening(map, markers)
    initSwipeLogic(map, markers)
})()
