import { wikimediaPicOfTheDay } from '../ez-opendata.js'

const main = async () => {
    const pics = await wikimediaPicOfTheDay()
    const h = pics.reduce((acc, pic) => acc + `<li class="pic"><a href="${pic}" />${pic}</a></li>`)
    document.getElementById('pics')!.innerHTML = h
}

main()
