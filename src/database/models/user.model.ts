import { BeforeCreate, BeforeUpdate, Column, DataType, Table } from 'sequelize-typescript';
import { PasswordHelper } from 'src/utils/password.helper';
import { BaseModel } from '../common/base.model';

@Table
export class User extends BaseModel {

    @Column(DataType.STRING)
    firstName: string;

    @Column(DataType.STRING)
    lastName: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false
    })
    username: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    email: string;

    @Column({
        type: DataType.CHAR(128),
        allowNull: false,
    })
    password: string;

    @Column(DataType.CHAR(32))
    salt: string;

    @BeforeCreate
    static createPassword(instance: User): void {
        if (instance.password) {
            instance.salt = PasswordHelper.generateSalt();
            instance.password = PasswordHelper.hash(`${instance.password}${instance.salt}${process.env.SECRET_SALT}`);
        }
    }

    @BeforeUpdate
    static updatePassword(instance: User): void {
        if (instance.password && instance.changed('password')) {
            instance.salt = PasswordHelper.generateSalt();
            instance.password = PasswordHelper.hash(`${instance.password}${instance.salt}${process.env.SECRET_SALT}`);
        }
    }
}
