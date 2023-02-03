import { Expose } from 'class-transformer';
import { BaseDto } from 'src/common/base.dto';
import { User } from 'src/database/models/user.model';

export class BaseUserDto extends BaseDto {
    @Expose()
    firstName: string;
    @Expose()
    lastName: string;
    @Expose()
    username: string;
    @Expose()
    email: string;
    constructor(user: Partial<User>) {
        super(user);
        Object.assign(this, user);
    }
}
