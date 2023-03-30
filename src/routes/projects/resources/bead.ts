import { ProjectTypeEnum } from 'src/database/models/project.model';

export type Bead = {
    width: number;
    height: number;
};

export const BeadSettings = {
    [ProjectTypeEnum.loom]: {
        width: 20,
        height: 30
    },
    [ProjectTypeEnum.grid]: {
        width: 25,
        height: 25
    },
    [ProjectTypeEnum.brick]: {
        width: 30,
        height: 20
    },
    [ProjectTypeEnum.peyote]: {
        width: 20,
        height: 30
    }
} as const;
