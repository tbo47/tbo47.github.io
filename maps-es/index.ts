import { Map } from './maps-es.js'
const JAWG_TOKEN = 's0odBD2S9MMsSPyJ3PzFCK68RFbSZZYSxssDEtlG22X6i2d25ghX6JgvsYCWAq1e'

new Map().init({
    container: '#map',
    style: 'osm',
    zoom: 16,
    center: [14.709076, -17.477656],
    token: JAWG_TOKEN,
})
