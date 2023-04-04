import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { User } from 'src/database/models/user.model';
import { UserInfo } from 'src/services/google/google.service';
import { UserInput } from './dtos/input_types';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private readonly userModel: typeof User,
    ) { }

    async update(user: User, userInput: UserInput, transaction?: Transaction): Promise<void> {
        if (userInput?.password) await user.update({ password: userInput.password }, { transaction });
        if (userInput?.username) await user.update({ username: userInput.username }, { transaction });
        if (userInput?.email) await user.update({ email: userInput.email.toLowerCase() }, { transaction });
    }

    async findUserByEmail(email: string, transaction?: Transaction): Promise<User | null> {
        return await this.userModel.findOne({ where: { email: email.toLowerCase() }, transaction });
    }

    async create(userData: { email: string, password: string; }, transaction?: Transaction): Promise<User> {
        return await this.userModel.create({ ...userData, email: userData.email.toLowerCase() }, { transaction });
    }

    async createWithSocialAccount(userData: UserInfo, transaction?: Transaction): Promise<User> {
        return await this.userModel.create({ email: userData.email.toLowerCase(), username: userData.name }, { transaction });
    }

    async findUserById(id: ID, transaction?: Transaction): Promise<User> {
        return await this.userModel.findByPk(id, { transaction });
    }
}
