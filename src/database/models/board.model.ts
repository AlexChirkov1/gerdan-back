import { BelongsTo, Column, DataType, ForeignKey, Scopes, Table } from 'sequelize-typescript';
import { BaseModel } from '../common/base.model';
import { commonScopes } from '../common/common.scopes';
import { File } from './file.model';
import { User } from './user.model';

export type SchemaItem = {
    x: number;
    y: number;
    filled: boolean;
    colorFill?: string;
    number?: number;
};

export type ColormapItem = {
    color: string;
    number: number;
};

export enum BoardTypeEnum {
    grid = 1,
    loom = 2,
    brick = 3,
    peyote = 4,
}

@Scopes(() => Object.assign({
    withAuthor: () => ({ include: { model: User, required: true } }),
    withPreview: () => ({ include: { model: File, required: false } }),
    byAuthorId: (userId) => ({ where: { userId } })
}, commonScopes))
@Table
export class Board extends BaseModel {
    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    userId: ID;

    @ForeignKey(() => File)
    @Column(DataType.UUID)
    previewId: ID;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataType.SMALLINT,
        allowNull: false,
    })
    type: number;

    @Column(DataType.CHAR(7))
    backgroundColor: string;

    @Column(DataType.TEXT)
    schema: SchemaItem[];

    @Column(DataType.TEXT)
    colormap: ColormapItem[];

    @BelongsTo(() => User)
    author: User;

    @BelongsTo(() => File)
    preview: File;
}
