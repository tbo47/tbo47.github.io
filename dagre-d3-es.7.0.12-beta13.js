var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/dagre-js/render.js
import * as d38 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { defaults as defaults2 } from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/dagre/acyclic.js
import * as _4 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/dagre/greedy-fas.js
import * as _3 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/graphlib/index.js
var graphlib_exports = {};
__export(graphlib_exports, {
  Graph: () => Graph,
  graphlibJson: () => json_exports,
  version: () => version
});

// src/graphlib/graph.js
import * as _ from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
var DEFAULT_EDGE_NAME = "\0";
var GRAPH_NODE = "\0";
var EDGE_KEY_DELIM = "";
var Graph = class {
  constructor(opts = {}) {
    this._isDirected = Object.prototype.hasOwnProperty.call(opts, "directed") ? opts.directed : true;
    this._isMultigraph = Object.prototype.hasOwnProperty.call(opts, "multigraph") ? opts.multigraph : false;
    this._isCompound = Object.prototype.hasOwnProperty.call(opts, "compound") ? opts.compound : false;
    this._label = void 0;
    this._defaultNodeLabelFn = _.constant(void 0);
    this._defaultEdgeLabelFn = _.constant(void 0);
    this._nodes = {};
    if (this._isCompound) {
      this._parent = {};
      this._children = {};
      this._children[GRAPH_NODE] = {};
    }
    this._in = {};
    this._preds = {};
    this._out = {};
    this._sucs = {};
    this._edgeObjs = {};
    this._edgeLabels = {};
  }
  /* === Graph functions ========= */
  isDirected() {
    return this._isDirected;
  }
  isMultigraph() {
    return this._isMultigraph;
  }
  isCompound() {
    return this._isCompound;
  }
  setGraph(label) {
    this._label = label;
    return this;
  }
  graph() {
    return this._label;
  }
  /* === Node functions ========== */
  setDefaultNodeLabel(newDefault) {
    if (!_.isFunction(newDefault)) {
      newDefault = _.constant(newDefault);
    }
    this._defaultNodeLabelFn = newDefault;
    return this;
  }
  nodeCount() {
    return this._nodeCount;
  }
  nodes() {
    return _.keys(this._nodes);
  }
  sources() {
    var self = this;
    return _.filter(this.nodes(), function(v) {
      return _.isEmpty(self._in[v]);
    });
  }
  sinks() {
    var self = this;
    return _.filter(this.nodes(), function(v) {
      return _.isEmpty(self._out[v]);
    });
  }
  setNodes(vs, value) {
    var args = arguments;
    var self = this;
    _.each(vs, function(v) {
      if (args.length > 1) {
        self.setNode(v, value);
      } else {
        self.setNode(v);
      }
    });
    return this;
  }
  setNode(v, value) {
    if (Object.prototype.hasOwnProperty.call(this._nodes, v)) {
      if (arguments.length > 1) {
        this._nodes[v] = value;
      }
      return this;
    }
    this._nodes[v] = arguments.length > 1 ? value : this._defaultNodeLabelFn(v);
    if (this._isCompound) {
      this._parent[v] = GRAPH_NODE;
      this._children[v] = {};
      this._children[GRAPH_NODE][v] = true;
    }
    this._in[v] = {};
    this._preds[v] = {};
    this._out[v] = {};
    this._sucs[v] = {};
    ++this._nodeCount;
    return this;
  }
  node(v) {
    return this._nodes[v];
  }
  hasNode(v) {
    return Object.prototype.hasOwnProperty.call(this._nodes, v);
  }
  removeNode(v) {
    if (Object.prototype.hasOwnProperty.call(this._nodes, v)) {
      var removeEdge = (e) => this.removeEdge(this._edgeObjs[e]);
      delete this._nodes[v];
      if (this._isCompound) {
        this._removeFromParentsChildList(v);
        delete this._parent[v];
        _.each(this.children(v), (child) => {
          this.setParent(child);
        });
        delete this._children[v];
      }
      _.each(_.keys(this._in[v]), removeEdge);
      delete this._in[v];
      delete this._preds[v];
      _.each(_.keys(this._out[v]), removeEdge);
      delete this._out[v];
      delete this._sucs[v];
      --this._nodeCount;
    }
    return this;
  }
  setParent(v, parent) {
    if (!this._isCompound) {
      throw new Error("Cannot set parent in a non-compound graph");
    }
    if (_.isUndefined(parent)) {
      parent = GRAPH_NODE;
    } else {
      parent += "";
      for (var ancestor = parent; !_.isUndefined(ancestor); ancestor = this.parent(ancestor)) {
        if (ancestor === v) {
          throw new Error("Setting " + parent + " as parent of " + v + " would create a cycle");
        }
      }
      this.setNode(parent);
    }
    this.setNode(v);
    this._removeFromParentsChildList(v);
    this._parent[v] = parent;
    this._children[parent][v] = true;
    return this;
  }
  _removeFromParentsChildList(v) {
    delete this._children[this._parent[v]][v];
  }
  parent(v) {
    if (this._isCompound) {
      var parent = this._parent[v];
      if (parent !== GRAPH_NODE) {
        return parent;
      }
    }
  }
  children(v) {
    if (_.isUndefined(v)) {
      v = GRAPH_NODE;
    }
    if (this._isCompound) {
      var children = this._children[v];
      if (children) {
        return _.keys(children);
      }
    } else if (v === GRAPH_NODE) {
      return this.nodes();
    } else if (this.hasNode(v)) {
      return [];
    } else {
      return [];
    }
  }
  predecessors(v) {
    var predsV = this._preds[v];
    if (predsV) {
      return _.keys(predsV);
    }
  }
  successors(v) {
    var sucsV = this._sucs[v];
    if (sucsV) {
      return _.keys(sucsV);
    }
  }
  neighbors(v) {
    var preds = this.predecessors(v);
    if (preds) {
      return _.union(preds, this.successors(v));
    }
  }
  isLeaf(v) {
    var neighbors;
    if (this.isDirected()) {
      neighbors = this.successors(v);
    } else {
      neighbors = this.neighbors(v);
    }
    return neighbors.length === 0;
  }
  filterNodes(filter7) {
    var copy = new this.constructor({
      directed: this._isDirected,
      multigraph: this._isMultigraph,
      compound: this._isCompound
    });
    copy.setGraph(this.graph());
    var self = this;
    _.each(this._nodes, function(value, v) {
      if (filter7(v)) {
        copy.setNode(v, value);
      }
    });
    _.each(this._edgeObjs, function(e) {
      if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
        copy.setEdge(e, self.edge(e));
      }
    });
    var parents = {};
    function findParent(v) {
      var parent = self.parent(v);
      if (parent === void 0 || copy.hasNode(parent)) {
        parents[v] = parent;
        return parent;
      } else if (parent in parents) {
        return parents[parent];
      } else {
        return findParent(parent);
      }
    }
    if (this._isCompound) {
      _.each(copy.nodes(), function(v) {
        copy.setParent(v, findParent(v));
      });
    }
    return copy;
  }
  /* === Edge functions ========== */
  setDefaultEdgeLabel(newDefault) {
    if (!_.isFunction(newDefault)) {
      newDefault = _.constant(newDefault);
    }
    this._defaultEdgeLabelFn = newDefault;
    return this;
  }
  edgeCount() {
    return this._edgeCount;
  }
  edges() {
    return _.values(this._edgeObjs);
  }
  setPath(vs, value) {
    var self = this;
    var args = arguments;
    _.reduce(vs, function(v, w) {
      if (args.length > 1) {
        self.setEdge(v, w, value);
      } else {
        self.setEdge(v, w);
      }
      return w;
    });
    return this;
  }
  /*
   * setEdge(v, w, [value, [name]])
   * setEdge({ v, w, [name] }, [value])
   */
  setEdge() {
    var v, w, name, value;
    var valueSpecified = false;
    var arg0 = arguments[0];
    if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
      v = arg0.v;
      w = arg0.w;
      name = arg0.name;
      if (arguments.length === 2) {
        value = arguments[1];
        valueSpecified = true;
      }
    } else {
      v = arg0;
      w = arguments[1];
      name = arguments[3];
      if (arguments.length > 2) {
        value = arguments[2];
        valueSpecified = true;
      }
    }
    v = "" + v;
    w = "" + w;
    if (!_.isUndefined(name)) {
      name = "" + name;
    }
    var e = edgeArgsToId(this._isDirected, v, w, name);
    if (Object.prototype.hasOwnProperty.call(this._edgeLabels, e)) {
      if (valueSpecified) {
        this._edgeLabels[e] = value;
      }
      return this;
    }
    if (!_.isUndefined(name) && !this._isMultigraph) {
      throw new Error("Cannot set a named edge when isMultigraph = false");
    }
    this.setNode(v);
    this.setNode(w);
    this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);
    var edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
    v = edgeObj.v;
    w = edgeObj.w;
    Object.freeze(edgeObj);
    this._edgeObjs[e] = edgeObj;
    incrementOrInitEntry(this._preds[w], v);
    incrementOrInitEntry(this._sucs[v], w);
    this._in[w][e] = edgeObj;
    this._out[v][e] = edgeObj;
    this._edgeCount++;
    return this;
  }
  edge(v, w, name) {
    var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
    return this._edgeLabels[e];
  }
  hasEdge(v, w, name) {
    var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
    return Object.prototype.hasOwnProperty.call(this._edgeLabels, e);
  }
  removeEdge(v, w, name) {
    var e = arguments.length === 1 ? edgeObjToId(this._isDirected, arguments[0]) : edgeArgsToId(this._isDirected, v, w, name);
    var edge = this._edgeObjs[e];
    if (edge) {
      v = edge.v;
      w = edge.w;
      delete this._edgeLabels[e];
      delete this._edgeObjs[e];
      decrementOrRemoveEntry(this._preds[w], v);
      decrementOrRemoveEntry(this._sucs[v], w);
      delete this._in[w][e];
      delete this._out[v][e];
      this._edgeCount--;
    }
    return this;
  }
  inEdges(v, u) {
    var inV = this._in[v];
    if (inV) {
      var edges = _.values(inV);
      if (!u) {
        return edges;
      }
      return _.filter(edges, function(edge) {
        return edge.v === u;
      });
    }
  }
  outEdges(v, w) {
    var outV = this._out[v];
    if (outV) {
      var edges = _.values(outV);
      if (!w) {
        return edges;
      }
      return _.filter(edges, function(edge) {
        return edge.w === w;
      });
    }
  }
  nodeEdges(v, w) {
    var inEdges = this.inEdges(v, w);
    if (inEdges) {
      return inEdges.concat(this.outEdges(v, w));
    }
  }
};
Graph.prototype._nodeCount = 0;
Graph.prototype._edgeCount = 0;
function incrementOrInitEntry(map12, k) {
  if (map12[k]) {
    map12[k]++;
  } else {
    map12[k] = 1;
  }
}
function decrementOrRemoveEntry(map12, k) {
  if (!--map12[k]) {
    delete map12[k];
  }
}
function edgeArgsToId(isDirected, v_, w_, name) {
  var v = "" + v_;
  var w = "" + w_;
  if (!isDirected && v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (_.isUndefined(name) ? DEFAULT_EDGE_NAME : name);
}
function edgeArgsToObj(isDirected, v_, w_, name) {
  var v = "" + v_;
  var w = "" + w_;
  if (!isDirected && v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  var edgeObj = { v, w };
  if (name) {
    edgeObj.name = name;
  }
  return edgeObj;
}
function edgeObjToId(isDirected, edgeObj) {
  return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
}

// src/graphlib/json.js
var json_exports = {};
__export(json_exports, {
  read: () => read,
  write: () => write
});
import * as _2 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function write(g) {
  var json = {
    options: {
      directed: g.isDirected(),
      multigraph: g.isMultigraph(),
      compound: g.isCompound()
    },
    nodes: writeNodes(g),
    edges: writeEdges(g)
  };
  if (!_2.isUndefined(g.graph())) {
    json.value = _2.clone(g.graph());
  }
  return json;
}
function writeNodes(g) {
  return _2.map(g.nodes(), function(v) {
    var nodeValue = g.node(v);
    var parent = g.parent(v);
    var node = { v };
    if (!_2.isUndefined(nodeValue)) {
      node.value = nodeValue;
    }
    if (!_2.isUndefined(parent)) {
      node.parent = parent;
    }
    return node;
  });
}
function writeEdges(g) {
  return _2.map(g.edges(), function(e) {
    var edgeValue = g.edge(e);
    var edge = { v: e.v, w: e.w };
    if (!_2.isUndefined(e.name)) {
      edge.name = e.name;
    }
    if (!_2.isUndefined(edgeValue)) {
      edge.value = edgeValue;
    }
    return edge;
  });
}
function read(json) {
  var g = new Graph(json.options).setGraph(json.value);
  _2.each(json.nodes, function(entry) {
    g.setNode(entry.v, entry.value);
    if (entry.parent) {
      g.setParent(entry.v, entry.parent);
    }
  });
  _2.each(json.edges, function(entry) {
    g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
  });
  return g;
}

// src/graphlib/index.js
var version = "2.1.9-pre";

// src/dagre/data/list.js
var List = class {
  constructor() {
    var sentinel = {};
    sentinel._next = sentinel._prev = sentinel;
    this._sentinel = sentinel;
  }
  dequeue() {
    var sentinel = this._sentinel;
    var entry = sentinel._prev;
    if (entry !== sentinel) {
      unlink(entry);
      return entry;
    }
  }
  enqueue(entry) {
    var sentinel = this._sentinel;
    if (entry._prev && entry._next) {
      unlink(entry);
    }
    entry._next = sentinel._next;
    sentinel._next._prev = entry;
    sentinel._next = entry;
    entry._prev = sentinel;
  }
  toString() {
    var strs = [];
    var sentinel = this._sentinel;
    var curr = sentinel._prev;
    while (curr !== sentinel) {
      strs.push(JSON.stringify(curr, filterOutLinks));
      curr = curr._prev;
    }
    return "[" + strs.join(", ") + "]";
  }
};
function unlink(entry) {
  entry._prev._next = entry._next;
  entry._next._prev = entry._prev;
  delete entry._next;
  delete entry._prev;
}
function filterOutLinks(k, v) {
  if (k !== "_next" && k !== "_prev") {
    return v;
  }
}

// src/dagre/greedy-fas.js
var DEFAULT_WEIGHT_FN = _3.constant(1);
function greedyFAS(g, weightFn) {
  if (g.nodeCount() <= 1) {
    return [];
  }
  var state = buildState(g, weightFn || DEFAULT_WEIGHT_FN);
  var results = doGreedyFAS(state.graph, state.buckets, state.zeroIdx);
  return _3.flatten(
    _3.map(results, function(e) {
      return g.outEdges(e.v, e.w);
    })
  );
}
function doGreedyFAS(g, buckets, zeroIdx) {
  var results = [];
  var sources = buckets[buckets.length - 1];
  var sinks = buckets[0];
  var entry;
  while (g.nodeCount()) {
    while (entry = sinks.dequeue()) {
      removeNode(g, buckets, zeroIdx, entry);
    }
    while (entry = sources.dequeue()) {
      removeNode(g, buckets, zeroIdx, entry);
    }
    if (g.nodeCount()) {
      for (var i = buckets.length - 2; i > 0; --i) {
        entry = buckets[i].dequeue();
        if (entry) {
          results = results.concat(removeNode(g, buckets, zeroIdx, entry, true));
          break;
        }
      }
    }
  }
  return results;
}
function removeNode(g, buckets, zeroIdx, entry, collectPredecessors) {
  var results = collectPredecessors ? [] : void 0;
  _3.forEach(g.inEdges(entry.v), function(edge) {
    var weight = g.edge(edge);
    var uEntry = g.node(edge.v);
    if (collectPredecessors) {
      results.push({ v: edge.v, w: edge.w });
    }
    uEntry.out -= weight;
    assignBucket(buckets, zeroIdx, uEntry);
  });
  _3.forEach(g.outEdges(entry.v), function(edge) {
    var weight = g.edge(edge);
    var w = edge.w;
    var wEntry = g.node(w);
    wEntry["in"] -= weight;
    assignBucket(buckets, zeroIdx, wEntry);
  });
  g.removeNode(entry.v);
  return results;
}
function buildState(g, weightFn) {
  var fasGraph = new Graph();
  var maxIn = 0;
  var maxOut = 0;
  _3.forEach(g.nodes(), function(v) {
    fasGraph.setNode(v, { v, in: 0, out: 0 });
  });
  _3.forEach(g.edges(), function(e) {
    var prevWeight = fasGraph.edge(e.v, e.w) || 0;
    var weight = weightFn(e);
    var edgeWeight = prevWeight + weight;
    fasGraph.setEdge(e.v, e.w, edgeWeight);
    maxOut = Math.max(maxOut, fasGraph.node(e.v).out += weight);
    maxIn = Math.max(maxIn, fasGraph.node(e.w)["in"] += weight);
  });
  var buckets = _3.range(maxOut + maxIn + 3).map(function() {
    return new List();
  });
  var zeroIdx = maxIn + 1;
  _3.forEach(fasGraph.nodes(), function(v) {
    assignBucket(buckets, zeroIdx, fasGraph.node(v));
  });
  return { graph: fasGraph, buckets, zeroIdx };
}
function assignBucket(buckets, zeroIdx, entry) {
  if (!entry.out) {
    buckets[0].enqueue(entry);
  } else if (!entry["in"]) {
    buckets[buckets.length - 1].enqueue(entry);
  } else {
    buckets[entry.out - entry["in"] + zeroIdx].enqueue(entry);
  }
}

// src/dagre/acyclic.js
function run(g) {
  var fas = g.graph().acyclicer === "greedy" ? greedyFAS(g, weightFn(g)) : dfsFAS(g);
  _4.forEach(fas, function(e) {
    var label = g.edge(e);
    g.removeEdge(e);
    label.forwardName = e.name;
    label.reversed = true;
    g.setEdge(e.w, e.v, label, _4.uniqueId("rev"));
  });
  function weightFn(g2) {
    return function(e) {
      return g2.edge(e).weight;
    };
  }
}
function dfsFAS(g) {
  var fas = [];
  var stack = {};
  var visited = {};
  function dfs3(v) {
    if (Object.prototype.hasOwnProperty.call(visited, v)) {
      return;
    }
    visited[v] = true;
    stack[v] = true;
    _4.forEach(g.outEdges(v), function(e) {
      if (Object.prototype.hasOwnProperty.call(stack, e.w)) {
        fas.push(e);
      } else {
        dfs3(e.w);
      }
    });
    delete stack[v];
  }
  _4.forEach(g.nodes(), dfs3);
  return fas;
}
function undo(g) {
  _4.forEach(g.edges(), function(e) {
    var label = g.edge(e);
    if (label.reversed) {
      g.removeEdge(e);
      var forwardName = label.forwardName;
      delete label.reversed;
      delete label.forwardName;
      g.setEdge(e.w, e.v, label, forwardName);
    }
  });
}

// src/dagre/layout.js
import * as _33 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/dagre/add-border-segments.js
import * as _6 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/dagre/util.js
import * as _5 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function addDummyNode(g, type, attrs, name) {
  var v;
  do {
    v = _5.uniqueId(name);
  } while (g.hasNode(v));
  attrs.dummy = type;
  g.setNode(v, attrs);
  return v;
}
function simplify(g) {
  var simplified = new Graph().setGraph(g.graph());
  _5.forEach(g.nodes(), function(v) {
    simplified.setNode(v, g.node(v));
  });
  _5.forEach(g.edges(), function(e) {
    var simpleLabel = simplified.edge(e.v, e.w) || { weight: 0, minlen: 1 };
    var label = g.edge(e);
    simplified.setEdge(e.v, e.w, {
      weight: simpleLabel.weight + label.weight,
      minlen: Math.max(simpleLabel.minlen, label.minlen)
    });
  });
  return simplified;
}
function asNonCompoundGraph(g) {
  var simplified = new Graph({ multigraph: g.isMultigraph() }).setGraph(g.graph());
  _5.forEach(g.nodes(), function(v) {
    if (!g.children(v).length) {
      simplified.setNode(v, g.node(v));
    }
  });
  _5.forEach(g.edges(), function(e) {
    simplified.setEdge(e, g.edge(e));
  });
  return simplified;
}
function intersectRect(rect2, point) {
  var x = rect2.x;
  var y = rect2.y;
  var dx = point.x - x;
  var dy = point.y - y;
  var w = rect2.width / 2;
  var h = rect2.height / 2;
  if (!dx && !dy) {
    throw new Error("Not possible to find intersection inside of the rectangle");
  }
  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    if (dy < 0) {
      h = -h;
    }
    sx = h * dx / dy;
    sy = h;
  } else {
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = w * dy / dx;
  }
  return { x: x + sx, y: y + sy };
}
function buildLayerMatrix(g) {
  var layering = _5.map(_5.range(maxRank(g) + 1), function() {
    return [];
  });
  _5.forEach(g.nodes(), function(v) {
    var node = g.node(v);
    if (!node) node = {};
    var rank2 = node.rank;
    if (!_5.isUndefined(rank2)) {
      layering[rank2][node.order] = v;
    }
  });
  return layering;
}
function normalizeRanks(g) {
  var min4 = _5.min(
    _5.map(g.nodes(), function(v) {
      return g.node(v).rank;
    })
  );
  _5.forEach(g.nodes(), function(v) {
    var node = g.node(v);
    if (_5.has(node, "rank")) {
      node.rank -= min4;
    }
  });
}
function removeEmptyRanks(g) {
  var offset = _5.min(
    _5.map(g.nodes(), function(v) {
      return g.node(v).rank;
    })
  );
  var layers = [];
  _5.forEach(g.nodes(), function(v) {
    var rank2 = g.node(v).rank - offset;
    if (!layers[rank2]) {
      layers[rank2] = [];
    }
    layers[rank2].push(v);
  });
  var delta = 0;
  var nodeRankFactor = g.graph().nodeRankFactor;
  _5.forEach(layers, function(vs, i) {
    if (_5.isUndefined(vs) && i % nodeRankFactor !== 0) {
      --delta;
    } else if (delta) {
      _5.forEach(vs, function(v) {
        g.node(v).rank += delta;
      });
    }
  });
}
function addBorderNode(g, prefix, rank2, order2) {
  var node = {
    width: 0,
    height: 0
  };
  if (arguments.length >= 4) {
    node.rank = rank2;
    node.order = order2;
  }
  return addDummyNode(g, "border", node, prefix);
}
function maxRank(g) {
  return _5.max(
    _5.map(g.nodes(), function(v) {
      if (!g.node(v)) return 0;
      var rank2 = g.node(v).rank;
      if (!_5.isUndefined(rank2)) {
        return rank2;
      }
    })
  );
}
function partition(collection, fn) {
  var result = { lhs: [], rhs: [] };
  _5.forEach(collection, function(value) {
    if (fn(value)) {
      result.lhs.push(value);
    } else {
      result.rhs.push(value);
    }
  });
  return result;
}
function time(name, fn) {
  var start = _5.now();
  try {
    return fn();
  } finally {
    console.log(name + " time: " + (_5.now() - start) + "ms");
  }
}
function notime(name, fn) {
  return fn();
}

// src/dagre/add-border-segments.js
function addBorderSegments(g) {
  function dfs3(v) {
    var children = g.children(v);
    var node = g.node(v);
    if (children.length) {
      _6.forEach(children, dfs3);
    }
    if (Object.prototype.hasOwnProperty.call(node, "minRank")) {
      node.borderLeft = [];
      node.borderRight = [];
      for (var rank2 = node.minRank, maxRank2 = node.maxRank + 1; rank2 < maxRank2; ++rank2) {
        addBorderNode2(g, "borderLeft", "_bl", v, node, rank2);
        addBorderNode2(g, "borderRight", "_br", v, node, rank2);
      }
    }
  }
  _6.forEach(g.children(), dfs3);
}
function addBorderNode2(g, prop, prefix, sg, sgNode, rank2) {
  var label = { width: 0, height: 0, rank: rank2, borderType: prop };
  var prev = sgNode[prop][rank2 - 1];
  var curr = addDummyNode(g, "border", label, prefix);
  sgNode[prop][rank2] = curr;
  g.setParent(curr, sg);
  if (prev) {
    g.setEdge(prev, curr, { weight: 1 });
  }
}

// src/dagre/coordinate-system.js
import * as _7 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function adjust(g) {
  var rankDir = g.graph().rankdir.toLowerCase();
  if (rankDir === "lr" || rankDir === "rl") {
    swapWidthHeight(g);
  }
}
function undo2(g) {
  var rankDir = g.graph().rankdir.toLowerCase();
  if (rankDir === "bt" || rankDir === "rl") {
    reverseY(g);
  }
  if (rankDir === "lr" || rankDir === "rl") {
    swapXY(g);
    swapWidthHeight(g);
  }
}
function swapWidthHeight(g) {
  _7.forEach(g.nodes(), function(v) {
    swapWidthHeightOne(g.node(v));
  });
  _7.forEach(g.edges(), function(e) {
    swapWidthHeightOne(g.edge(e));
  });
}
function swapWidthHeightOne(attrs) {
  var w = attrs.width;
  attrs.width = attrs.height;
  attrs.height = w;
}
function reverseY(g) {
  _7.forEach(g.nodes(), function(v) {
    reverseYOne(g.node(v));
  });
  _7.forEach(g.edges(), function(e) {
    var edge = g.edge(e);
    _7.forEach(edge.points, reverseYOne);
    if (Object.prototype.hasOwnProperty.call(edge, "y")) {
      reverseYOne(edge);
    }
  });
}
function reverseYOne(attrs) {
  attrs.y = -attrs.y;
}
function swapXY(g) {
  _7.forEach(g.nodes(), function(v) {
    swapXYOne(g.node(v));
  });
  _7.forEach(g.edges(), function(e) {
    var edge = g.edge(e);
    _7.forEach(edge.points, swapXYOne);
    if (Object.prototype.hasOwnProperty.call(edge, "x")) {
      swapXYOne(edge);
    }
  });
}
function swapXYOne(attrs) {
  var x = attrs.x;
  attrs.x = attrs.y;
  attrs.y = x;
}

// src/dagre/normalize.js
import * as _8 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function run2(g) {
  g.graph().dummyChains = [];
  _8.forEach(g.edges(), function(edge) {
    normalizeEdge(g, edge);
  });
}
function normalizeEdge(g, e) {
  var v = e.v;
  var vRank = g.node(v).rank;
  var w = e.w;
  var wRank = g.node(w).rank;
  var name = e.name;
  var edgeLabel = g.edge(e);
  var labelRank = edgeLabel.labelRank;
  if (wRank === vRank + 1) return;
  g.removeEdge(e);
  var attrs = void 0;
  var dummy, i;
  for (i = 0, ++vRank; vRank < wRank; ++i, ++vRank) {
    edgeLabel.points = [];
    attrs = {
      width: 0,
      height: 0,
      edgeLabel,
      edgeObj: e,
      rank: vRank
    };
    dummy = addDummyNode(g, "edge", attrs, "_d");
    if (vRank === labelRank) {
      attrs.width = edgeLabel.width;
      attrs.height = edgeLabel.height;
      attrs.dummy = "edge-label";
      attrs.labelpos = edgeLabel.labelpos;
    }
    g.setEdge(v, dummy, { weight: edgeLabel.weight }, name);
    if (i === 0) {
      g.graph().dummyChains.push(dummy);
    }
    v = dummy;
  }
  g.setEdge(v, w, { weight: edgeLabel.weight }, name);
}
function undo3(g) {
  _8.forEach(g.graph().dummyChains, function(v) {
    var node = g.node(v);
    var origLabel = node.edgeLabel;
    var w;
    g.setEdge(node.edgeObj, origLabel);
    while (node.dummy) {
      w = g.successors(v)[0];
      g.removeNode(v);
      origLabel.points.push({ x: node.x, y: node.y });
      if (node.dummy === "edge-label") {
        origLabel.x = node.x;
        origLabel.y = node.y;
        origLabel.width = node.width;
        origLabel.height = node.height;
      }
      v = w;
      node = g.node(v);
    }
  });
}

// src/dagre/rank/feasible-tree.js
import * as _10 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/dagre/rank/util.js
import * as _9 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function longestPath(g) {
  var visited = {};
  function dfs3(v) {
    var label = g.node(v);
    if (Object.prototype.hasOwnProperty.call(visited, v)) {
      return label.rank;
    }
    visited[v] = true;
    var rank2 = _9.min(
      _9.map(g.outEdges(v), function(e) {
        return dfs3(e.w) - g.edge(e).minlen;
      })
    );
    if (rank2 === Number.POSITIVE_INFINITY || // return value of _.map([]) for Lodash 3
    rank2 === void 0 || // return value of _.map([]) for Lodash 4
    rank2 === null) {
      rank2 = 0;
    }
    if (!label) label = {};
    return label.rank = rank2;
  }
  _9.forEach(g.sources(), dfs3);
}
function slack(g, e) {
  const evRank = g.node(e.v) ? g.node(e.v).rank || 0 : 0;
  return g.node(e.w).rank - evRank - g.edge(e).minlen;
}

// src/dagre/rank/feasible-tree.js
function feasibleTree(g) {
  var t = new Graph({ directed: false });
  var start = g.nodes()[0];
  var size2 = g.nodeCount();
  t.setNode(start, {});
  var edge, delta;
  while (tightTree(t, g) < size2) {
    edge = findMinSlackEdge(t, g);
    delta = t.hasNode(edge.v) ? slack(g, edge) : -slack(g, edge);
    shiftRanks(t, g, delta);
  }
  return t;
}
function tightTree(t, g) {
  function dfs3(v) {
    _10.forEach(g.nodeEdges(v), function(e) {
      var edgeV = e.v, w = v === edgeV ? e.w : edgeV;
      if (!t.hasNode(w) && !slack(g, e)) {
        t.setNode(w, {});
        t.setEdge(v, w, {});
        dfs3(w);
      }
    });
  }
  _10.forEach(t.nodes(), dfs3);
  return t.nodeCount();
}
function findMinSlackEdge(t, g) {
  return _10.minBy(g.edges(), function(e) {
    if (t.hasNode(e.v) !== t.hasNode(e.w)) {
      return slack(g, e);
    }
  });
}
function shiftRanks(t, g, delta) {
  _10.forEach(t.nodes(), function(v) {
    g.node(v).rank += delta;
  });
}

// src/dagre/rank/network-simplex.js
import * as _19 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/graphlib/alg/components.js
import * as _11 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/graphlib/alg/dijkstra.js
import * as _12 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
var DEFAULT_WEIGHT_FUNC = _12.constant(1);

// src/graphlib/alg/dijkstra-all.js
import * as _13 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/graphlib/alg/find-cycles.js
import * as _14 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/graphlib/alg/floyd-warshall.js
import * as _15 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
var DEFAULT_WEIGHT_FUNC2 = _15.constant(1);

// src/graphlib/alg/topsort.js
import * as _16 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
topsort.CycleException = CycleException;
function topsort(g) {
  var visited = {};
  var stack = {};
  var results = [];
  function visit(node) {
    if (Object.prototype.hasOwnProperty.call(stack, node)) {
      throw new CycleException();
    }
    if (!Object.prototype.hasOwnProperty.call(visited, node)) {
      stack[node] = true;
      visited[node] = true;
      _16.each(g.predecessors(node), visit);
      delete stack[node];
      results.push(node);
    }
  }
  _16.each(g.sinks(), visit);
  if (_16.size(visited) !== g.nodeCount()) {
    throw new CycleException();
  }
  return results;
}
function CycleException() {
}
CycleException.prototype = new Error();

// src/graphlib/alg/dfs.js
import * as _17 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function dfs(g, vs, order2) {
  if (!_17.isArray(vs)) {
    vs = [vs];
  }
  var navigation = (g.isDirected() ? g.successors : g.neighbors).bind(g);
  var acc = [];
  var visited = {};
  _17.each(vs, function(v) {
    if (!g.hasNode(v)) {
      throw new Error("Graph does not have node: " + v);
    }
    doDfs(g, v, order2 === "post", visited, navigation, acc);
  });
  return acc;
}
function doDfs(g, v, postorder3, visited, navigation, acc) {
  if (!Object.prototype.hasOwnProperty.call(visited, v)) {
    visited[v] = true;
    if (!postorder3) {
      acc.push(v);
    }
    _17.each(navigation(v), function(w) {
      doDfs(g, w, postorder3, visited, navigation, acc);
    });
    if (postorder3) {
      acc.push(v);
    }
  }
}

// src/graphlib/alg/postorder.js
function postorder(g, vs) {
  return dfs(g, vs, "post");
}

// src/graphlib/alg/preorder.js
function preorder(g, vs) {
  return dfs(g, vs, "pre");
}

// src/graphlib/alg/prim.js
import * as _18 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/dagre/rank/network-simplex.js
networkSimplex.initLowLimValues = initLowLimValues;
networkSimplex.initCutValues = initCutValues;
networkSimplex.calcCutValue = calcCutValue;
networkSimplex.leaveEdge = leaveEdge;
networkSimplex.enterEdge = enterEdge;
networkSimplex.exchangeEdges = exchangeEdges;
function networkSimplex(g) {
  g = simplify(g);
  longestPath(g);
  var t = feasibleTree(g);
  initLowLimValues(t);
  initCutValues(t, g);
  var e, f;
  while (e = leaveEdge(t)) {
    f = enterEdge(t, g, e);
    exchangeEdges(t, g, e, f);
  }
}
function initCutValues(t, g) {
  var vs = postorder(t, t.nodes());
  vs = vs.slice(0, vs.length - 1);
  _19.forEach(vs, function(v) {
    assignCutValue(t, g, v);
  });
}
function assignCutValue(t, g, child) {
  var childLab = t.node(child);
  var parent = childLab.parent;
  t.edge(child, parent).cutvalue = calcCutValue(t, g, child);
}
function calcCutValue(t, g, child) {
  var childLab = t.node(child);
  var parent = childLab.parent;
  var childIsTail = true;
  var graphEdge = g.edge(child, parent);
  var cutValue = 0;
  if (!graphEdge) {
    childIsTail = false;
    graphEdge = g.edge(parent, child);
  }
  cutValue = graphEdge.weight;
  _19.forEach(g.nodeEdges(child), function(e) {
    var isOutEdge = e.v === child, other = isOutEdge ? e.w : e.v;
    if (other !== parent) {
      var pointsToHead = isOutEdge === childIsTail, otherWeight = g.edge(e).weight;
      cutValue += pointsToHead ? otherWeight : -otherWeight;
      if (isTreeEdge(t, child, other)) {
        var otherCutValue = t.edge(child, other).cutvalue;
        cutValue += pointsToHead ? -otherCutValue : otherCutValue;
      }
    }
  });
  return cutValue;
}
function initLowLimValues(tree, root) {
  if (arguments.length < 2) {
    root = tree.nodes()[0];
  }
  dfsAssignLowLim(tree, {}, 1, root);
}
function dfsAssignLowLim(tree, visited, nextLim, v, parent) {
  var low = nextLim;
  var label = tree.node(v);
  visited[v] = true;
  _19.forEach(tree.neighbors(v), function(w) {
    if (!Object.prototype.hasOwnProperty.call(visited, w)) {
      nextLim = dfsAssignLowLim(tree, visited, nextLim, w, v);
    }
  });
  label.low = low;
  label.lim = nextLim++;
  if (parent) {
    label.parent = parent;
  } else {
    delete label.parent;
  }
  return nextLim;
}
function leaveEdge(tree) {
  return _19.find(tree.edges(), function(e) {
    return tree.edge(e).cutvalue < 0;
  });
}
function enterEdge(t, g, edge) {
  var v = edge.v;
  var w = edge.w;
  if (!g.hasEdge(v, w)) {
    v = edge.w;
    w = edge.v;
  }
  var vLabel = t.node(v);
  var wLabel = t.node(w);
  var tailLabel = vLabel;
  var flip = false;
  if (vLabel.lim > wLabel.lim) {
    tailLabel = wLabel;
    flip = true;
  }
  var candidates = _19.filter(g.edges(), function(edge2) {
    return flip === isDescendant(t, t.node(edge2.v), tailLabel) && flip !== isDescendant(t, t.node(edge2.w), tailLabel);
  });
  return _19.minBy(candidates, function(edge2) {
    return slack(g, edge2);
  });
}
function exchangeEdges(t, g, e, f) {
  var v = e.v;
  var w = e.w;
  t.removeEdge(v, w);
  t.setEdge(f.v, f.w, {});
  initLowLimValues(t);
  initCutValues(t, g);
  updateRanks(t, g);
}
function updateRanks(t, g) {
  var root = _19.find(t.nodes(), function(v) {
    return !g.node(v).parent;
  });
  var vs = preorder(t, root);
  vs = vs.slice(1);
  _19.forEach(vs, function(v) {
    var parent = t.node(v).parent, edge = g.edge(v, parent), flipped = false;
    if (!edge) {
      edge = g.edge(parent, v);
      flipped = true;
    }
    if (g.node(v)) {
      const parentRank = g.node(parent) ? g.node(parent).rank : 0;
      g.node(v).rank = parentRank + (flipped ? edge.minlen : -edge.minlen);
    }
  });
}
function isTreeEdge(tree, u, v) {
  return tree.hasEdge(u, v);
}
function isDescendant(tree, vLabel, rootLabel) {
  return rootLabel.low <= vLabel.lim && vLabel.lim <= rootLabel.lim;
}

// src/dagre/rank/index.js
function rank(g) {
  switch (g.graph().ranker) {
    case "network-simplex":
      networkSimplexRanker(g);
      break;
    case "tight-tree":
      tightTreeRanker(g);
      break;
    case "longest-path":
      longestPathRanker(g);
      break;
    default:
      networkSimplexRanker(g);
  }
}
var longestPathRanker = longestPath;
function tightTreeRanker(g) {
  longestPath(g);
  feasibleTree(g);
}
function networkSimplexRanker(g) {
  networkSimplex(g);
}

// src/dagre/nesting-graph.js
import * as _20 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function run3(g) {
  var root = addDummyNode(g, "root", {}, "_root");
  var depths = treeDepths(g);
  var height = _20.max(_20.values(depths)) - 1;
  var nodeSep = 2 * height + 1;
  g.graph().nestingRoot = root;
  _20.forEach(g.edges(), function(e) {
    g.edge(e).minlen *= nodeSep;
  });
  var weight = sumWeights(g) + 1;
  _20.forEach(g.children(), function(child) {
    dfs2(g, root, nodeSep, weight, height, depths, child);
  });
  g.graph().nodeRankFactor = nodeSep;
}
function dfs2(g, root, nodeSep, weight, height, depths, v) {
  var children = g.children(v);
  if (!children.length) {
    if (v !== root) {
      g.setEdge(root, v, { weight: 0, minlen: nodeSep });
    }
    return;
  }
  var top = addBorderNode(g, "_bt");
  var bottom = addBorderNode(g, "_bb");
  var label = g.node(v);
  g.setParent(top, v);
  label.borderTop = top;
  g.setParent(bottom, v);
  label.borderBottom = bottom;
  _20.forEach(children, function(child) {
    dfs2(g, root, nodeSep, weight, height, depths, child);
    var childNode = g.node(child);
    var childTop = childNode.borderTop ? childNode.borderTop : child;
    var childBottom = childNode.borderBottom ? childNode.borderBottom : child;
    var thisWeight = childNode.borderTop ? weight : 2 * weight;
    var minlen = childTop !== childBottom ? 1 : height - depths[v] + 1;
    g.setEdge(top, childTop, {
      weight: thisWeight,
      minlen,
      nestingEdge: true
    });
    g.setEdge(childBottom, bottom, {
      weight: thisWeight,
      minlen,
      nestingEdge: true
    });
  });
  if (!g.parent(v)) {
    g.setEdge(root, top, { weight: 0, minlen: height + depths[v] });
  }
}
function treeDepths(g) {
  var depths = {};
  function dfs3(v, depth) {
    var children = g.children(v);
    if (children && children.length) {
      _20.forEach(children, function(child) {
        dfs3(child, depth + 1);
      });
    }
    depths[v] = depth;
  }
  _20.forEach(g.children(), function(v) {
    dfs3(v, 1);
  });
  return depths;
}
function sumWeights(g) {
  return _20.reduce(
    g.edges(),
    function(acc, e) {
      return acc + g.edge(e).weight;
    },
    0
  );
}
function cleanup(g) {
  var graphLabel = g.graph();
  g.removeNode(graphLabel.nestingRoot);
  delete graphLabel.nestingRoot;
  _20.forEach(g.edges(), function(e) {
    var edge = g.edge(e);
    if (edge.nestingEdge) {
      g.removeEdge(e);
    }
  });
}

// src/dagre/order/index.js
import * as _29 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/dagre/order/add-subgraph-constraints.js
import * as _21 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function addSubgraphConstraints(g, cg, vs) {
  var prev = {}, rootPrev;
  _21.forEach(vs, function(v) {
    var child = g.parent(v), parent, prevChild;
    while (child) {
      parent = g.parent(child);
      if (parent) {
        prevChild = prev[parent];
        prev[parent] = child;
      } else {
        prevChild = rootPrev;
        rootPrev = child;
      }
      if (prevChild && prevChild !== child) {
        cg.setEdge(prevChild, child);
        return;
      }
      child = parent;
    }
  });
}

// src/dagre/order/build-layer-graph.js
import * as _22 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function buildLayerGraph(g, rank2, relationship) {
  var root = createRootNode(g), result = new Graph({ compound: true }).setGraph({ root }).setDefaultNodeLabel(function(v) {
    return g.node(v);
  });
  _22.forEach(g.nodes(), function(v) {
    var node = g.node(v), parent = g.parent(v);
    if (node.rank === rank2 || node.minRank <= rank2 && rank2 <= node.maxRank) {
      result.setNode(v);
      result.setParent(v, parent || root);
      _22.forEach(g[relationship](v), function(e) {
        var u = e.v === v ? e.w : e.v, edge = result.edge(u, v), weight = !_22.isUndefined(edge) ? edge.weight : 0;
        result.setEdge(u, v, { weight: g.edge(e).weight + weight });
      });
      if (Object.prototype.hasOwnProperty.call(node, "minRank")) {
        result.setNode(v, {
          borderLeft: node.borderLeft[rank2],
          borderRight: node.borderRight[rank2]
        });
      }
    }
  });
  return result;
}
function createRootNode(g) {
  var v;
  while (g.hasNode(v = _22.uniqueId("_root"))) ;
  return v;
}

// src/dagre/order/cross-count.js
import * as _23 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function crossCount(g, layering) {
  var cc = 0;
  for (var i = 1; i < layering.length; ++i) {
    cc += twoLayerCrossCount(g, layering[i - 1], layering[i]);
  }
  return cc;
}
function twoLayerCrossCount(g, northLayer, southLayer) {
  var southPos = _23.zipObject(
    southLayer,
    _23.map(southLayer, function(v, i) {
      return i;
    })
  );
  var southEntries = _23.flatten(
    _23.map(northLayer, function(v) {
      return _23.sortBy(
        _23.map(g.outEdges(v), function(e) {
          return { pos: southPos[e.w], weight: g.edge(e).weight };
        }),
        "pos"
      );
    })
  );
  var firstIndex = 1;
  while (firstIndex < southLayer.length) firstIndex <<= 1;
  var treeSize = 2 * firstIndex - 1;
  firstIndex -= 1;
  var tree = _23.map(new Array(treeSize), function() {
    return 0;
  });
  var cc = 0;
  _23.forEach(
    // @ts-expect-error
    southEntries.forEach(function(entry) {
      var index = entry.pos + firstIndex;
      tree[index] += entry.weight;
      var weightSum = 0;
      while (index > 0) {
        if (index % 2) {
          weightSum += tree[index + 1];
        }
        index = index - 1 >> 1;
        tree[index] += entry.weight;
      }
      cc += entry.weight * weightSum;
    })
  );
  return cc;
}

// src/dagre/order/init-order.js
import * as _24 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function initOrder(g) {
  var visited = {};
  var simpleNodes = _24.filter(g.nodes(), function(v) {
    return !g.children(v).length;
  });
  var maxRank2 = _24.max(
    _24.map(simpleNodes, function(v) {
      return g.node(v).rank;
    })
  );
  var layers = _24.map(_24.range(maxRank2 + 1), function() {
    return [];
  });
  function dfs3(v) {
    if (_24.has(visited, v)) return;
    visited[v] = true;
    var node = g.node(v);
    layers[node.rank].push(v);
    _24.forEach(g.successors(v), dfs3);
  }
  var orderedVs = _24.sortBy(simpleNodes, function(v) {
    return g.node(v).rank;
  });
  _24.forEach(orderedVs, dfs3);
  return layers;
}

// src/dagre/order/sort-subgraph.js
import * as _28 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/dagre/order/barycenter.js
import * as _25 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function barycenter(g, movable) {
  return _25.map(movable, function(v) {
    var inV = g.inEdges(v);
    if (!inV.length) {
      return { v };
    } else {
      var result = _25.reduce(
        inV,
        function(acc, e) {
          var edge = g.edge(e), nodeU = g.node(e.v);
          return {
            sum: acc.sum + edge.weight * nodeU.order,
            weight: acc.weight + edge.weight
          };
        },
        { sum: 0, weight: 0 }
      );
      return {
        v,
        barycenter: result.sum / result.weight,
        weight: result.weight
      };
    }
  });
}

// src/dagre/order/resolve-conflicts.js
import * as _26 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function resolveConflicts(entries, cg) {
  var mappedEntries = {};
  _26.forEach(entries, function(entry, i) {
    var tmp = mappedEntries[entry.v] = {
      indegree: 0,
      in: [],
      out: [],
      vs: [entry.v],
      i
    };
    if (!_26.isUndefined(entry.barycenter)) {
      tmp.barycenter = entry.barycenter;
      tmp.weight = entry.weight;
    }
  });
  _26.forEach(cg.edges(), function(e) {
    var entryV = mappedEntries[e.v];
    var entryW = mappedEntries[e.w];
    if (!_26.isUndefined(entryV) && !_26.isUndefined(entryW)) {
      entryW.indegree++;
      entryV.out.push(mappedEntries[e.w]);
    }
  });
  var sourceSet = _26.filter(mappedEntries, function(entry) {
    return !entry.indegree;
  });
  return doResolveConflicts(sourceSet);
}
function doResolveConflicts(sourceSet) {
  var entries = [];
  function handleIn(vEntry) {
    return function(uEntry) {
      if (uEntry.merged) {
        return;
      }
      if (_26.isUndefined(uEntry.barycenter) || _26.isUndefined(vEntry.barycenter) || uEntry.barycenter >= vEntry.barycenter) {
        mergeEntries(vEntry, uEntry);
      }
    };
  }
  function handleOut(vEntry) {
    return function(wEntry) {
      wEntry["in"].push(vEntry);
      if (--wEntry.indegree === 0) {
        sourceSet.push(wEntry);
      }
    };
  }
  while (sourceSet.length) {
    var entry = sourceSet.pop();
    entries.push(entry);
    _26.forEach(entry["in"].reverse(), handleIn(entry));
    _26.forEach(entry.out, handleOut(entry));
  }
  return _26.map(
    _26.filter(entries, function(entry2) {
      return !entry2.merged;
    }),
    function(entry2) {
      return _26.pick(entry2, ["vs", "i", "barycenter", "weight"]);
    }
  );
}
function mergeEntries(target, source) {
  var sum = 0;
  var weight = 0;
  if (target.weight) {
    sum += target.barycenter * target.weight;
    weight += target.weight;
  }
  if (source.weight) {
    sum += source.barycenter * source.weight;
    weight += source.weight;
  }
  target.vs = source.vs.concat(target.vs);
  target.barycenter = sum / weight;
  target.weight = weight;
  target.i = Math.min(source.i, target.i);
  source.merged = true;
}

// src/dagre/order/sort.js
import * as _27 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function sort(entries, biasRight) {
  var parts = partition(entries, function(entry) {
    return Object.prototype.hasOwnProperty.call(entry, "barycenter");
  });
  var sortable = parts.lhs, unsortable = _27.sortBy(parts.rhs, function(entry) {
    return -entry.i;
  }), vs = [], sum = 0, weight = 0, vsIndex = 0;
  sortable.sort(compareWithBias(!!biasRight));
  vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
  _27.forEach(sortable, function(entry) {
    vsIndex += entry.vs.length;
    vs.push(entry.vs);
    sum += entry.barycenter * entry.weight;
    weight += entry.weight;
    vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
  });
  var result = { vs: _27.flatten(vs) };
  if (weight) {
    result.barycenter = sum / weight;
    result.weight = weight;
  }
  return result;
}
function consumeUnsortable(vs, unsortable, index) {
  var last4;
  while (unsortable.length && (last4 = _27.last(unsortable)).i <= index) {
    unsortable.pop();
    vs.push(last4.vs);
    index++;
  }
  return index;
}
function compareWithBias(bias) {
  return function(entryV, entryW) {
    if (entryV.barycenter < entryW.barycenter) {
      return -1;
    } else if (entryV.barycenter > entryW.barycenter) {
      return 1;
    }
    return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
  };
}

// src/dagre/order/sort-subgraph.js
function sortSubgraph(g, v, cg, biasRight) {
  var movable = g.children(v);
  var node = g.node(v);
  var bl = node ? node.borderLeft : void 0;
  var br = node ? node.borderRight : void 0;
  var subgraphs = {};
  if (bl) {
    movable = _28.filter(movable, function(w) {
      return w !== bl && w !== br;
    });
  }
  var barycenters = barycenter(g, movable);
  _28.forEach(barycenters, function(entry) {
    if (g.children(entry.v).length) {
      var subgraphResult = sortSubgraph(g, entry.v, cg, biasRight);
      subgraphs[entry.v] = subgraphResult;
      if (Object.prototype.hasOwnProperty.call(subgraphResult, "barycenter")) {
        mergeBarycenters(entry, subgraphResult);
      }
    }
  });
  var entries = resolveConflicts(barycenters, cg);
  expandSubgraphs(entries, subgraphs);
  var result = sort(entries, biasRight);
  if (bl) {
    result.vs = _28.flatten([bl, result.vs, br]);
    if (g.predecessors(bl).length) {
      var blPred = g.node(g.predecessors(bl)[0]), brPred = g.node(g.predecessors(br)[0]);
      if (!Object.prototype.hasOwnProperty.call(result, "barycenter")) {
        result.barycenter = 0;
        result.weight = 0;
      }
      result.barycenter = (result.barycenter * result.weight + blPred.order + brPred.order) / (result.weight + 2);
      result.weight += 2;
    }
  }
  return result;
}
function expandSubgraphs(entries, subgraphs) {
  _28.forEach(entries, function(entry) {
    entry.vs = _28.flatten(
      entry.vs.map(function(v) {
        if (subgraphs[v]) {
          return subgraphs[v].vs;
        }
        return v;
      })
    );
  });
}
function mergeBarycenters(target, other) {
  if (!_28.isUndefined(target.barycenter)) {
    target.barycenter = (target.barycenter * target.weight + other.barycenter * other.weight) / (target.weight + other.weight);
    target.weight += other.weight;
  } else {
    target.barycenter = other.barycenter;
    target.weight = other.weight;
  }
}

// src/dagre/order/index.js
function order(g) {
  var maxRank2 = maxRank(g), downLayerGraphs = buildLayerGraphs(g, _29.range(1, maxRank2 + 1), "inEdges"), upLayerGraphs = buildLayerGraphs(g, _29.range(maxRank2 - 1, -1, -1), "outEdges");
  var layering = initOrder(g);
  assignOrder(g, layering);
  var bestCC = Number.POSITIVE_INFINITY, best;
  for (var i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
    sweepLayerGraphs(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2);
    layering = buildLayerMatrix(g);
    var cc = crossCount(g, layering);
    if (cc < bestCC) {
      lastBest = 0;
      best = _29.cloneDeep(layering);
      bestCC = cc;
    }
  }
  assignOrder(g, best);
}
function buildLayerGraphs(g, ranks, relationship) {
  return _29.map(ranks, function(rank2) {
    return buildLayerGraph(g, rank2, relationship);
  });
}
function sweepLayerGraphs(layerGraphs, biasRight) {
  var cg = new Graph();
  _29.forEach(layerGraphs, function(lg) {
    var root = lg.graph().root;
    var sorted = sortSubgraph(lg, root, cg, biasRight);
    _29.forEach(sorted.vs, function(v, i) {
      lg.node(v).order = i;
    });
    addSubgraphConstraints(lg, cg, sorted.vs);
  });
}
function assignOrder(g, layering) {
  _29.forEach(layering, function(layer) {
    _29.forEach(layer, function(v, i) {
      g.node(v).order = i;
    });
  });
}

// src/dagre/parent-dummy-chains.js
import * as _30 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function parentDummyChains(g) {
  var postorderNums = postorder2(g);
  _30.forEach(g.graph().dummyChains, function(v) {
    var node = g.node(v);
    var edgeObj = node.edgeObj;
    var pathData = findPath(g, postorderNums, edgeObj.v, edgeObj.w);
    var path = pathData.path;
    var lca = pathData.lca;
    var pathIdx = 0;
    var pathV = path[pathIdx];
    var ascending = true;
    while (v !== edgeObj.w) {
      node = g.node(v);
      if (ascending) {
        while ((pathV = path[pathIdx]) !== lca && g.node(pathV).maxRank < node.rank) {
          pathIdx++;
        }
        if (pathV === lca) {
          ascending = false;
        }
      }
      if (!ascending) {
        while (pathIdx < path.length - 1 && g.node(pathV = path[pathIdx + 1]).minRank <= node.rank) {
          pathIdx++;
        }
        pathV = path[pathIdx];
      }
      g.setParent(v, pathV);
      v = g.successors(v)[0];
    }
  });
}
function findPath(g, postorderNums, v, w) {
  var vPath = [];
  var wPath = [];
  var low = Math.min(postorderNums[v].low, postorderNums[w].low);
  var lim = Math.max(postorderNums[v].lim, postorderNums[w].lim);
  var parent;
  var lca;
  parent = v;
  do {
    parent = g.parent(parent);
    vPath.push(parent);
  } while (parent && (postorderNums[parent].low > low || lim > postorderNums[parent].lim));
  lca = parent;
  parent = w;
  while ((parent = g.parent(parent)) !== lca) {
    wPath.push(parent);
  }
  return { path: vPath.concat(wPath.reverse()), lca };
}
function postorder2(g) {
  var result = {};
  var lim = 0;
  function dfs3(v) {
    var low = lim;
    _30.forEach(g.children(v), dfs3);
    result[v] = { low, lim: lim++ };
  }
  _30.forEach(g.children(), dfs3);
  return result;
}

// src/dagre/position/index.js
import * as _32 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/dagre/position/bk.js
import * as _31 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function findType1Conflicts(g, layering) {
  var conflicts = {};
  function visitLayer(prevLayer, layer) {
    var k0 = 0, scanPos = 0, prevLayerLength = prevLayer.length, lastNode = _31.last(layer);
    _31.forEach(layer, function(v, i) {
      var w = findOtherInnerSegmentNode(g, v), k1 = w ? g.node(w).order : prevLayerLength;
      if (w || v === lastNode) {
        _31.forEach(layer.slice(scanPos, i + 1), function(scanNode) {
          _31.forEach(g.predecessors(scanNode), function(u) {
            const uLabel = g.node(u) || {};
            const uPos = uLabel.order;
            if ((uPos < k0 || k1 < uPos) && !(uLabel.dummy && g.node(scanNode).dummy)) {
              addConflict(conflicts, u, scanNode);
            }
          });
        });
        scanPos = i + 1;
        k0 = k1;
      }
    });
    return layer;
  }
  _31.reduce(layering, visitLayer);
  return conflicts;
}
function findType2Conflicts(g, layering) {
  var conflicts = {};
  function scan(south, southPos, southEnd, prevNorthBorder, nextNorthBorder) {
    var v;
    _31.forEach(_31.range(southPos, southEnd), function(i) {
      v = south[i];
      if (g.node(v).dummy) {
        _31.forEach(g.predecessors(v), function(u) {
          var uNode = g.node(u);
          if (uNode.dummy && (uNode.order < prevNorthBorder || uNode.order > nextNorthBorder)) {
            addConflict(conflicts, u, v);
          }
        });
      }
    });
  }
  function visitLayer(north, south) {
    var prevNorthPos = -1, nextNorthPos, southPos = 0;
    _31.forEach(south, function(v, southLookahead) {
      if (g.node(v).dummy === "border") {
        var predecessors = g.predecessors(v);
        if (predecessors.length) {
          nextNorthPos = g.node(predecessors[0]).order;
          scan(south, southPos, southLookahead, prevNorthPos, nextNorthPos);
          southPos = southLookahead;
          prevNorthPos = nextNorthPos;
        }
      }
      scan(south, southPos, south.length, nextNorthPos, north.length);
    });
    return south;
  }
  _31.reduce(layering, visitLayer);
  return conflicts;
}
function findOtherInnerSegmentNode(g, v) {
  if (g.node(v).dummy) {
    return _31.find(g.predecessors(v), function(u) {
      return g.node(u).dummy;
    });
  }
}
function addConflict(conflicts, v, w) {
  if (v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  var conflictsV = conflicts[v];
  if (!conflictsV) {
    conflicts[v] = conflictsV = {};
  }
  conflictsV[w] = true;
}
function hasConflict(conflicts, v, w) {
  if (v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  return !!conflicts[v] && Object.prototype.hasOwnProperty.call(conflicts[v], w);
}
function verticalAlignment(g, layering, conflicts, neighborFn) {
  var root = {}, align = {}, pos = {};
  _31.forEach(layering, function(layer) {
    _31.forEach(layer, function(v, order2) {
      root[v] = v;
      align[v] = v;
      pos[v] = order2;
    });
  });
  _31.forEach(layering, function(layer) {
    var prevIdx = -1;
    _31.forEach(layer, function(v) {
      var ws = neighborFn(v);
      if (ws.length) {
        ws = _31.sortBy(ws, function(w2) {
          return pos[w2];
        });
        var mp = (ws.length - 1) / 2;
        for (var i = Math.floor(mp), il = Math.ceil(mp); i <= il; ++i) {
          var w = ws[i];
          if (align[v] === v && prevIdx < pos[w] && !hasConflict(conflicts, v, w)) {
            align[w] = v;
            align[v] = root[v] = root[w];
            prevIdx = pos[w];
          }
        }
      }
    });
  });
  return { root, align };
}
function horizontalCompaction(g, layering, root, align, reverseSep) {
  var xs = {}, blockG = buildBlockGraph(g, layering, root, reverseSep), borderType = reverseSep ? "borderLeft" : "borderRight";
  function iterate(setXsFunc, nextNodesFunc) {
    var stack = blockG.nodes();
    var elem = stack.pop();
    var visited = {};
    while (elem) {
      if (visited[elem]) {
        setXsFunc(elem);
      } else {
        visited[elem] = true;
        stack.push(elem);
        stack = stack.concat(nextNodesFunc(elem));
      }
      elem = stack.pop();
    }
  }
  function pass1(elem) {
    xs[elem] = blockG.inEdges(elem).reduce(function(acc, e) {
      return Math.max(acc, xs[e.v] + blockG.edge(e));
    }, 0);
  }
  function pass2(elem) {
    var min4 = blockG.outEdges(elem).reduce(function(acc, e) {
      return Math.min(acc, xs[e.w] - blockG.edge(e));
    }, Number.POSITIVE_INFINITY);
    var node = g.node(elem);
    if (min4 !== Number.POSITIVE_INFINITY && node.borderType !== borderType) {
      xs[elem] = Math.max(xs[elem], min4);
    }
  }
  iterate(pass1, blockG.predecessors.bind(blockG));
  iterate(pass2, blockG.successors.bind(blockG));
  _31.forEach(align, function(v) {
    xs[v] = xs[root[v]];
  });
  return xs;
}
function buildBlockGraph(g, layering, root, reverseSep) {
  var blockGraph = new Graph(), graphLabel = g.graph(), sepFn = sep(graphLabel.nodesep, graphLabel.edgesep, reverseSep);
  _31.forEach(layering, function(layer) {
    var u;
    _31.forEach(layer, function(v) {
      var vRoot = root[v];
      blockGraph.setNode(vRoot);
      if (u) {
        var uRoot = root[u], prevMax = blockGraph.edge(uRoot, vRoot);
        blockGraph.setEdge(uRoot, vRoot, Math.max(sepFn(g, v, u), prevMax || 0));
      }
      u = v;
    });
  });
  return blockGraph;
}
function findSmallestWidthAlignment(g, xss) {
  return _31.minBy(_31.values(xss), function(xs) {
    var max7 = Number.NEGATIVE_INFINITY;
    var min4 = Number.POSITIVE_INFINITY;
    _31.forIn(xs, function(x, v) {
      var halfWidth = width(g, v) / 2;
      max7 = Math.max(x + halfWidth, max7);
      min4 = Math.min(x - halfWidth, min4);
    });
    return max7 - min4;
  });
}
function alignCoordinates(xss, alignTo) {
  var alignToVals = _31.values(alignTo), alignToMin = _31.min(alignToVals), alignToMax = _31.max(alignToVals);
  _31.forEach(["u", "d"], function(vert) {
    _31.forEach(["l", "r"], function(horiz) {
      var alignment = vert + horiz, xs = xss[alignment], delta;
      if (xs === alignTo) return;
      var xsVals = _31.values(xs);
      delta = horiz === "l" ? alignToMin - _31.min(xsVals) : alignToMax - _31.max(xsVals);
      if (delta) {
        xss[alignment] = _31.mapValues(xs, function(x) {
          return x + delta;
        });
      }
    });
  });
}
function balance(xss, align) {
  return _31.mapValues(xss.ul, function(ignore, v) {
    if (align) {
      return xss[align.toLowerCase()][v];
    } else {
      var xs = _31.sortBy(_31.map(xss, v));
      return (xs[1] + xs[2]) / 2;
    }
  });
}
function positionX(g) {
  var layering = buildLayerMatrix(g);
  var conflicts = _31.merge(findType1Conflicts(g, layering), findType2Conflicts(g, layering));
  var xss = {};
  var adjustedLayering;
  _31.forEach(["u", "d"], function(vert) {
    adjustedLayering = vert === "u" ? layering : _31.values(layering).reverse();
    _31.forEach(["l", "r"], function(horiz) {
      if (horiz === "r") {
        adjustedLayering = _31.map(adjustedLayering, function(inner) {
          return _31.values(inner).reverse();
        });
      }
      var neighborFn = (vert === "u" ? g.predecessors : g.successors).bind(g);
      var align = verticalAlignment(g, adjustedLayering, conflicts, neighborFn);
      var xs = horizontalCompaction(g, adjustedLayering, align.root, align.align, horiz === "r");
      if (horiz === "r") {
        xs = _31.mapValues(xs, function(x) {
          return -x;
        });
      }
      xss[vert + horiz] = xs;
    });
  });
  var smallestWidth = findSmallestWidthAlignment(g, xss);
  alignCoordinates(xss, smallestWidth);
  return balance(xss, g.graph().align);
}
function sep(nodeSep, edgeSep, reverseSep) {
  return function(g, v, w) {
    var vLabel = g.node(v);
    var wLabel = g.node(w);
    var sum = 0;
    var delta;
    sum += vLabel.width / 2;
    if (Object.prototype.hasOwnProperty.call(vLabel, "labelpos")) {
      switch (vLabel.labelpos.toLowerCase()) {
        case "l":
          delta = -vLabel.width / 2;
          break;
        case "r":
          delta = vLabel.width / 2;
          break;
      }
    }
    if (delta) {
      sum += reverseSep ? delta : -delta;
    }
    delta = 0;
    sum += (vLabel.dummy ? edgeSep : nodeSep) / 2;
    sum += (wLabel.dummy ? edgeSep : nodeSep) / 2;
    sum += wLabel.width / 2;
    if (Object.prototype.hasOwnProperty.call(wLabel, "labelpos")) {
      switch (wLabel.labelpos.toLowerCase()) {
        case "l":
          delta = wLabel.width / 2;
          break;
        case "r":
          delta = -wLabel.width / 2;
          break;
      }
    }
    if (delta) {
      sum += reverseSep ? delta : -delta;
    }
    delta = 0;
    return sum;
  };
}
function width(g, v) {
  return g.node(v).width;
}

// src/dagre/position/index.js
function position(g) {
  g = asNonCompoundGraph(g);
  positionY(g);
  _32.forOwn(positionX(g), function(x, v) {
    g.node(v).x = x;
  });
}
function positionY(g) {
  var layering = buildLayerMatrix(g);
  var rankSep = g.graph().ranksep;
  var prevY = 0;
  _32.forEach(layering, function(layer) {
    var maxHeight = _32.max(
      _32.map(layer, function(v) {
        return g.node(v).height;
      })
    );
    _32.forEach(layer, function(v) {
      g.node(v).y = prevY + maxHeight / 2;
    });
    prevY += maxHeight + rankSep;
  });
}

// src/dagre/layout.js
function layout(g, opts) {
  var time2 = opts && opts.debugTiming ? time : notime;
  time2("layout", () => {
    var layoutGraph = time2("  buildLayoutGraph", () => buildLayoutGraph(g));
    time2("  runLayout", () => runLayout(layoutGraph, time2));
    time2("  updateInputGraph", () => updateInputGraph(g, layoutGraph));
  });
}
function runLayout(g, time2) {
  time2("    makeSpaceForEdgeLabels", () => makeSpaceForEdgeLabels(g));
  time2("    removeSelfEdges", () => removeSelfEdges(g));
  time2("    acyclic", () => run(g));
  time2("    nestingGraph.run", () => run3(g));
  time2("    rank", () => rank(asNonCompoundGraph(g)));
  time2("    injectEdgeLabelProxies", () => injectEdgeLabelProxies(g));
  time2("    removeEmptyRanks", () => removeEmptyRanks(g));
  time2("    nestingGraph.cleanup", () => cleanup(g));
  time2("    normalizeRanks", () => normalizeRanks(g));
  time2("    assignRankMinMax", () => assignRankMinMax(g));
  time2("    removeEdgeLabelProxies", () => removeEdgeLabelProxies(g));
  time2("    normalize.run", () => run2(g));
  time2("    parentDummyChains", () => parentDummyChains(g));
  time2("    addBorderSegments", () => addBorderSegments(g));
  time2("    order", () => order(g));
  time2("    insertSelfEdges", () => insertSelfEdges(g));
  time2("    adjustCoordinateSystem", () => adjust(g));
  time2("    position", () => position(g));
  time2("    positionSelfEdges", () => positionSelfEdges(g));
  time2("    removeBorderNodes", () => removeBorderNodes(g));
  time2("    normalize.undo", () => undo3(g));
  time2("    fixupEdgeLabelCoords", () => fixupEdgeLabelCoords(g));
  time2("    undoCoordinateSystem", () => undo2(g));
  time2("    translateGraph", () => translateGraph(g));
  time2("    assignNodeIntersects", () => assignNodeIntersects(g));
  time2("    reversePoints", () => reversePointsForReversedEdges(g));
  time2("    acyclic.undo", () => undo(g));
}
function updateInputGraph(inputGraph, layoutGraph) {
  _33.forEach(inputGraph.nodes(), function(v) {
    var inputLabel = inputGraph.node(v);
    var layoutLabel = layoutGraph.node(v);
    if (inputLabel) {
      inputLabel.x = layoutLabel.x;
      inputLabel.y = layoutLabel.y;
      if (layoutGraph.children(v).length) {
        inputLabel.width = layoutLabel.width;
        inputLabel.height = layoutLabel.height;
      }
    }
  });
  _33.forEach(inputGraph.edges(), function(e) {
    var inputLabel = inputGraph.edge(e);
    var layoutLabel = layoutGraph.edge(e);
    inputLabel.points = layoutLabel.points;
    if (Object.prototype.hasOwnProperty.call(layoutLabel, "x")) {
      inputLabel.x = layoutLabel.x;
      inputLabel.y = layoutLabel.y;
    }
  });
  inputGraph.graph().width = layoutGraph.graph().width;
  inputGraph.graph().height = layoutGraph.graph().height;
}
var graphNumAttrs = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"];
var graphDefaults = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" };
var graphAttrs = ["acyclicer", "ranker", "rankdir", "align"];
var nodeNumAttrs = ["width", "height"];
var nodeDefaults = { width: 0, height: 0 };
var edgeNumAttrs = ["minlen", "weight", "width", "height", "labeloffset"];
var edgeDefaults = {
  minlen: 1,
  weight: 1,
  width: 0,
  height: 0,
  labeloffset: 10,
  labelpos: "r"
};
var edgeAttrs = ["labelpos"];
function buildLayoutGraph(inputGraph) {
  var g = new Graph({ multigraph: true, compound: true });
  var graph = canonicalize(inputGraph.graph());
  g.setGraph(
    _33.merge({}, graphDefaults, selectNumberAttrs(graph, graphNumAttrs), _33.pick(graph, graphAttrs))
  );
  _33.forEach(inputGraph.nodes(), function(v) {
    var node = canonicalize(inputGraph.node(v));
    g.setNode(v, _33.defaults(selectNumberAttrs(node, nodeNumAttrs), nodeDefaults));
    g.setParent(v, inputGraph.parent(v));
  });
  _33.forEach(inputGraph.edges(), function(e) {
    var edge = canonicalize(inputGraph.edge(e));
    g.setEdge(
      e,
      _33.merge({}, edgeDefaults, selectNumberAttrs(edge, edgeNumAttrs), _33.pick(edge, edgeAttrs))
    );
  });
  return g;
}
function makeSpaceForEdgeLabels(g) {
  var graph = g.graph();
  graph.ranksep /= 2;
  _33.forEach(g.edges(), function(e) {
    var edge = g.edge(e);
    edge.minlen *= 2;
    if (edge.labelpos.toLowerCase() !== "c") {
      if (graph.rankdir === "TB" || graph.rankdir === "BT") {
        edge.width += edge.labeloffset;
      } else {
        edge.height += edge.labeloffset;
      }
    }
  });
}
function injectEdgeLabelProxies(g) {
  _33.forEach(g.edges(), function(e) {
    var edge = g.edge(e);
    if (edge.width && edge.height) {
      var v = g.node(e.v);
      var w = g.node(e.w);
      var label = { rank: (w.rank - v.rank) / 2 + v.rank, e };
      addDummyNode(g, "edge-proxy", label, "_ep");
    }
  });
}
function assignRankMinMax(g) {
  var maxRank2 = 0;
  _33.forEach(g.nodes(), function(v) {
    var node = g.node(v);
    if (node.borderTop) {
      node.minRank = g.node(node.borderTop).rank;
      node.maxRank = g.node(node.borderBottom).rank;
      maxRank2 = _33.max(maxRank2, node.maxRank);
    }
  });
  g.graph().maxRank = maxRank2;
}
function removeEdgeLabelProxies(g) {
  _33.forEach(g.nodes(), function(v) {
    var node = g.node(v);
    if (node.dummy === "edge-proxy") {
      g.edge(node.e).labelRank = node.rank;
      g.removeNode(v);
    }
  });
}
function translateGraph(g) {
  var minX = Number.POSITIVE_INFINITY;
  var maxX = 0;
  var minY = Number.POSITIVE_INFINITY;
  var maxY = 0;
  var graphLabel = g.graph();
  var marginX = graphLabel.marginx || 0;
  var marginY = graphLabel.marginy || 0;
  function getExtremes(attrs) {
    var x = attrs.x;
    var y = attrs.y;
    var w = attrs.width;
    var h = attrs.height;
    minX = Math.min(minX, x - w / 2);
    maxX = Math.max(maxX, x + w / 2);
    minY = Math.min(minY, y - h / 2);
    maxY = Math.max(maxY, y + h / 2);
  }
  _33.forEach(g.nodes(), function(v) {
    getExtremes(g.node(v));
  });
  _33.forEach(g.edges(), function(e) {
    var edge = g.edge(e);
    if (Object.prototype.hasOwnProperty.call(edge, "x")) {
      getExtremes(edge);
    }
  });
  minX -= marginX;
  minY -= marginY;
  _33.forEach(g.nodes(), function(v) {
    var node = g.node(v);
    node.x -= minX;
    node.y -= minY;
  });
  _33.forEach(g.edges(), function(e) {
    var edge = g.edge(e);
    _33.forEach(edge.points, function(p) {
      p.x -= minX;
      p.y -= minY;
    });
    if (Object.prototype.hasOwnProperty.call(edge, "x")) {
      edge.x -= minX;
    }
    if (Object.prototype.hasOwnProperty.call(edge, "y")) {
      edge.y -= minY;
    }
  });
  graphLabel.width = maxX - minX + marginX;
  graphLabel.height = maxY - minY + marginY;
}
function assignNodeIntersects(g) {
  _33.forEach(g.edges(), function(e) {
    var edge = g.edge(e);
    var nodeV = g.node(e.v);
    var nodeW = g.node(e.w);
    var p1, p2;
    if (!edge.points) {
      edge.points = [];
      p1 = nodeW;
      p2 = nodeV;
    } else {
      p1 = edge.points[0];
      p2 = edge.points[edge.points.length - 1];
    }
    edge.points.unshift(intersectRect(nodeV, p1));
    edge.points.push(intersectRect(nodeW, p2));
  });
}
function fixupEdgeLabelCoords(g) {
  _33.forEach(g.edges(), function(e) {
    var edge = g.edge(e);
    if (Object.prototype.hasOwnProperty.call(edge, "x")) {
      if (edge.labelpos === "l" || edge.labelpos === "r") {
        edge.width -= edge.labeloffset;
      }
      switch (edge.labelpos) {
        case "l":
          edge.x -= edge.width / 2 + edge.labeloffset;
          break;
        case "r":
          edge.x += edge.width / 2 + edge.labeloffset;
          break;
      }
    }
  });
}
function reversePointsForReversedEdges(g) {
  _33.forEach(g.edges(), function(e) {
    var edge = g.edge(e);
    if (edge.reversed) {
      edge.points.reverse();
    }
  });
}
function removeBorderNodes(g) {
  _33.forEach(g.nodes(), function(v) {
    if (g.children(v).length) {
      var node = g.node(v);
      var t = g.node(node.borderTop);
      var b = g.node(node.borderBottom);
      var l = g.node(_33.last(node.borderLeft));
      var r = g.node(_33.last(node.borderRight));
      node.width = Math.abs(r.x - l.x);
      node.height = Math.abs(b.y - t.y);
      node.x = l.x + node.width / 2;
      node.y = t.y + node.height / 2;
    }
  });
  _33.forEach(g.nodes(), function(v) {
    if (g.node(v).dummy === "border") {
      g.removeNode(v);
    }
  });
}
function removeSelfEdges(g) {
  _33.forEach(g.edges(), function(e) {
    if (e.v === e.w) {
      var node = g.node(e.v);
      if (!node.selfEdges) {
        node.selfEdges = [];
      }
      node.selfEdges.push({ e, label: g.edge(e) });
      g.removeEdge(e);
    }
  });
}
function insertSelfEdges(g) {
  var layers = buildLayerMatrix(g);
  _33.forEach(layers, function(layer) {
    var orderShift = 0;
    _33.forEach(layer, function(v, i) {
      var node = g.node(v);
      node.order = i + orderShift;
      _33.forEach(node.selfEdges, function(selfEdge) {
        addDummyNode(
          g,
          "selfedge",
          {
            width: selfEdge.label.width,
            height: selfEdge.label.height,
            rank: node.rank,
            order: i + ++orderShift,
            e: selfEdge.e,
            label: selfEdge.label
          },
          "_se"
        );
      });
      delete node.selfEdges;
    });
  });
}
function positionSelfEdges(g) {
  _33.forEach(g.nodes(), function(v) {
    var node = g.node(v);
    if (node.dummy === "selfedge") {
      var selfNode = g.node(node.e.v);
      var x = selfNode.x + selfNode.width / 2;
      var y = selfNode.y;
      var dx = node.x - x;
      var dy = selfNode.height / 2;
      g.setEdge(node.e, node.label);
      g.removeNode(v);
      node.label.points = [
        { x: x + 2 * dx / 3, y: y - dy },
        { x: x + 5 * dx / 6, y: y - dy },
        { x: x + dx, y },
        { x: x + 5 * dx / 6, y: y + dy },
        { x: x + 2 * dx / 3, y: y + dy }
      ];
      node.label.x = node.x;
      node.label.y = node.y;
    }
  });
}
function selectNumberAttrs(obj, attrs) {
  return _33.mapValues(_33.pick(obj, attrs), Number);
}
function canonicalize(attrs) {
  var newAttrs = {};
  _33.forEach(attrs, function(v, k) {
    newAttrs[k.toLowerCase()] = v;
  });
  return newAttrs;
}

// src/dagre-js/util.js
import * as _34 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
function isSubgraph(g, v) {
  return !!g.children(v).length;
}
function edgeToId(e) {
  return escapeId(e.v) + ":" + escapeId(e.w) + ":" + escapeId(e.name);
}
var ID_DELIM = /:/g;
function escapeId(str) {
  return str ? String(str).replace(ID_DELIM, "\\:") : "";
}
function applyStyle(dom, styleFn) {
  if (styleFn) {
    dom.attr("style", styleFn);
  }
}
function applyClass(dom, classFn, otherClasses) {
  if (classFn) {
    dom.attr("class", classFn).attr("class", otherClasses + " " + dom.attr("class"));
  }
}
function applyTransition(selection, g) {
  var graph = g.graph();
  if (_34.isPlainObject(graph)) {
    var transition = graph.transition;
    if (_34.isFunction(transition)) {
      return transition(selection);
    }
  }
  return selection;
}

// src/dagre-js/arrows.js
var arrows = {
  normal,
  vee,
  undirected
};
function setArrows(value) {
  arrows = value;
}
function normal(parent, id, edge, type) {
  var marker = parent.append("marker").attr("id", id).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto");
  var path = marker.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  applyStyle(path, edge[type + "Style"]);
  if (edge[type + "Class"]) {
    path.attr("class", edge[type + "Class"]);
  }
}
function vee(parent, id, edge, type) {
  var marker = parent.append("marker").attr("id", id).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto");
  var path = marker.append("path").attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  applyStyle(path, edge[type + "Style"]);
  if (edge[type + "Class"]) {
    path.attr("class", edge[type + "Class"]);
  }
}
function undirected(parent, id, edge, type) {
  var marker = parent.append("marker").attr("id", id).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto");
  var path = marker.append("path").attr("d", "M 0 5 L 10 5").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  applyStyle(path, edge[type + "Style"]);
  if (edge[type + "Class"]) {
    path.attr("class", edge[type + "Class"]);
  }
}

// src/dagre-js/create-clusters.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// src/dagre-js/label/add-html-label.js
function addHtmlLabel(root, node) {
  var fo = root.append("foreignObject").attr("width", "100000");
  var div = fo.append("xhtml:div");
  div.attr("xmlns", "http://www.w3.org/1999/xhtml");
  var label = node.label;
  switch (typeof label) {
    case "function":
      div.insert(label);
      break;
    case "object":
      div.insert(function() {
        return label;
      });
      break;
    default:
      div.html(label);
  }
  applyStyle(div, node.labelStyle);
  div.style("display", "inline-block");
  div.style("white-space", "nowrap");
  var client = div.node().getBoundingClientRect();
  fo.attr("width", client.width).attr("height", client.height);
  return fo;
}

// src/dagre-js/label/add-svg-label.js
function addSVGLabel(root, node) {
  var domNode = root;
  domNode.node().appendChild(node.label);
  applyStyle(domNode, node.labelStyle);
  return domNode;
}

// src/dagre-js/label/add-text-label.js
function addTextLabel(root, node) {
  var domNode = root.append("text");
  var lines = processEscapeSequences(node.label).split("\n");
  for (var i = 0; i < lines.length; i++) {
    domNode.append("tspan").attr("xml:space", "preserve").attr("dy", "1em").attr("x", "1").text(lines[i]);
  }
  applyStyle(domNode, node.labelStyle);
  return domNode;
}
function processEscapeSequences(text) {
  var newText = "";
  var escaped = false;
  var ch;
  for (var i = 0; i < text.length; ++i) {
    ch = text[i];
    if (escaped) {
      switch (ch) {
        case "n":
          newText += "\n";
          break;
        default:
          newText += ch;
      }
      escaped = false;
    } else if (ch === "\\") {
      escaped = true;
    } else {
      newText += ch;
    }
  }
  return newText;
}

// src/dagre-js/label/add-label.js
function addLabel(root, node, location2) {
  var label = node.label;
  var labelSvg = root.append("g");
  if (node.labelType === "svg") {
    addSVGLabel(labelSvg, node);
  } else if (typeof label !== "string" || node.labelType === "html") {
    addHtmlLabel(labelSvg, node);
  } else {
    addTextLabel(labelSvg, node);
  }
  var labelBBox = labelSvg.node().getBBox();
  var y;
  switch (location2) {
    case "top":
      y = -node.height / 2;
      break;
    case "bottom":
      y = node.height / 2 - labelBBox.height;
      break;
    default:
      y = -labelBBox.height / 2;
  }
  labelSvg.attr("transform", "translate(" + -labelBBox.width / 2 + "," + y + ")");
  return labelSvg;
}

// src/dagre-js/create-clusters.js
var createClusters = function(selection, g) {
  var clusters = g.nodes().filter(function(v) {
    return isSubgraph(g, v);
  });
  var svgClusters = selection.selectAll("g.cluster").data(clusters, function(v) {
    return v;
  });
  applyTransition(svgClusters.exit(), g).style("opacity", 0).remove();
  var enterSelection = svgClusters.enter().append("g").attr("class", "cluster").attr("id", function(v) {
    var node = g.node(v);
    return node.id;
  }).style("opacity", 0).each(function(v) {
    var node = g.node(v);
    var thisGroup = d3.select(this);
    d3.select(this).append("rect");
    var labelGroup = thisGroup.append("g").attr("class", "label");
    addLabel(labelGroup, node, node.clusterLabelPos);
  });
  svgClusters = svgClusters.merge(enterSelection);
  svgClusters = applyTransition(svgClusters, g).style("opacity", 1);
  svgClusters.selectAll("rect").each(function(c) {
    var node = g.node(c);
    var domCluster = d3.select(this);
    applyStyle(domCluster, node.style);
  });
  return svgClusters;
};
function setCreateClusters(value) {
  createClusters = value;
}

// src/dagre-js/create-edge-labels.js
import * as d32 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
var createEdgeLabels = function(selection, g) {
  var svgEdgeLabels = selection.selectAll("g.edgeLabel").data(g.edges(), function(e) {
    return edgeToId(e);
  }).classed("update", true);
  svgEdgeLabels.exit().remove();
  svgEdgeLabels.enter().append("g").classed("edgeLabel", true).style("opacity", 0);
  svgEdgeLabels = selection.selectAll("g.edgeLabel");
  svgEdgeLabels.each(function(e) {
    var root = d32.select(this);
    root.select(".label").remove();
    var edge = g.edge(e);
    var label = addLabel(root, g.edge(e), 0).classed("label", true);
    var bbox = label.node().getBBox();
    if (edge.labelId) {
      label.attr("id", edge.labelId);
    }
    if (!Object.prototype.hasOwnProperty.call(edge, "width")) {
      edge.width = bbox.width;
    }
    if (!Object.prototype.hasOwnProperty.call(edge, "height")) {
      edge.height = bbox.height;
    }
  });
  var exitSelection;
  if (svgEdgeLabels.exit) {
    exitSelection = svgEdgeLabels.exit();
  } else {
    exitSelection = svgEdgeLabels.selectAll(null);
  }
  applyTransition(exitSelection, g).style("opacity", 0).remove();
  return svgEdgeLabels;
};
function setCreateEdgeLabels(value) {
  createEdgeLabels = value;
}

// src/dagre-js/create-edge-paths.js
import * as d33 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import * as _35 from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";

// src/dagre-js/intersect/intersect-node.js
var intersect_node_exports = {};
__export(intersect_node_exports, {
  intersectNode: () => intersectNode
});
function intersectNode(node, point) {
  if (!node) return false;
  return node.intersect(point);
}

// src/dagre-js/create-edge-paths.js
var createEdgePaths = function(selection, g, arrows2) {
  var previousPaths = selection.selectAll("g.edgePath").data(g.edges(), function(e) {
    return edgeToId(e);
  }).classed("update", true);
  var newPaths = enter(previousPaths, g);
  exit(previousPaths, g);
  var svgPaths = previousPaths.merge !== void 0 ? previousPaths.merge(newPaths) : previousPaths;
  applyTransition(svgPaths, g).style("opacity", 1);
  svgPaths.each(function(e) {
    var domEdge = d33.select(this);
    var edge = g.edge(e);
    edge.elem = this;
    if (edge.id) {
      domEdge.attr("id", edge.id);
    }
    applyClass(
      domEdge,
      edge["class"],
      (domEdge.classed("update") ? "update " : "") + "edgePath"
    );
  });
  svgPaths.selectAll("path.path").each(function(e) {
    var edge = g.edge(e);
    edge.arrowheadId = _35.uniqueId("arrowhead");
    var domEdge = d33.select(this).attr("marker-end", function() {
      return "url(" + makeFragmentRef(location.href, edge.arrowheadId) + ")";
    }).style("fill", "none");
    applyTransition(domEdge, g).attr("d", function(e2) {
      return calcPoints(g, e2);
    });
    applyStyle(domEdge, edge.style);
  });
  svgPaths.selectAll("defs *").remove();
  svgPaths.selectAll("defs").each(function(e) {
    var edge = g.edge(e);
    var arrowhead = arrows2[edge.arrowhead];
    arrowhead(d33.select(this), edge.arrowheadId, edge, "arrowhead");
  });
  return svgPaths;
};
function setCreateEdgePaths(value) {
  createEdgePaths = value;
}
function makeFragmentRef(url, fragmentId) {
  var baseUrl = url.split("#")[0];
  return baseUrl + "#" + fragmentId;
}
function calcPoints(g, e) {
  var edge = g.edge(e);
  var tail = g.node(e.v);
  var head = g.node(e.w);
  var points = edge.points.slice(1, edge.points.length - 1);
  points.unshift(intersectNode(tail, points[0]));
  points.push(intersectNode(head, points[points.length - 1]));
  return createLine(edge, points);
}
function createLine(edge, points) {
  var line2 = (d33.line || d33.svg.line)().x(function(d) {
    return d.x;
  }).y(function(d) {
    return d.y;
  });
  (line2.curve || line2.interpolate)(edge.curve);
  return line2(points);
}
function getCoords(elem) {
  if (!elem) return { x: 0, y: 0 };
  var bbox = elem.getBBox();
  var matrix = elem.ownerSVGElement.getScreenCTM().inverse().multiply(elem.getScreenCTM()).translate(bbox.width / 2, bbox.height / 2);
  return { x: matrix.e, y: matrix.f };
}
function enter(svgPaths, g) {
  var svgPathsEnter = svgPaths.enter().append("g").attr("class", "edgePath").style("opacity", 0);
  svgPathsEnter.append("path").attr("class", "path").attr("d", function(e) {
    var edge = g.edge(e);
    var sourceElem = g.node(e.v).elem;
    var points = _35.range(edge.points.length).map(function() {
      return getCoords(sourceElem);
    });
    return createLine(edge, points);
  });
  svgPathsEnter.append("defs");
  return svgPathsEnter;
}
function exit(svgPaths, g) {
  var svgPathExit = svgPaths.exit();
  applyTransition(svgPathExit, g).style("opacity", 0).remove();
}

// src/dagre-js/create-nodes.js
import * as d34 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { pick as pick3 } from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js";
var createNodes = function(selection, g, shapes2) {
  var simpleNodes = g.nodes().filter(function(v) {
    return !isSubgraph(g, v);
  });
  var svgNodes = selection.selectAll("g.node").data(simpleNodes, function(v) {
    return v;
  }).classed("update", true);
  svgNodes.exit().remove();
  svgNodes.enter().append("g").attr("class", "node").style("opacity", 0);
  svgNodes = selection.selectAll("g.node");
  svgNodes.each(function(v) {
    var node = g.node(v);
    var thisGroup = d34.select(this);
    applyClass(
      thisGroup,
      node["class"],
      (thisGroup.classed("update") ? "update " : "") + "node"
    );
    thisGroup.select("g.label").remove();
    var labelGroup = thisGroup.append("g").attr("class", "label");
    var labelDom = addLabel(labelGroup, node);
    var shape = shapes2[node.shape];
    var bbox = pick3(labelDom.node().getBBox(), "width", "height");
    node.elem = this;
    if (node.id) {
      thisGroup.attr("id", node.id);
    }
    if (node.labelId) {
      labelGroup.attr("id", node.labelId);
    }
    if (Object.prototype.hasOwnProperty.call(node, "width")) {
      bbox.width = node.width;
    }
    if (Object.prototype.hasOwnProperty.call(node, "height")) {
      bbox.height = node.height;
    }
    bbox.width += node.paddingLeft + node.paddingRight;
    bbox.height += node.paddingTop + node.paddingBottom;
    labelGroup.attr(
      "transform",
      "translate(" + (node.paddingLeft - node.paddingRight) / 2 + "," + (node.paddingTop - node.paddingBottom) / 2 + ")"
    );
    var root = d34.select(this);
    root.select(".label-container").remove();
    var shapeSvg = shape(root, bbox, node).classed("label-container", true);
    applyStyle(shapeSvg, node.style);
    var shapeBBox = shapeSvg.node().getBBox();
    node.width = shapeBBox.width;
    node.height = shapeBBox.height;
  });
  var exitSelection;
  if (svgNodes.exit) {
    exitSelection = svgNodes.exit();
  } else {
    exitSelection = svgNodes.selectAll(null);
  }
  applyTransition(exitSelection, g).style("opacity", 0).remove();
  return svgNodes;
};
function setCreateNodes(value) {
  createNodes = value;
}

// src/dagre-js/position-clusters.js
import * as d35 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
function positionClusters(selection, g) {
  var created = selection.filter(function() {
    return !d35.select(this).classed("update");
  });
  function translate(v) {
    var node = g.node(v);
    return "translate(" + node.x + "," + node.y + ")";
  }
  created.attr("transform", translate);
  applyTransition(selection, g).style("opacity", 1).attr("transform", translate);
  applyTransition(created.selectAll("rect"), g).attr("width", function(v) {
    return g.node(v).width;
  }).attr("height", function(v) {
    return g.node(v).height;
  }).attr("x", function(v) {
    var node = g.node(v);
    return -node.width / 2;
  }).attr("y", function(v) {
    var node = g.node(v);
    return -node.height / 2;
  });
}

// src/dagre-js/position-edge-labels.js
import * as d36 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
function positionEdgeLabels(selection, g) {
  var created = selection.filter(function() {
    return !d36.select(this).classed("update");
  });
  function translate(e) {
    var edge = g.edge(e);
    return Object.prototype.hasOwnProperty.call(edge, "x") ? "translate(" + edge.x + "," + edge.y + ")" : "";
  }
  created.attr("transform", translate);
  applyTransition(selection, g).style("opacity", 1).attr("transform", translate);
}

// src/dagre-js/position-nodes.js
import * as d37 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
function positionNodes(selection, g) {
  var created = selection.filter(function() {
    return !d37.select(this).classed("update");
  });
  function translate(v) {
    var node = g.node(v);
    return "translate(" + node.x + "," + node.y + ")";
  }
  created.attr("transform", translate);
  applyTransition(selection, g).style("opacity", 1).attr("transform", translate);
}

// src/dagre-js/intersect/intersect-circle.js
var intersect_circle_exports = {};
__export(intersect_circle_exports, {
  intersectCircle: () => intersectCircle
});

// src/dagre-js/intersect/intersect-ellipse.js
var intersect_ellipse_exports = {};
__export(intersect_ellipse_exports, {
  intersectEllipse: () => intersectEllipse
});
function intersectEllipse(node, rx, ry, point) {
  var cx = node.x;
  var cy = node.y;
  var px = cx - point.x;
  var py = cy - point.y;
  var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);
  var dx = Math.abs(rx * ry * px / det);
  if (point.x < cx) {
    dx = -dx;
  }
  var dy = Math.abs(rx * ry * py / det);
  if (point.y < cy) {
    dy = -dy;
  }
  return { x: cx + dx, y: cy + dy };
}

// src/dagre-js/intersect/intersect-circle.js
function intersectCircle(node, rx, point) {
  return intersectEllipse(node, rx, rx, point);
}

// src/dagre-js/intersect/intersect-polygon.js
var intersect_polygon_exports = {};
__export(intersect_polygon_exports, {
  intersectPolygon: () => intersectPolygon
});

// src/dagre-js/intersect/intersect-line.js
function intersectLine(p1, p2, q1, q2) {
  var a1, a2, b1, b2, c1, c2;
  var r1, r2, r3, r4;
  var denom, offset, num;
  var x, y;
  a1 = p2.y - p1.y;
  b1 = p1.x - p2.x;
  c1 = p2.x * p1.y - p1.x * p2.y;
  r3 = a1 * q1.x + b1 * q1.y + c1;
  r4 = a1 * q2.x + b1 * q2.y + c1;
  if (r3 !== 0 && r4 !== 0 && sameSign(r3, r4)) {
    return;
  }
  a2 = q2.y - q1.y;
  b2 = q1.x - q2.x;
  c2 = q2.x * q1.y - q1.x * q2.y;
  r1 = a2 * p1.x + b2 * p1.y + c2;
  r2 = a2 * p2.x + b2 * p2.y + c2;
  if (r1 !== 0 && r2 !== 0 && sameSign(r1, r2)) {
    return;
  }
  denom = a1 * b2 - a2 * b1;
  if (denom === 0) {
    return;
  }
  offset = Math.abs(denom / 2);
  num = b1 * c2 - b2 * c1;
  x = num < 0 ? (num - offset) / denom : (num + offset) / denom;
  num = a2 * c1 - a1 * c2;
  y = num < 0 ? (num - offset) / denom : (num + offset) / denom;
  return { x, y };
}
function sameSign(r1, r2) {
  return r1 * r2 > 0;
}

// src/dagre-js/intersect/intersect-polygon.js
function intersectPolygon(node, polyPoints, point) {
  var x1 = node.x;
  var y1 = node.y;
  var intersections = [];
  var minX = Number.POSITIVE_INFINITY;
  var minY = Number.POSITIVE_INFINITY;
  polyPoints.forEach(function(entry) {
    minX = Math.min(minX, entry.x);
    minY = Math.min(minY, entry.y);
  });
  var left = x1 - node.width / 2 - minX;
  var top = y1 - node.height / 2 - minY;
  for (var i = 0; i < polyPoints.length; i++) {
    var p1 = polyPoints[i];
    var p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
    var intersect = intersectLine(
      node,
      point,
      { x: left + p1.x, y: top + p1.y },
      { x: left + p2.x, y: top + p2.y }
    );
    if (intersect) {
      intersections.push(intersect);
    }
  }
  if (!intersections.length) {
    console.log("NO INTERSECTION FOUND, RETURN NODE CENTER", node);
    return node;
  }
  if (intersections.length > 1) {
    intersections.sort(function(p, q) {
      var pdx = p.x - point.x;
      var pdy = p.y - point.y;
      var distp = Math.sqrt(pdx * pdx + pdy * pdy);
      var qdx = q.x - point.x;
      var qdy = q.y - point.y;
      var distq = Math.sqrt(qdx * qdx + qdy * qdy);
      return distp < distq ? -1 : distp === distq ? 0 : 1;
    });
  }
  return intersections[0];
}

// src/dagre-js/intersect/intersect-rect.js
var intersect_rect_exports = {};
__export(intersect_rect_exports, {
  intersectRect: () => intersectRect2
});
function intersectRect2(node, point) {
  var x = node.x;
  var y = node.y;
  var dx = point.x - x;
  var dy = point.y - y;
  var w = node.width / 2;
  var h = node.height / 2;
  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : h * dx / dy;
    sy = h;
  } else {
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : w * dy / dx;
  }
  return { x: x + sx, y: y + sy };
}

// src/dagre-js/shapes.js
var shapes = {
  rect,
  ellipse,
  circle,
  diamond
};
function setShapes(value) {
  shapes = value;
}
function rect(parent, bbox, node) {
  var shapeSvg = parent.insert("rect", ":first-child").attr("rx", node.rx).attr("ry", node.ry).attr("x", -bbox.width / 2).attr("y", -bbox.height / 2).attr("width", bbox.width).attr("height", bbox.height);
  node.intersect = function(point) {
    return intersectRect2(node, point);
  };
  return shapeSvg;
}
function ellipse(parent, bbox, node) {
  var rx = bbox.width / 2;
  var ry = bbox.height / 2;
  var shapeSvg = parent.insert("ellipse", ":first-child").attr("x", -bbox.width / 2).attr("y", -bbox.height / 2).attr("rx", rx).attr("ry", ry);
  node.intersect = function(point) {
    return intersectEllipse(node, rx, ry, point);
  };
  return shapeSvg;
}
function circle(parent, bbox, node) {
  var r = Math.max(bbox.width, bbox.height) / 2;
  var shapeSvg = parent.insert("circle", ":first-child").attr("x", -bbox.width / 2).attr("y", -bbox.height / 2).attr("r", r);
  node.intersect = function(point) {
    return intersectCircle(node, r, point);
  };
  return shapeSvg;
}
function diamond(parent, bbox, node) {
  var w = bbox.width * Math.SQRT2 / 2;
  var h = bbox.height * Math.SQRT2 / 2;
  var points = [
    { x: 0, y: -h },
    { x: -w, y: 0 },
    { x: 0, y: h },
    { x: w, y: 0 }
  ];
  var shapeSvg = parent.insert("polygon", ":first-child").attr(
    "points",
    points.map(function(p) {
      return p.x + "," + p.y;
    }).join(" ")
  );
  node.intersect = function(p) {
    return intersectPolygon(node, points, p);
  };
  return shapeSvg;
}

// src/dagre-js/render.js
function render() {
  var fn = function(svg2, g) {
    preProcessGraph(g);
    var outputGroup = createOrSelectGroup(svg2, "output");
    var clustersGroup = createOrSelectGroup(outputGroup, "clusters");
    var edgePathsGroup = createOrSelectGroup(outputGroup, "edgePaths");
    var edgeLabels = createEdgeLabels(createOrSelectGroup(outputGroup, "edgeLabels"), g);
    var nodes = createNodes(createOrSelectGroup(outputGroup, "nodes"), g, shapes);
    layout(g);
    positionNodes(nodes, g);
    positionEdgeLabels(edgeLabels, g);
    createEdgePaths(edgePathsGroup, g, arrows);
    var clusters = createClusters(clustersGroup, g);
    positionClusters(clusters, g);
    postProcessGraph(g);
  };
  fn.createNodes = function(value) {
    if (!arguments.length) return createNodes;
    setCreateNodes(value);
    return fn;
  };
  fn.createClusters = function(value) {
    if (!arguments.length) return createClusters;
    setCreateClusters(value);
    return fn;
  };
  fn.createEdgeLabels = function(value) {
    if (!arguments.length) return createEdgeLabels;
    setCreateEdgeLabels(value);
    return fn;
  };
  fn.createEdgePaths = function(value) {
    if (!arguments.length) return createEdgePaths;
    setCreateEdgePaths(value);
    return fn;
  };
  fn.shapes = function(value) {
    if (!arguments.length) return shapes;
    setShapes(value);
    return fn;
  };
  fn.arrows = function(value) {
    if (!arguments.length) return arrows;
    setArrows(value);
    return fn;
  };
  return fn;
}
var NODE_DEFAULT_ATTRS = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 10,
  rx: 0,
  ry: 0,
  shape: "rect"
};
var EDGE_DEFAULT_ATTRS = {
  arrowhead: "normal",
  curve: d38.curveLinear
};
function preProcessGraph(g) {
  g.nodes().forEach((v) => {
    const node = g.node(v);
    if (!Object.prototype.hasOwnProperty.call(node, "label") && !g.children(v).length) {
      node.label = v;
    }
    if (Object.prototype.hasOwnProperty.call(node, "paddingX")) {
      defaults2(node, {
        paddingLeft: node.paddingX,
        paddingRight: node.paddingX
      });
    }
    if (Object.prototype.hasOwnProperty.call(node, "paddingY")) {
      defaults2(node, {
        paddingTop: node.paddingY,
        paddingBottom: node.paddingY
      });
    }
    if (Object.prototype.hasOwnProperty.call(node, "padding")) {
      defaults2(node, {
        paddingLeft: node.padding,
        paddingRight: node.padding,
        paddingTop: node.padding,
        paddingBottom: node.padding
      });
    }
    defaults2(node, NODE_DEFAULT_ATTRS);
    ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"].forEach((k) => {
      node[k] = Number(node[k]);
    });
    if (Object.prototype.hasOwnProperty.call(node, "width")) {
      node._prevWidth = node.width;
    }
    if (Object.prototype.hasOwnProperty.call(node, "height")) {
      node._prevHeight = node.height;
    }
  });
  g.edges().forEach(function(e) {
    var edge = g.edge(e);
    if (!Object.prototype.hasOwnProperty.call(edge, "label")) {
      edge.label = "";
    }
    defaults2(edge, EDGE_DEFAULT_ATTRS);
  });
}
function postProcessGraph(g) {
  g.nodes().forEach((v) => {
    var node = g.node(v);
    if (Object.prototype.hasOwnProperty.call(node, "_prevWidth")) {
      node.width = node._prevWidth;
    } else {
      delete node.width;
    }
    if (Object.prototype.hasOwnProperty.call(node, "_prevHeight")) {
      node.height = node._prevHeight;
    } else {
      delete node.height;
    }
    delete node._prevWidth;
    delete node._prevHeight;
  });
}
function createOrSelectGroup(root, name) {
  var selection = root.select("g." + name);
  if (selection.empty()) {
    selection = root.append("g").attr("class", name);
  }
  return selection;
}

// src/dagre-js/intersect/index.js
var intersect_exports = {};
__export(intersect_exports, {
  circle: () => intersect_circle_exports,
  ellipse: () => intersect_ellipse_exports,
  node: () => intersect_node_exports,
  polygon: () => intersect_polygon_exports,
  rect: () => intersect_rect_exports
});
export {
  graphlib_exports as graphlib,
  intersect_exports as intersect,
  render
};
