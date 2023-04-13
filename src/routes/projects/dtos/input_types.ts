export type AliasItem = {
    number: number;
    as: string;
}

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
    name?: string;
    type?: string;
    backgroundColor?: string;
    schema?: SchemaItem[][];
    colormap: ColormapItem[];
    alias?: AliasItem[];
};

export type ProjectMetadataInput = {
    name: string;
    type: string;
    backgroundColor?: string;
};

export type PDFOptionsInput = {
    numbers: boolean;
    rulers: boolean;
    instruction: boolean;
    alias: AliasItem[];
};
