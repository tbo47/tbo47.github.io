// src/Utils.ts
import { Transformer } from "konva-es/lib/shapes/Transformer";
var isTouchDevice = "ontouchstart" in window;
function getAnchorSize(scale = 1) {
  return (isTouchDevice ? 20 : 10) / scale;
}
function debounce(fn, delay) {
  let timeout = null;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
var transformerDefaultConfig = {
  rotationSnaps: [0],
  anchorSize: getAnchorSize(),
  rotationSnapTolerance: 3
};
var newTransformerForText = () => {
  return new Transformer({
    ...transformerDefaultConfig,
    enabledAnchors: ["middle-left", "middle-right"],
    boundBoxFunc: (oldBox, newBox) => {
      newBox.width = Math.max(30, newBox.width);
      return newBox;
    }
  });
};
var newTransformerNoRotation = () => {
  return new Transformer({
    ...transformerDefaultConfig,
    rotateEnabled: false
  });
};
var newComponentTransformer = () => {
  return new Transformer({ ...transformerDefaultConfig });
};
var GLOBAL_KONVA_COMPONENTS_CONF = {
  /**
   * Transformer for editable text shapes.
   */
  editableTextTransformer: newTransformerForText(),
  /**
   * All purpose transformer. For shapes that are not text.
   */
  transformer: newComponentTransformer(),
  transformerNoRotation: newTransformerNoRotation(),
  currentlySelected: []
};
var resetGlobalKonvaComponentsConf = () => {
  GLOBAL_KONVA_COMPONENTS_CONF.editableTextTransformer = newTransformerForText();
  GLOBAL_KONVA_COMPONENTS_CONF.transformer = newComponentTransformer();
  GLOBAL_KONVA_COMPONENTS_CONF.transformerNoRotation = newTransformerNoRotation();
  GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected = [];
};
var unselectAllShapes = () => {
  getTransformers().forEach((tr) => tr.nodes([]));
  GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected.forEach((shape) => {
    shape.draggable(false);
    const arrow = shape;
    arrow.anchors?.forEach((anchor) => anchor.destroy());
  });
  GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected = [];
};
var getTransformers = () => {
  return [
    GLOBAL_KONVA_COMPONENTS_CONF.editableTextTransformer,
    GLOBAL_KONVA_COMPONENTS_CONF.transformer,
    GLOBAL_KONVA_COMPONENTS_CONF.transformerNoRotation
  ];
};
function findMinXY(pts) {
  let minX = pts[0];
  let minY = pts[1];
  for (let i = 2; i < pts.length; i += 2) {
    if (pts[i] < minX) minX = pts[i];
    if (pts[i + 1] < minY) minY = pts[i + 1];
  }
  return { minX, minY };
}

// src/ScrollableStage.ts
import { Stage } from "konva-es/lib/Stage";
function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
function getCenter(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}
var ScrollableStage = class extends Stage {
  #lastCenter = null;
  #lastDist = 0;
  #dragStopped = false;
  constructor(config) {
    config.width = config.width || window.innerWidth;
    config.height = config.height || window.innerHeight;
    config.draggable = true;
    super(config);
    const scaleBy = config.scaleBy ?? 1.02;
    this.on("wheel", (e) => {
      e.evt.preventDefault();
      if (e.evt.ctrlKey) {
        this.#handleZoom(e.evt, scaleBy);
      } else {
        this.#handlePan(e.evt);
      }
    });
    if (isTouchDevice) this.#preventDefaultTouchActions();
    this.on("touchmove", (e) => {
      e.evt.preventDefault();
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      if (touch1 && !touch2 && !this.isDragging() && this.#dragStopped) {
        this.startDrag();
        this.#dragStopped = false;
      }
      if (touch1 && touch2) {
        unselectAllShapes();
        if (this.isDragging()) {
          this.#dragStopped = true;
          this.stopDrag();
        }
        const p1 = {
          x: touch1.clientX,
          y: touch1.clientY
        };
        const p2 = {
          x: touch2.clientX,
          y: touch2.clientY
        };
        if (!this.#lastCenter) {
          this.#lastCenter = getCenter(p1, p2);
          return;
        }
        const newCenter = getCenter(p1, p2);
        const dist = getDistance(p1, p2);
        if (!this.#lastDist) this.#lastDist = dist;
        const pointTo = {
          x: (newCenter.x - this.x()) / this.scaleX(),
          y: (newCenter.y - this.y()) / this.scaleX()
        };
        const scale = this.scaleX() * (dist / this.#lastDist);
        this.scaleX(scale);
        this.scaleY(scale);
        const dx = newCenter.x - this.#lastCenter.x;
        const dy = newCenter.y - this.#lastCenter.y;
        const newPos = {
          x: newCenter.x - pointTo.x * scale + dx,
          y: newCenter.y - pointTo.y * scale + dy
        };
        this.position(newPos);
        this.#lastDist = dist;
        this.#lastCenter = newCenter;
      }
    });
    this.on("touchend", () => {
      this.#lastDist = 0;
      this.#lastCenter = null;
    });
    this.on("click tap", (e) => {
      if (e.target === this) unselectAllShapes();
    });
  }
  /**
   * Prevent default touch actions to avoid zooming and scrolling
   * Useful for mobile devices
   */
  #preventDefaultTouchActions() {
    document.addEventListener("gesturestart", (e) => e.preventDefault());
    document.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  }
  #handleZoom(evt, scaleBy) {
    unselectAllShapes();
    const isTrackpad = this.#detectTrackpad(evt);
    const oldScale = this.scaleX();
    const pointer = this.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - this.x()) / oldScale,
      y: (pointer.y - this.y()) / oldScale
    };
    scaleBy = isTrackpad ? scaleBy : scaleBy * 1.2;
    const newScale = evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    this.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    };
    this.position(newPos);
  }
  #handlePan(event) {
    const { deltaX, deltaY } = event;
    const oldPos = this.position();
    this.position({ x: oldPos.x - deltaX, y: oldPos.y - deltaY });
    event.preventDefault();
    event.stopPropagation();
  }
  // https://stackoverflow.com/questions/10744645/detect-touchpad-vs-mouse-in-javascript
  #detectTrackpad(event) {
    const { deltaY } = event;
    if (deltaY && !Number.isInteger(deltaY)) {
      return false;
    }
    return true;
  }
};

