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

export type BoardSchemaInput = {
    type: string;
    backgroundColor?: string;
    schema: SchemaItem[][];
    colormap: ColormapItem[];
};

export type BoardMetadataInput = {
    name: string;
    type: string;
    backgroundColor?: string;
};
