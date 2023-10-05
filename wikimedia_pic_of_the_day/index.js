import { wikimediaPicOfTheDay } from '../ez-opendata.js';

(async () => {
    const pics = await wikimediaPicOfTheDay()
    const h = pics.reduce((acc, pic) => acc + `<div class="pic"><a href="${pic}" />${pic}</a></div>`)

    document.getElementById('pics').innerHTML = h
})();