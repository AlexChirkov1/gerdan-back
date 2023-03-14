import { createCanvas } from 'canvas';
import { ProjectTypeEnum } from 'src/database/models/project.model';
import { SchemaItem } from './dtos/input_types';
import { ProjectTypeSettings } from './resources/project_type_settings';

export function createPreview(schema: SchemaItem[][], type: ProjectTypeEnum, backgroundColor: string): Buffer {
    const SCALE = 5;
    const width = Math.max(schema[0].length, schema[1].length);
    const height = schema.length;
    const bead = {
        width: ProjectTypeSettings[type].width / SCALE,
        height: ProjectTypeSettings[type].height / SCALE,
    };

    const canvas = createCanvas(width * bead.width, height * bead.height);
    const ctx = canvas.getContext('2d');

    for (let y = 0; y < schema.length; y++) {
        for (let x = 0; x < schema[y].length; x++) {
            const xPosition = x * bead.width;
            const yPosition = y * bead.height;
            const color = schema[y][x].filled ? schema[y][x].color : backgroundColor;
            ctx.fillStyle = color;
            ctx.fillRect(xPosition, yPosition, bead.width, bead.height);
        }
    }

    return canvas.toBuffer('image/jpeg', { quality: 1, progressive: true, chromaSubsampling: false });
}
