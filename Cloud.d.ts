/**
 * https://github.com/tbo47/konva-components
 */
import { Path, PathConfig } from 'konva-es/lib/shapes/Path';
/**
 * https://yqnn.github.io/svg-path-editor/#P=m0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_2_4_a_4.6_4.6_0_0_1_-2_8_m_0_0_a_3_3_0_0_1_2_4_a_4.6_4.6_0_0_1_-2_8_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-2_-4_a_4.6_4.6_0_0_1_2_-8_m_0_0_a_3_3_0_0_1_-2_-4_a_4.6_4.6_0_0_1_2_-8_m_0_0
 */
export interface ICloudPattern {
    topPath: string;
    topOffset: string;
    topWidth: number;
    rightPath: string;
    rightOffset: string;
    bottomPath: string;
    bottomOffset: string;
    leftPath: string;
    leftOffset: string;
    leftHeight: number;
}
export interface CloudConfig extends PathConfig {
    pattern?: 0 | 1;
}
/**
 * https://yqnn.github.io/svg-path-editor/#P=m0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_4_-2_a_4.6_4.6_0_0_1_8_2_m_0_0_a_3_3_0_0_1_2_4_a_4.6_4.6_0_0_1_-2_8_m_0_0_a_3_3_0_0_1_2_4_a_4.6_4.6_0_0_1_-2_8_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-4_2_a_4.6_4.6_0_0_1_-8_-2_m_0_0_a_3_3_0_0_1_-2_-4_a_4.6_4.6_0_0_1_2_-8_m_0_0_a_3_3_0_0_1_-2_-4_a_4.6_4.6_0_0_1_2_-8_m_0_0
 */
export declare const CLOUDS: ICloudPattern[];
/**
 * Cloud shape
 *
 * Example:
 * ```javascript
 * const cloud = new Cloud({
 *     x: 10,
 *     y: 10,
 *     width: 200,
 *     height: 100,
 *     draggable: true,
 *     stroke: '#0058ff',
 *     name: 'clouding',
 * })
 * ```
 *
 * If you want to expand the cloud by dragging the mouse, you can use the following code:
 * ```javascript
 * const width = cursorPos.x - cloud.x()
 * const height = cursorPos.y - cloud.y()
 * cloud.adjustPath(width, height)
 * ```
 */
export declare class Cloud extends Path {
    #private;
    constructor(config: CloudConfig);
    adjustPath(width: number, height: number): void;
}