// src/Cloud.ts
import { Path } from "konva-es/lib/shapes/Path";
var CLOUDS = [
  {
    topPath: `a 3 3 0 0 1 4 -2 a 4.6 4.6 0 0 1 8 2`,
    topOffset: `m 0 0`,
    topWidth: 12,
    rightPath: `a 3 3 0 0 1 2 4 a 4.6 4.6 0 0 1 -2 8`,
    rightOffset: `m 0 0`,
    bottomPath: `a 3 3 0 0 1 -4 2 a 4.6 4.6 0 0 1 -8 -2`,
    bottomOffset: `m 0 0`,
    leftPath: `a 3 3 0 0 1 -2 -4 a  4.6 4.6 0 0 1 2 -8`,
    leftOffset: `m 0 0`,
    leftHeight: 12
  },
  {
    topPath: `a 8 8 0 0 1 14 5`,
    topOffset: `m -2 -5`,
    topWidth: 12,
    rightPath: `a 8 8 0 0 1 -5 14`,
    rightOffset: `m 5 -2`,
    bottomPath: `a 8 8 0 0 1 -14 -5`,
    bottomOffset: `m 2 5`,
    leftPath: `a 8 8 0 0 1 5 -14`,
    leftOffset: `m -5 2`,
    leftHeight: 12
  }
];
var Cloud = class extends Path {
  #pattern = 0;
  #transformer;
  constructor(config) {
    config.name = config.name || "clouding";
    config.stroke = config.stroke || "#0058ff";
    config.width = config.width || 200;
    config.height = config.height || 100;
    super(config);
    this.#transformer = GLOBAL_KONVA_COMPONENTS_CONF.transformer;
    this.#pattern = config.pattern || 0;
    this.adjustPath(config.width, config.height);
    this.on("transformend", (e) => {
      let { width, height } = this.getClientRect();
      const scale = (config.transformFollowLayer ? this.getLayer() : this.getStage()).scale();
      width = width / scale.x;
      height = height / scale.y;
      const a = Math.abs(e.target.rotation());
      const sinA = Math.sin(a * Math.PI / 180);
      const cosA = Math.cos(a * Math.PI / 180);
      const h = (width * sinA - height * cosA) / (sinA ** 2 - cosA ** 2);
      const w = (width * cosA - height * sinA) / (cosA ** 2 - sinA ** 2);
      this.adjustPath(w, h);
      this.scaleX(1);
      this.scaleY(1);
    });
    this.hitFunc((context) => {
      context.beginPath();
      context.rect(4, 3, this.width() - 15, this.height() - 15);
      context.closePath();
      context.fillStrokeShape(this);
    });
    if (!isTouchDevice) {
      this.on("mouseover", (e) => e.target.getStage().container().style.cursor = "move");
      this.on("mouseout", (e) => e.target.getStage().container().style.cursor = "default");
    }
    this.on("click tap", () => {
      const layer = this.#transformer.getLayer();
      if (!layer) {
        this.getLayer().add(this.#transformer);
      }
      unselectAllShapes();
      this.#transformer.nodes([this]);
      this.draggable(true);
      GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected.push(this);
      this.moveToTop();
    });
  }
  adjustPath(width, height) {
    const p = CLOUDS[this.#pattern];
    const topPathCounter = Math.floor(Math.abs(width) / p.topWidth);
    const leftPathCounter = Math.floor(Math.abs(height) / p.leftHeight);
    const path = `${p.topPath} ${p.topOffset} `.repeat(topPathCounter) + `${p.rightPath} ${p.rightOffset} `.repeat(leftPathCounter) + `${p.bottomPath} ${p.bottomOffset} `.repeat(topPathCounter) + `${p.leftPath} ${p.leftOffset} `.repeat(leftPathCounter);
    this.setAttr("data", path);
    this.width(width);
    this.height(height);
  }
};

// src/EditableArrow.ts
import { Arrow } from "konva-es/lib/shapes/Arrow";
import { Rect } from "konva-es/lib/shapes/Rect";
var EditableArrow = class extends Arrow {
  anchors = [];
  transformFollowLayer = false;
  constructor(config) {
    config.stroke = config.stroke || "#0058ff";
    if (config.fill === void 0) config.fill = config.stroke;
    super(config);
    this.transformFollowLayer = config.transformFollowLayer || false;
    if (this.strokeWidth() < 20) {
      this.hitStrokeWidth(20);
    }
    if (this.strokeWidth() < 20 && isTouchDevice) {
      this.hitStrokeWidth(50);
    }
    if (!isTouchDevice) {
      this.on("mouseover", (e) => e.target.getStage().container().style.cursor = "move");
      this.on("mouseout", (e) => e.target.getStage().container().style.cursor = "default");
    }
    this.on("click tap", () => {
      unselectAllShapes();
      GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected.push(this);
      this.moveToTop();
      this.draggable(true);
      this.anchors = this.#addAnchors();
    });
    let optiIndex = 0;
    const dragMoveAction = (optimize = true) => {
      if (optimize && optiIndex++ % 6 !== 0) return;
      const scale = (this.transformFollowLayer ? this.getLayer() : this.getStage()).scale();
      const points = this.points();
      this.anchors[0].x(points[0] + this.x() - getAnchorSize(scale.x) / 2);
      this.anchors[0].y(points[1] + this.y() - getAnchorSize(scale.y) / 2);
      this.anchors[1].x(points[points.length - 2] + this.x() - getAnchorSize(scale.x) / 2);
      this.anchors[1].y(points[points.length - 1] + this.y() - getAnchorSize(scale.y) / 2);
    };
    this.on("dragmove", () => dragMoveAction());
    this.on("dragend", () => dragMoveAction(false));
  }
  #addAnchors() {
    const pts = this.points();
    const x = this.x();
    const y = this.y();
    const scale = (this.transformFollowLayer ? this.getLayer() : this.getStage()).scale();
    const anchorOffset = getAnchorSize(scale.x) / 2;
    const anchorStart = this.#createAnchor(
      this.name() + " start",
      pts.at(0) + x - anchorOffset,
      pts.at(1) + y - anchorOffset
    );
    this.getLayer().add(anchorStart);
    anchorStart.moveToTop();
    anchorStart.on("dragstart", () => {
      this.draggable(false);
    });
    const anchorDragAction = () => {
      const pts2 = this.points();
      pts2[0] = anchorStart.x() - this.x() + anchorOffset;
      pts2[1] = anchorStart.y() - this.y() + anchorOffset;
      this.points(pts2);
    };
    const debouncedAnchorDragAction = debounce(anchorDragAction, 16);
    anchorStart.on("dragmove", () => debouncedAnchorDragAction());
    anchorStart.on("dragend", () => {
      anchorDragAction();
      this.draggable(true);
      this.fire("transformend");
    });
    const anchorEnd = this.#createAnchor(
      this.name() + " start",
      pts.at(-2) + x - anchorOffset,
      pts.at(-1) + y - anchorOffset
    );
    this.getLayer().add(anchorEnd);
    anchorEnd.moveToTop();
    anchorEnd.on("dragstart", () => {
      this.draggable(false);
    });
    const anchorDragActionEnd = () => {
      const pts2 = this.points();
      pts2[pts2.length - 2] = anchorEnd.x() - this.x() + anchorOffset;
      pts2[pts2.length - 1] = anchorEnd.y() - this.y() + anchorOffset;
      this.points(pts2);
    };
    const debouncedAnchorDragActionEnd = debounce(anchorDragActionEnd, 16);
    anchorEnd.on("dragmove", () => debouncedAnchorDragActionEnd());
    anchorEnd.on("dragend", () => {
      anchorDragActionEnd();
      this.draggable(true);
      this.fire("transformend");
    });
    return [anchorStart, anchorEnd];
  }
  #createAnchor(name = "", x = 0, y = 0) {
    const scale = (this.transformFollowLayer ? this.getLayer() : this.getStage()).scale();
    const anchor = new Rect({
      stroke: "rgb(0, 161, 255)",
      fill: "white",
      strokeWidth: 1,
      name: name + " _anchor",
      dragDistance: 0,
      draggable: true,
      width: getAnchorSize(scale.x),
      height: getAnchorSize(scale.y),
      x,
      y
    });
    if (!isTouchDevice) {
      anchor.on("mouseenter", () => anchor.getStage().container().style.cursor = "pointer");
      anchor.on("mouseout", () => anchor.getStage().container().style.cursor = "default");
    }
    return anchor;
  }
};

