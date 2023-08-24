/*
 * This script downloads the latest Wikimedia Commons picture of the day.
 * It requires nodejs and https
 * 
 * To use it with sway on linux
 * swaymsg 'output "*" background /tmp/wikimedia.jpg fill'
 */
const https = require('https');
const fs = require('fs');

const resolution = process.argv.at(2) || '1280px' // 1024px 2560px

const url = 'https://commons.wikimedia.org/w/api.php?action=featuredfeed&feed=potd&feedformat=atom';

const match1 = 'href="https://commons.wikimedia.org/wiki/Special'
const match2 = 'typeof="mw:File"'

const getUrl = (url) => {
    return new Promise((resolve) => {
        https.get(url, resp => {
            let data = ''
            resp.on('data', c => data += c)
            resp.on('end', () => {
                resolve(data)
            })
        })
    })
}

const download = (url, dest) => {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(dest);
        https.get(url, resp => {
            resp.pipe(file);
            file.on('finish', () => file.close(resolve))
        })
    })
}

(async () => {
    const data = await getUrl(url)
    const urls = data.split(/\n/).filter(l => l.includes(match1)).map(l => l.split(/"/)[5])
    const lastUrl = urls.slice(-1)[0]
    const data2 = await getUrl(lastUrl)
    const picUrl = data2.split(/\n/).filter(l => l.includes(match2)).map(l => l.split(/"/)[7])
    const picName = picUrl[0].slice(11)
    const urlNom = `https://commons.wikimedia.org/wiki/File:${picName}`
    console.log(urlNom)
    // const picFullUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/${picName}/${resolution}-${picName}`
    const picFullUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/${picName}/${resolution}-${picName}`
    download(picFullUrl, '/tmp/wikimedia.jpg')
})()

