import { Konva } from 'https://tbo47.github.io//konva-es.9.3.19.js'

const PID_DATASET_URL = 'https://raw.githubusercontent.com/tbo47/open-pid-icons/refs/heads/main/open-pid-icons.json'

const createPicIcon = ({ name, path }, stage) => {
    const group = new Konva.Group({
        x: Math.random() * stage.width() * 0.9,
        y: Math.random() * stage.height() * 0.9,
        draggable: true,
    })
    const icon = new Konva.Path({ data: path, stroke: 'black', strokeWidth: 1, name, width: 50, height: 50 })
    group.add(icon)
    const text = new Konva.Text({ text: name, fontSize: 12, fill: 'black', x: 0, y: -18 })
    group.add(text)
    {
        const { x, y, width, height } = icon.getClientRect({ relativeTo: group })
        text.x(width / 2 - text.width() / 2)
        const box = new Konva.Rect({ x, y, width, height })
        box.on('mouseover', (e) => (e.target.getStage().container().style.cursor = 'move'))
        box.on('mouseout', (e) => (e.target.getStage().container().style.cursor = 'default'))
        group.add(box)
    }
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
    console.log(data)
    data.data.forEach((item) => layer.add(createPicIcon(item, stage)))
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
