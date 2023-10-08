/**
 * Collection of utility functions for the browser (not for nodejs).
 */

/**
 * Get the current location of the user. Will only work on https or localhost.
 *
 * @param defaultCenter default center if geolocation fails
 *
 * ```const [longitude, latitude] = await getCurrentPosition()```
 */
export const getCurrentPosition = (defaultCenter = [2, 48], timeout = 3000): Promise<number[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(defaultCenter), timeout)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (p) => resolve([p.coords.longitude, p.coords.latitude]),
                () => resolve(defaultCenter)
            )
        } else {
            resolve(defaultCenter)
        }
    })
}

export const getLatLngZoomFromUrl = () => {
    // #map=17/14.71241/-17.48513
    const hash = window.location.hash.substring(1).split('/')
    const zoom = Number(hash[0])
    const lat = Number(hash[1])
    const lng = Number(hash[2])
    return { lat, lng, zoom }
}

export const saveLatLngZoomToUrl = (latNew: number, lngNew: number, zoomNew: number) => {
    const { lat, lng, zoom } = getLatLngZoomFromUrl()
    if (latNew === lat && lngNew === lng && zoomNew === zoom) return
    window.location.hash = `${zoomNew}/${latNew}/${lngNew}`
}
