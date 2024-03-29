interface IDiagram {
    on(evtType: DiagramEventType, listener: EventListenerOrEventListenerObject): this;
    shapeAdd(param: PresenterShapeAppendParam): IDiagramShape;
    shapeDel(shape: IDiagramShape): void;
    shapeConnect(param: DiagramShapeConnectParam): void;
    shapeSetMoving(shape: IDiagramShape, offsetPoint: Point): void;
}
interface IDiagramElement {
    type: PresenterElementType;
}
/** type = 'shape'  */
interface IDiagramShape extends IDiagramElement {
    postionGet(): Point;
    update(param: PresenterShapeUpdateParam): void;
}
/** type = 'connector' */
interface IDiagramConnector extends IDiagramElement {
    /** unique id into shape */
    key: string;
    shape: IDiagramShape;
}
type DiagramEventType = 'select' | 'connect' | 'disconnect';
interface IDiagramEventSelectDetail<T extends IDiagramShape & IDiagramConnector> {
    target: T;
}
interface IDiagramEventConnectDetail {
    start: IDiagramConnector;
    end: IDiagramConnector;
}
interface DiagramConnectorEnd {
    shape: IDiagramShape;
    /** connector id */
    connector: string;
}
interface DiagramShapeConnectParam {
    start: DiagramConnectorEnd;
    end: DiagramConnectorEnd;
}
