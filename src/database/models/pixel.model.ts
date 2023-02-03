import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Gerdan } from './gerdan.model';

@Table({
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    deletedAt: false,
})
export class Pixel extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        allowNull: false,
        unique: true,
        defaultValue: DataType.UUIDV4
    })
    uuid: string;

    @ForeignKey(() => Gerdan)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    gerdanId: ID;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    x: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    y: number;

    @Column({
        type: DataType.CHAR(7),
        allowNull: false,
    })
    color: string;

    @Column(DataType.INTEGER)
    index: number;

    @Column(DataType.CHAR(7))
    indexColor: string;

    @Column(DataType.FLOAT)
    indexCoordX: number;

    @Column(DataType.FLOAT)
    indexCoordY: number;
}
