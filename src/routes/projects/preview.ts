import { Project } from 'src/database/models/project.model';
import { SchemaItem } from './dtos/input_types';
import { ProjectTypeSetting, ProjectTypeSettings } from './resources/project_type_settings';

export function makePreview(project: Project) {
    const width = Math.max(project.schema[0].length, project.schema[1].length);
    const height = project.schema.length;
    const bead = ProjectTypeSettings[project.type] as ProjectTypeSetting;
    
}
