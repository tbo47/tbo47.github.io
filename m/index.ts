/**
 * This file is the entry point of the application. It will initialize the map and add the pictures on it.
 * Start from the bottom of the file to understand the logic.
 */
import { maplibreAddWikimedia, maplibreHasBoundsChanged, maplibreInitMap } from '../ez-maplibre.js'
import { WikimediaItem, WikimediaThumb, wikimediaGetThumb, wikimediaQueryBound } from '../ez-opendata.js'
import { getLatLngZoomFromUrl, saveLatLngZoomToUrl, swapListening } from '../ez-web-utils.js'

const setMetaHeaders = (thumb: WikimediaThumb) => {
    document.title = thumb.objectname
    const metas = document.getElementsByTagName('meta') as unknown as HTMLMetaElement[]
    const metaTitle = Array.from(metas).find((m) => m.attributes[0].nodeValue === 'og:title')
    metaTitle!.attributes[1].nodeValue = thumb.objectname
    const metaUrl = Array.from(metas).find((m) => m.attributes[0].nodeValue === 'og:url')
    metaUrl!.attributes[1].nodeValue = window.location.href
    const metaImage = Array.from(metas).find((m) => m.attributes[0].nodeValue === 'og:image')
    metaImage!.attributes[1].nodeValue = thumb.thumburl
    const metaDescription = Array.from(metas).find((m) => m.attributes[0].nodeValue === 'og:description')
    metaDescription!.attributes[1].nodeValue = thumb.objectname
}

/**
 * This function is called every time a picture is clicked on the map.
 */
const onPicClick = async (pic: WikimediaItem, map: any, detailsEle: HTMLElement) => {
    detailsEle.innerHTML = `Loading...`
    detailsEle.style.flex = `2`
    const { height, width } = detailsEle.getBoundingClientRect()
    const thumb = await wikimediaGetThumb(pic.pageid, height, width)
    setMetaHeaders(thumb)
    const html = `<div class="detail"><img src="${thumb.thumburl}" title="Double click for more pictures from this author"></div>`
    detailsEle.innerHTML = html
    detailsEle.addEventListener('dblclick', () => {
        const a = document.getElementById('hiddenlink') as HTMLAnchorElement
        a.href = thumb.artistUrl
        a.target = thumb.artist
        setTimeout(() => a.click(), 100)
    })
    detailsEle.addEventListener('click', () => map.flyTo({ center: [pic.lon, pic.lat], zoom: 16 }))
    saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom(), pic.pageid)
}

/**
 * If the picture in the details section is not on the map anymore, hide the details.
 */
const hideDetailsIfNotOnPageAnymore = (pics: WikimediaItem[], detailsEle: HTMLElement) => {
    if (!pics.find((p) => p.pageid === getLatLngZoomFromUrl().id)) {
        detailsEle.innerHTML = ``
        detailsEle.style.flex = `0`
    }
}

/**
 * Calls Wikimedia Commons REST endpoint and place the pictures on the map.
 */
const renderMap = async (map: any, markers: Map<WikimediaItem, any>, detailsEle: HTMLElement) => {
    try {
        const pics = await wikimediaQueryBound(map.getBounds())
        const newMarkers = await maplibreAddWikimedia(map, pics, markers)
        newMarkers.forEach((marker, pic) => {
            marker.getElement().addEventListener('click', () => onPicClick(pic, map, detailsEle))
        })
        // TODO hideDetailsIfNotOnPageAnymore(pics)
        saveLatLngZoomToUrl(map.getCenter().lat, map.getCenter().lng, map.getZoom(), getLatLngZoomFromUrl().id)
    } catch (error) {
        console.error(error)
    }
}

/**
 * It loads the details section for the picture in the URL.
 */
const initialShowPicInDetails = (map: any, markers: Map<WikimediaItem, any>, detailsEle: HTMLElement) => {
    const urlPicId = getLatLngZoomFromUrl().id
    if (urlPicId) {
        markers.forEach((marker, pic) => {
            if (pic.pageid === urlPicId) {
                onPicClick(pic, map, detailsEle)
            }
        })
    }
}

/**
 * Initialize the swipe logic to change the picture in the details section. For smartphones.
 */
const initSwipeLogic = (map: any, markers: Map<WikimediaItem, any>, detailsEle: HTMLElement) => {
    swapListening(detailsEle, (type) => {
        console.log(type)
        const urlPicId = getLatLngZoomFromUrl().id
        let add = 0
        if (type === 'swipeleft') add = 1
        else if (type === 'swiperight') add = -1
        else return

        Array.from(markers.keys()).every((pic, index, pics) => {
            if (pic.pageid === urlPicId) {
                let newPicIndex = index + add
                if (newPicIndex < 0) newPicIndex = pics.length - 1
                else if (newPicIndex >= pics.length) newPicIndex = 0
                const newPic = pics[newPicIndex]
                onPicClick(newPic, map, detailsEle)
                map.flyTo({ center: [newPic.lon, newPic.lat], zoom: 16 })
                return false
            }
            return true
        })
    })
}

/**
 * Initialize all the events listeners on the map. It will call renderMap() when needed.
 */
const initMapEventsListening = (map: any, markers: Map<WikimediaItem, any>, detailsEle: HTMLElement) => {
    let isFetchingData = false
    let bounds = map.getBounds()
    const onChange = async () => {
        if (!isFetchingData && maplibreHasBoundsChanged(map, bounds)) {
            bounds = map.getBounds()
            isFetchingData = true
            await renderMap(map, markers, detailsEle)
            setTimeout(() => (isFetchingData = false), 100)
        }
    }
    map.on('mouseup', onChange)
    map.on('zoomend', onChange)
    map.on('touchend', onChange)
}

/**
 * The `main` function is the entry point of the app.
 */
const main = async () => {
    debugger
    /**
     * `markers` is a javascript Map.
     * The keys of the map are the Wikimedia Commons picture instances, the values are the Maplibre marker instances.
     */
    const markers = new Map<WikimediaItem, any>() // TODO clean up markers if too big
    const detailsEle = document.getElementById('details')!
    const map = await maplibreInitMap()
    await renderMap(map, markers, detailsEle)
    initialShowPicInDetails(map, markers, detailsEle)
    initMapEventsListening(map, markers, detailsEle)
    initSwipeLogic(map, markers, detailsEle)
}

main()