// src/EditableLine.ts
import { Line } from "konva-es/lib/shapes/Line";
var EditableLine = class extends Line {
  #transformer;
  constructor(config) {
    config.stroke = config.stroke || "#0058ff";
    super(config);
    this.#transformer = GLOBAL_KONVA_COMPONENTS_CONF.transformerNoRotation;
    this.on("transformend", (e) => {
      let { width, height } = this.getClientRect();
      const scale = (config.transformFollowLayer ? this.getLayer() : this.getStage()).scale();
      width = width / scale.x;
      height = height / scale.y;
      this.adjustPath(width, height);
      this.scaleX(1);
      this.scaleY(1);
    });
    if (this.strokeWidth() < 20) {
      this.hitStrokeWidth(20);
    }
    if (this.strokeWidth() < 20 && isTouchDevice) {
      this.hitStrokeWidth(50);
    }
    if (!("ontouchstart" in window)) {
      this.on("mouseover", (e) => e.target.getStage().container().style.cursor = "move");
      this.on("mouseout", (e) => e.target.getStage().container().style.cursor = "default");
    }
    this.on("click tap", () => {
      const layer = this.#transformer.getLayer();
      if (!layer) {
        this.getLayer().add(this.#transformer);
      }
      unselectAllShapes();
      this.#transformer.nodes([this]);
      this.draggable(true);
      GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected.push(this);
      this.moveToTop();
    });
  }
  adjustPath(width, height) {
    const pts = this.points();
    let offsetX = 0;
    let offsetY = 0;
    if (this.x() === 0 && this.y() === 0 && pts.length > 3) {
      const { minX, minY } = findMinXY(pts);
      offsetX = minX;
      offsetY = minY;
    }
    const points = pts.map((p, i) => {
      p -= i % 2 === 0 ? offsetX : offsetY;
      if (i % 2 === 0) {
        p = p / this.width() * width;
      } else {
        p = p / this.height() * height;
      }
      p += i % 2 === 0 ? offsetX : offsetY;
      return p;
    });
    this.points(points);
  }
};

// src/EditableText.ts
import { Konva } from "konva-es/lib/Global";
import { Text } from "konva-es/lib/shapes/Text";
var EditableText = class extends Text {
  transformer;
  constructor(config) {
    Konva._fixTextRendering = true;
    config.fontSize = config.fontSize || 20;
    config.width = config.width || 200;
    super(config);
    this.transformer = GLOBAL_KONVA_COMPONENTS_CONF.editableTextTransformer;
    this.on("transform", () => this.setAttrs({ width: this.width() * this.scaleX(), scaleX: 1 }));
    this.on("transformend", async () => {
      await this.ajustHeight();
      this.fire("textChange");
    });
    this.on("dblclick dbltap", (e) => {
      e.cancelBubble = true;
      this.#textNodeOnDblClick();
    });
    if (!("ontouchstart" in window)) {
      this.on("mouseover", (e) => e.target.getStage().container().style.cursor = "move");
      this.on("mouseout", (e) => e.target.getStage().container().style.cursor = "default");
    }
    this.on("click tap", () => {
      const layer = this.transformer.getLayer();
      if (!layer) {
        this.getLayer().add(this.transformer);
      }
      unselectAllShapes();
      this.transformer.nodes([this]);
      this.draggable(true);
      GLOBAL_KONVA_COMPONENTS_CONF.currentlySelected.push(this);
      this.moveToTop();
    });
  }
  async ajustHeight() {
    await this.#textNodeOnDblClick();
    this.#removeTextarea();
  }
  #textarea = null;
  #handleOutsideClick = (e) => {
    if (e.target !== this.#textarea) {
      this.text(this.#textarea.value);
      this.#removeTextarea();
    }
  };
  #removeTextarea = () => {
    this.#adjustShapeHeight();
    this.#textarea.parentNode.removeChild(this.#textarea);
    this.#textarea = null;
    window.removeEventListener("click", this.#handleOutsideClick);
    window.removeEventListener("touchstart", this.#handleOutsideClick);
    this.show();
    this.transformer.show();
    this.transformer.forceUpdate();
  };
  #textNodeOnDblClick() {
    return new Promise(async (resolve) => {
      let stage = this.getStage();
      if (!stage) {
        await new Promise((resolve2) => setTimeout(resolve2));
        stage = this.getStage();
      }
      if (!stage) {
        console.error("EditableText: No stage found");
        resolve();
        return;
      }
      this.hide();
      this.transformer.hide();
      const textPosition = this.absolutePosition();
      const stageBox = stage.container().getBoundingClientRect();
      const areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y
      };
      const textarea = document.createElement("textarea");
      this.#textarea = textarea;
      document.body.appendChild(textarea);
      textarea.value = this.text();
      textarea.style.position = "absolute";
      textarea.style.top = areaPosition.y + "px";
      textarea.style.left = areaPosition.x + "px";
      const scale = this.getAbsoluteScale().x;
      textarea.style.width = this.width() * scale - this.padding() * 2 + "px";
      textarea.style.fontSize = this.fontSize() * scale + "px";
      textarea.style.border = "none";
      textarea.style.padding = "0px";
      textarea.style.margin = "0px";
      textarea.style.overflow = "hidden";
      textarea.style.background = "none";
      textarea.style.outline = "none";
      textarea.style.resize = "none";
      textarea.style.lineHeight = this.lineHeight().toString();
      textarea.style.fontFamily = this.fontFamily();
      textarea.style.transformOrigin = "left top";
      textarea.style.textAlign = this.align();
      textarea.style.color = this.fill().toString();
      const rotation = this.rotation();
      let transform = "";
      if (rotation) {
        transform += "rotateZ(" + rotation + "deg)";
      }
      transform += "translateY(-2px)";
      textarea.style.transform = transform;
      textarea.style.height = textarea.scrollHeight + 3 + "px";
      textarea.focus();
      textarea.addEventListener("keydown", (e) => {
        const scale2 = this.getAbsoluteScale().x;
        textarea.style.width = this.width() * scale2 + "px";
        textarea.style.height = textarea.scrollHeight + "px";
        this.#adjustShapeHeight();
        if (e.key === "Enter" && !e.shiftKey) {
          this.text(textarea.value);
          this.#removeTextarea();
        }
        if (e.key === "Escape") {
          this.#removeTextarea();
        }
      });
      setTimeout(() => {
        window.addEventListener("click", this.#handleOutsideClick);
        window.addEventListener("touchstart", this.#handleOutsideClick);
        resolve();
      });
    });
  }
  #adjustShapeHeight = () => {
    const scale = this.getAbsoluteScale().x;
    this.height(Math.round(this.#textarea.scrollHeight / scale));
  };
};
export {
  CLOUDS,
  Cloud,
  EditableArrow,
  EditableLine,
  EditableText,
  GLOBAL_KONVA_COMPONENTS_CONF,
  ScrollableStage,
  debounce,
  findMinXY,
  getAnchorSize,
  getTransformers,
  isTouchDevice,
  newComponentTransformer,
  newTransformerForText,
  newTransformerNoRotation,
  resetGlobalKonvaComponentsConf,
  transformerDefaultConfig,
  unselectAllShapes
};
