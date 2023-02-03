import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { User } from 'src/database/models/user.model';
import { UserInput } from './api/user.input';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private readonly userModel: typeof User,
    ) { }

    async update(user: User, userInput: UserInput, transaction?: Transaction): Promise<void> {
        if (userInput?.password) await user.update({ password: userInput.password }, { transaction });
        if (userInput?.firstName) await user.update({ firstName: userInput.firstName }, { transaction });
        if (userInput?.lastName) await user.update({ lastName: userInput.lastName }, { transaction });
        if (userInput?.username) await user.update({ username: userInput.username }, { transaction });
        if (userInput?.email) await user.update({ email: userInput.email }, { transaction });
    }

    async findUserByUsername(username: string, transaction?: Transaction): Promise<User | null> {
        return await this.userModel.findOne({ where: { username }, transaction });
    }

    async findUserByEmail(email: string, transaction?: Transaction): Promise<User | null> {
        return await this.userModel.findOne({ where: { email }, transaction });
    }

    async create(userData: { email: string, password: string; }, transaction?: Transaction): Promise<User> {
        return await this.userModel.create(userData, { transaction });
    }

    async findUserById(id: ID, transaction?: Transaction): Promise<User> {
        return await this.userModel.findByPk(id, { transaction });
    }
}
