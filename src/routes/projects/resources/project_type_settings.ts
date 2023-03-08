import { ProjectTypeEnum } from 'src/database/models/project.model';

export const ProjectTypeSettings = {
    loom: {
        name: ProjectTypeEnum.loom,
        boxWidth: 20,
        boxHeight: 30
    },
    grid: {
        name: ProjectTypeEnum.grid,
        boxWidth: 25,
        boxHeight: 25
    },
    brick: {
        name: ProjectTypeEnum.brick,
        boxWidth: 30,
        boxHeight: 20
    },
    peyote: {
        name: ProjectTypeEnum.peyote,
        boxWidth: 20,
        boxHeight: 30
    }
} as const;
