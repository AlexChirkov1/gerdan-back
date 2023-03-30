import { createCanvas } from 'canvas';
import { Project, ProjectTypeEnum, Schema } from 'src/database/models/project.model';
import { half } from 'src/utils/half';
import { BeadSettings } from './resources/bead';

export function createPreview(project: Project): Buffer {
    if (!project.schema) return createBlankPreview(project.backgroundColor);
    const parsedSchema = JSON.parse(project.schema) as Schema;
    const SCALE = 5;
    const width = Math.max(parsedSchema[0].length, parsedSchema[1].length);
    const height = parsedSchema.length;
    const bead = {
        width: BeadSettings[project.type].width / SCALE,
        height: BeadSettings[project.type].height / SCALE,
    };
    const halfBeadWidth = half(bead.width);
    const halfBeadHeight = half(bead.height);

    const totalWidth = width * bead.width; // TODO: for some reason, bricks don't need adjustments
    const totalHeight = project.type === ProjectTypeEnum.peyote ? height * bead.height + halfBeadHeight : height * bead.height;
    const canvas = createCanvas(totalWidth, totalHeight);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = project.backgroundColor;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    let xShift = 0, yShift = 0;
    for (let row = 0; row < parsedSchema.length; row++) {
        if (project.type === ProjectTypeEnum.brick) xShift = row % 2 ? halfBeadWidth : 0;
        for (let col = 0; col < parsedSchema[row].length; col++) {
            if (project.type === ProjectTypeEnum.peyote) yShift = col % 2 ? halfBeadHeight : yShift = 0;
            const x = col * bead.width + xShift;
            const y = row * bead.height + yShift;
            const color = parsedSchema[row][col].filled ? parsedSchema[row][col].color : project.backgroundColor;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, bead.width, bead.height);
        }
    }

    return canvas.toBuffer('image/jpeg', { quality: 1, progressive: true, chromaSubsampling: false });
}

function createBlankPreview(backgroundColor: string): Buffer {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, 100, 100);
    return canvas.toBuffer('image/jpeg', { quality: 1, progressive: true, chromaSubsampling: false });
}
