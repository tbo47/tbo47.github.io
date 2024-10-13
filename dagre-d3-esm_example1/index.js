import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm'
// import * as dagreD3 from 'https://tbo47.github.io/dagre-d3-es.7.0.11.js'
import * as dagreD3 from '../dagre-d3-es.7.0.11.js'

function componentDidMount() {
    const g = new dagreD3.graphlib.Graph({ directed: true })
    // Set an object for the graph label
    g.setGraph({})

    g.graph().rankdir = 'LR'
    g.graph().ranksep = 50
    g.graph().nodesep = 5

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function () {
        return {}
    })

    // root
    g.setNode('root', {
        label: ` App Exp \n Optimization \n Improvement`,
        width: 70,
        height: 60,
        shape: 'rect',
        style: 'stroke: black; fill:blue; stroke-width: 1px; ',
        labelStyle: "font: 300 14px 'Helvetica Neue', Helvetica;fill: white;",
    })

    // g.setNode('root', {
    // 	label: `<span class='root-node'>${`App Exp \n Optimization \n Improvement \n (Facebook)`}</span>`,
    // 	labelType: 'html',
    // 	width: 70,
    // 	height: 60,
    // 	shape: 'rect',
    // 	style: 'stroke: white; fill:blue; stroke-width: 1px; ',
    // });

    // level 1
    ;['put', 'cdt', 'ttc', 'ssr'].forEach((label) => {
        g.setNode(label, {
            label,
            width: 50,
            height: 20,
            shape: 'ellipse',
            style: 'stroke: black; fill:blue; stroke-width: 1px; ',
            labelStyle: "font: 300 14px 'Helvetica Neue', Helvetica;fill: white;",
        })
    })

    // level 2
    ;['ran', 'pscore', 'dns', 'cdn', 'fbServers', 'policy'].forEach((label) => {
        g.setNode(label, {
            label,
            width: 50,
            height: 20,
            shape: 'ellipse',
            style: 'stroke: black; fill:blue; stroke-width: 1px; ',
            labelStyle: "font: 300 14px 'Helvetica Neue', Helvetica;fill: white;",
        })
    })

    // level 3
    g.setNode('wcdma', {
        label: 'WCDMA',
        width: 50,
        height: 20,
        shape: 'ellipse',
        style: 'stroke: black; fill:blue; stroke-width: 1px; ',
        labelStyle: "font: 300 14px 'Helvetica Neue', Helvetica;fill: white;",
    })
    g.setNode('lte', {
        label: 'LTE',
        width: 50,
        height: 20,
        shape: 'ellipse',
    })
    g.setNode('uploadProcedure', {
        label: 'Upload Procedure',
        width: 50,
        height: 20,
        shape: 'ellipse',
    })
    g.setNode('dataPlans', {
        label: 'Data Plans',
        width: 50,
        height: 20,
        shape: 'ellipse',
    })

    // level 4
    g.setNode('performance', {
        label: 'Performance',
        width: 50,
        height: 20,
        shape: 'ellipse',
        style: 'stroke: black; fill:blue; stroke-width: 1px; ',
        labelStyle: "font: 300 14px 'Helvetica Neue', Helvetica;fill: white;",
    })
    g.setNode('coverage', {
        label: 'Coverage',
        width: 50,
        height: 20,
        shape: 'ellipse',
    })
    g.setNode('capacity', {
        label: 'Capacity',
        width: 50,
        height: 20,
        shape: 'ellipse',
    })
    g.setNode('delay', {
        label: 'Processing Delay',
        width: 50,
        height: 20,
        shape: 'ellipse',
    })
    g.setNode('packetLoss', {
        label: 'Packet Loss',
        width: 50,
        height: 20,
        shape: 'ellipse',
    })
    g.setNode('tcpPerformance', {
        label: 'TCP Performance',
        width: 50,
        height: 20,
        shape: 'ellipse',
    })

    // Add edges to the graph.
    g.setEdge('root', 'put', {
        curve: d3.curveBasis,
        style: 'stroke: blue; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: blue',
    })
    g.setEdge('root', 'cdt', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('root', 'ttc', {
        curve: d3.curve,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('root', 'ssr', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('put', 'ran', {
        curve: d3.curveBasis,
        style: 'stroke: blue; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: blue',
    })
    g.setEdge('put', 'pscore', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('put', 'dns', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('put', 'cdn', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('put', 'fbServers', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('put', 'policy', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('cdt', 'ran', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('cdt', 'pscore', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('cdt', 'dns', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('cdt', 'cdn', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('cdt', 'fbServers', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('cdt', 'policy', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('ttc', 'ran', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('ttc', 'pscore', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('ttc', 'dns', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('ttc', 'cdn', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('ttc', 'fbServers', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('ttc', 'policy', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('ssr', 'ran', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('ssr', 'pscore', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('ssr', 'dns', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('ssr', 'cdn', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('ssr', 'fbServers', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('ssr', 'policy', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('ran', 'wcdma', {
        curve: d3.curveBasis,
        style: 'stroke: blue; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: blue',
    })
    g.setEdge('ran', 'lte', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('pscore', 'lte', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('wcdma', 'performance', {
        curve: d3.curveBasis,
        style: 'stroke: blue; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: blue',
    })
    g.setEdge('wcdma', 'coverage', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('wcdma', 'capacity', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('lte', 'performance', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('lte', 'coverage', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('lte', 'capacity', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('dns', 'delay', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('cdn', 'delay', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('fbServers', 'delay', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('fbServers', 'uploadProcedure', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('policy', 'dataPlans', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('uploadProcedure', 'delay', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })
    g.setEdge('uploadProcedure', 'packetLoss', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    g.setEdge('dataPlans', 'tcpPerformance', {
        curve: d3.curveBasis,
        style: 'stroke: gray; fill:none; stroke-width: 1px; stroke-dasharray: 5, 5;',
        arrowheadStyle: 'fill: gray',
    })

    var svg = d3.select('svg'),
        inner = svg.select('g')

    // // Create the renderer
    var render = new dagreD3.render()

    // // Run the renderer. This is what draws the final graph.
    render(inner, g)

    inner
        .selectAll('g.node')
        .attr('title', function (v) {
            return "<p class='name'>" + v + "</p><p class='description'> some random description </p>"
        })
        .each(function (v) {
            console.log('node details :', v)
            // $(this).tipsy({ gravity: 'w', opacity: 1, html: true });
        })
}

componentDidMount()
