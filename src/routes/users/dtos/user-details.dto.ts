import { Expose } from 'class-transformer';
import { BaseDto } from 'src/common/base.dto';
import { User } from 'src/database/models/user.model';

export class UserDetailsDto extends BaseDto {
    @Expose()
    firstName: string;
    @Expose()
    lastName: string;
    @Expose()
    username: string;
    @Expose()
    email: string;
    @Expose()
    gerdansCount: number;
    constructor(user: Partial<User>, gerdansCount: number) {
        super(user);
        Object.assign(this, user);
        this.gerdansCount = gerdansCount;
    }
}
