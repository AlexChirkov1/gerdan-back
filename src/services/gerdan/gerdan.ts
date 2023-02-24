import { existsSync, unlinkSync } from 'fs';
import { Gerdan } from 'src/database/models/gerdan.model';
import { User } from 'src/database/models/user.model';
import { WHITE } from './colors';
import { PDFBuilder } from './pdf_builder';
import { PreviewBuilder } from './preview_builder';

type ColorStatics = { color: string, count: number; }[];

export type Statistics = {
    rows: number,
    columns: number,
    colors: ColorStatics;
};

type PDFPixel = {
    color: string;
    index: number;
    indexColor: string;
};

export type GerdanOptions = {
    numbers: boolean;
};

export type PixelsGrid = PDFPixel[][];

export function generateGerdanPDF(gerdan: Gerdan, user: User, path: string, options: GerdanOptions): void {
    const pixelSize = calculatePixelsSize(gerdan);
    const pixelsGrid = mapActionsToPixels(gerdan);
    const statistics = collectStatistic(pixelsGrid, gerdan.width, gerdan.height);

    const doc = new PDFBuilder(path, {
        Title: gerdan.name,
        Author: user.username,
        pixelSize,
        height: gerdan.height,
        width: gerdan.width,
        backgroundColor: gerdan.backgroundColor,
    }, options);
    try {
        doc.addInfoPage(user.username, gerdan.name);
        doc.drawStatistics(statistics);
        doc.drawPixelsGrid(pixelsGrid);
        doc.closeDocument();
    } catch (error) {
        doc.closeDocument();
        if (existsSync(path)) unlinkSync(path);
        throw error;
    }
}

export function createGerdanPreview(gerdan: Gerdan): Buffer {
    const pixelsGrid = mapActionsToPixels(gerdan);

    const canvas = new PreviewBuilder(gerdan.width, gerdan.height, 5);
    canvas.drawPixelsGrid(pixelsGrid);
    return canvas.getPreviewBuffer();
}

function mapActionsToPixels(gerdan: Gerdan): PixelsGrid {
    const grid = createBlankGrid(gerdan);

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const pixel = gerdan.pixels.find((value) => {
                let xEntry = false, yEntry = false;
                const xCoord = x * gerdan.pixelSize;
                const yCoord = y * gerdan.pixelSize;
                if (value.x > xCoord - gerdan.pixelSize && value.x <= xCoord) xEntry = true;
                if (value.y > yCoord - gerdan.pixelSize && value.y <= yCoord) yEntry = true;
                return xEntry && yEntry;
            });

            if (!pixel) continue;

            grid[y][x] = {
                color: pixel.color,
                index: pixel.index,
                indexColor: pixel.indexColor,
            };
        }
    }

    return grid;
}

function createBlankGrid(gerdan: Gerdan): PixelsGrid {
    const grid = [];
    for (let y = 0; y < gerdan.height; y++) {
        if (!grid[y]) grid[y] = [];
        for (let x = 0; x < gerdan.width; x++) {
            grid[y][x] = {
                color: gerdan.backgroundColor,
                index: 0,
                indexColor: WHITE,
            };
        }
    }
    return grid;
}

function collectStatistic(pixelsGrid: PixelsGrid, width: number, height: number): Statistics {
    const statistics = {
        rows: height,
        columns: width,
        colors: []
    };

    for (let y = 0; y < height; y++) {
        let pixelsInARow = 0;
        for (let x = 0; x < width; x++) {
            if (!pixelsGrid[y][x].index) continue;
            if (!statistics.colors[pixelsGrid[y][x].index])
                statistics.colors[pixelsGrid[y][x].index] = { color: pixelsGrid[y][x].color, count: 0 };
            statistics.colors[pixelsGrid[y][x].index].count++;
            pixelsInARow++;
        }
        if (statistics.columns < pixelsInARow) statistics.columns = pixelsInARow;
    }

    return statistics;
}

function calculatePixelsSize(gerdan: Gerdan): number {
    return ~~(PDFBuilder.printSize.width / gerdan.width);
}
