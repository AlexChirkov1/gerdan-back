import { Column, CreatedAt, DataType, Model, Table } from 'sequelize-typescript';

@Table({
    createdAt: true,
    updatedAt: false,
})
export class File extends Model {
    @Column({
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
        type: DataType.INTEGER,
    })
    id: ID;

    @CreatedAt
    createdAt: Date;

    @Column({
        type: DataType.STRING(),
        allowNull: false,
    })
    path: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    type: number;
}
