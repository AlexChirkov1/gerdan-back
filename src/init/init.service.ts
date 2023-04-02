import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { getFileType } from 'src/database/file_types';
import { File } from 'src/database/models/file.model';
import { Gerdan } from 'src/database/models/gerdan.model';
import { Pixel } from 'src/database/models/pixel.model';
import { Colormap, Project, ProjectTypeEnum, Schema, SchemaItem } from 'src/database/models/project.model';
import { User } from 'src/database/models/user.model';
import { SupabaseService } from 'src/services/supabase/supabase.service';

@Injectable()
export class InitService {
    constructor(
        private readonly supabaseService: SupabaseService,
        @InjectConnection()
        private readonly sequelize: Sequelize,
        @InjectModel(Gerdan)
        private readonly gerdanModel: typeof Gerdan,
        @InjectModel(Project)
        private readonly projectModel: typeof Project,
        @InjectModel(User)
        private readonly userModel: typeof User,
        @InjectModel(File)
        private readonly fileModel: typeof File,
        @InjectModel(Pixel)
        private readonly pixelModel: typeof Pixel,
    ) { }

    async syncFiles() {
        await this.sequelize.transaction(async (transaction) => {
            await this.supabaseService.createBucket();

            const count = await this.userModel.count();
            for (let i = 0; i < count; i++) {
                const user = await this.userModel.findOne({ limit: 1, offset: i, transaction });

                const fileNamesList = [];
                const limit = 100;
                let offset = 0;
                do {
                    const supabaseFiles = await this.supabaseService.getFilesList(user.id, limit, offset);
                    if (supabaseFiles.error) throw supabaseFiles.error;
                    if (!supabaseFiles.data.length) break;
                    fileNamesList.push(...supabaseFiles.data.map(file => file.name));
                    offset += limit;
                } while (true);

                const totalFilesCount = await this.fileModel.count({ where: { userId: user.id }, transaction });

                for (let limit = 100, offset = 0; offset <= totalFilesCount; offset += limit) {
                    const files = await this.fileModel.findAll({ where: { userId: user.id }, limit, offset, transaction });
                    if (!files.length) break;

                    for (const file of files) {
                        if (!file.blob) continue;
                        const fileExist = fileNamesList.findIndex(item => item === `${file.name}.${getFileType(file.type)}`);
                        if (fileExist !== -1) await this.supabaseService.updateFileInStorage(file.blob, file.userId, `${file.name}.${getFileType(file.type)}`);
                        else await this.supabaseService.addFileToStorage(file.blob, file.userId, `${file.name}.${getFileType(file.type)}`);
                    }
                }
            }
        });
    }

    async migrateGerdans() {
        await this.sequelize.transaction(async (transaction) => {
            const usersCount = await this.userModel.count();
            for (let i_limit = 1000, i_offset = 0; i_offset < usersCount; i_offset += i_limit) {
                const users = await this.userModel.findAll({ limit: i_limit, offset: i_offset, transaction });
                if (!users.length) break;
                for (const user of users) {
                    const gerdansCount = await this.gerdanModel.count({ where: { userId: user.id, migrated: false }, transaction });
                    for (let j_limit = 1000, j_offset = 0; j_offset < gerdansCount; j_offset += j_limit) {
                        const gerdans = await this.gerdanModel.findAll({ where: { userId: user.id, migrated: false }, limit: j_limit, offset: j_offset, transaction });
                        if (!gerdans.length) break;
                        for (const gerdan of gerdans) {
                            const pixels = await this.pixelModel.findAll({ where: { gerdanId: gerdan.id }, transaction, mapToModel: false, raw: true });
                            const items = this.transformPixelsToSchemaItems(pixels, gerdan.backgroundColor);
                            this.fillItemsWithMocks(items, gerdan.width, gerdan.height);
                            const schema = this.transformSchemaItemsToSchema(items);
                            schema.forEach(row => row.sort((a, b) => a.y - b.y));
                            schema.forEach(row => row.sort((a, b) => a.x - b.x));
                            schema.sort((a, b) => a[0].y - b[0].y);
                            const colormap = this.getColormapFromSchemaItems(items);

                            await this.projectModel.create({
                                userId: user.id,
                                name: gerdan.name,
                                type: ProjectTypeEnum.grid,
                                backgroundColor: gerdan.backgroundColor,
                                schema: JSON.stringify(schema),
                                colormap: JSON.stringify(colormap),
                                previewId: gerdan.previewId
                            }, { transaction });
                            await gerdan.update({ migrated: true }, { transaction });
                        }
                    }
                }
            }
        });
    }

    fillItemsWithMocks(items: SchemaItem[], width: number, height: number) {
        const PIXEL_SIZE = 25;
        const maxX = width * PIXEL_SIZE;
        const maxY = height * PIXEL_SIZE;
        for (let y = 0; y < maxY; y += 25) {
            for (let x = 0; x < maxX; x += 25) {
                const index = items.findIndex(item => item.x === x && item.y === y);
                if (index === -1) items.push({ x, y, filled: false });
            }
        }
    }

    transformPixelsToSchemaItems(pixels: Pixel[], backgroundColor: string): SchemaItem[] {
        const schema: SchemaItem[] = [];
        for (const pixel of pixels) {
            schema.push({
                x: Math.round(pixel.x / 25) * 25,
                y: Math.round(pixel.y / 25) * 25,
                filled: pixel.color.toLowerCase() !== backgroundColor.toLowerCase(),
                color: pixel.color.toLowerCase() !== backgroundColor.toLowerCase() ? pixel.color.toLowerCase() : undefined,
                number: pixel?.index,
            });
        }
        return schema;
    }

    transformSchemaItemsToSchema(items: SchemaItem[]): Schema {
        const schema: Schema = [];
        const rowsSet: Set<number> = new Set();

        items.forEach(item => rowsSet.add(item.y));
        const rows = Array.from(rowsSet);

        for (const row of rows) {
            const rowItems = items.filter(item => item.y === row);
            schema.push(rowItems);
        }

        return schema;
    }

    getColormapFromSchemaItems(items: SchemaItem[]): Colormap {
        const colormap: Colormap = [];
        const map: Map<number, string> = new Map();

        items.forEach(item => { if (!map.has(item.number)) map.set(item.number, item.color); });

        for (const [key, value] of map) {
            if (key && value) colormap.push({ color: value, number: key });
        }

        return colormap;
    }
}
