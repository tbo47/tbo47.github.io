import { Text, TextConfig } from 'konva-es/lib/shapes/Text';
import { Transformer } from 'konva-es/lib/shapes/Transformer';
export interface EditableTextConfig extends TextConfig {
    transformer: Transformer;
}
export declare const newTransformerForText: () => any;
export declare class EditableText extends Text {
    #private;
    transformer: Transformer;
    constructor(config: EditableTextConfig);
    ajustHeight(): Promise<void>;
}
