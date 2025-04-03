import { Konva } from '../konva-es.9.3.19.js'

const PID_DATASET_URL = 'https://raw.githubusercontent.com/tbo47/open-pid-icons/refs/heads/main/open-pid-icons.json'

const createPicIcon = ({ name, path }, stage) => {
    const group = new Konva.Group({
        x: Math.random() * stage.width() * 0.9,
        y: Math.random() * stage.height() * 0.9,
        draggable: true,
    })
    // add name text to the group
    const text = new Konva.Text({
        text: name,
        fontSize: 12,
        fontFamily: 'Calibri',
        fill: 'black',
        x: 0,
        y: -18,
    })
    group.add(text)
    const icon = new Konva.Path({
        data: path,
        // fill: 'green',
        stroke: 'black',
        strokeWidth: 1,
        name,
        width: 50,
        height: 50,
    })
    group.add(icon)

    const boundingBox = icon.getClientRect({ relativeTo: group })

    const box = new Konva.Rect({
        x: boundingBox.x,
        y: boundingBox.y,
        width: boundingBox.width,
        height: boundingBox.height,
    })
    group.add(box)
    return group
}

const go = async () => {
    const stage = new Konva.Stage({
        container: 'container', // id of container <div>
        width: window.innerWidth,
        height: window.innerHeight,
    })
    const layer = new Konva.Layer()
    stage.add(layer)
    const response = await fetch(PID_DATASET_URL)
    const data = await response.json()
    data.valve.forEach((item) => layer.add(createPicIcon(item, stage)))
    layer.draw()
}

go()

// Adjust canvas size on window resize
window.addEventListener('resize', () => {
    const stage = Konva.stages[0]
    stage.width(window.innerWidth)
    stage.height(window.innerHeight)
    go()
})
