export type SchemaItem = {
    x: number;
    y: number;
    filled: boolean;
    color?: string;
    number?: number;
};

export type ColormapItem = {
    color: string;
    number: number;
};

export type ProjectSchemaInput = {
    type: string;
    backgroundColor?: string;
    schema: SchemaItem[][];
    colormap: ColormapItem[];
};

export type ProjectMetadataInput = {
    name: string;
    type: string;
    backgroundColor?: string;
};

export type PDFOptionsInput = {
    numbers: boolean;
    rulers: boolean;
    alias: { number: number, as: string; }[];
};
