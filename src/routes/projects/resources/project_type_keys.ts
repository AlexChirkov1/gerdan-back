import { ProjectTypeEnum } from 'src/database/models/project.model';

export const ProjectTypeKeys = Object.keys(ProjectTypeEnum).filter(key => !+key) as ReadonlyArray<keyof typeof ProjectTypeEnum>;
