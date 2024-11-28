import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'
import * as dagreD3 from 'https://tbo47.github.io/dagre-d3-es.7.0.12-beta1.js'

const svg = d3.select('svg')
const inner = svg.select('g')
const render = new dagreD3.render()


const g = dagreD3.graphlib.graphlibJson.read({
    options: {
        directed: true,
        multigraph: true,
        compound: true,
    },
    nodes: [
        {
            v: 'c',
            value: {
                id: 'c',
                type: 'group',

                height: 39,
            },
            parent: 'b',
        },
        {
            v: 'd',
            value: {
                id: 'd',
                type: 'group',
            },
            parent: 'b',
        },
        {
            v: 'f',
            value: {
                id: 'f',
            },
            parent: 'b',
        },
        {
            v: 'e',
            value: {
                id: 'e',
            },
            parent: 'd',
        },
        {
            v: 'b',
            value: {
                id: 'b',
                type: 'group',
            },
        },
    ],
    edges: [
        {
            v: 'd',
            w: 'f',
            name: '1',
            value: {
                style: 'fill:none;',
                minlen: 1,
                labelpos: 'c',
                id: 'L-d-f-0',
            },
        },
    ],
    value: {
        rankdir: 'LR',
        nodesep: 50,
        ranksep: 50,
        marginx: 8,
        marginy: 8,
    },
})

// layout(g)

render(inner, g)