import { Column, CreatedAt, DataType, Model, Scopes, Table } from 'sequelize-typescript';
import { commonScopes } from '../common/common.scopes';

@Scopes(() => Object.assign({}, commonScopes))
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
        type: DataType.INTEGER,
        allowNull: false,
    })
    type: number;

    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    name: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    userId: ID;
}
