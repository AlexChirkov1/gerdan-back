import { Column, CreatedAt, DataType, Model, UpdatedAt } from 'sequelize-typescript';

export class BaseModel extends Model {
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
    @UpdatedAt
    updatedAt: Date;
}
