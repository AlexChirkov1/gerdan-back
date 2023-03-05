import { BoardTypeEnum } from 'src/database/models/board.model';

export const BoardTypeSettings = {
    loom: {
        name: BoardTypeEnum.loom,
        boxWidth: 20,
        boxHeight: 30
    },
    grid: {
        name: BoardTypeEnum.grid,
        boxWidth: 25,
        boxHeight: 25
    },
    brick: {
        name: BoardTypeEnum.brick,
        boxWidth: 30,
        boxHeight: 20
    },
    peyote: {
        name: BoardTypeEnum.peyote,
        boxWidth: 20,
        boxHeight: 30
    }
} as const;
