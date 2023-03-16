import { Controller, Get, NotImplementedException, UseInterceptors } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';

@Controller('debug')
export class DebugController {

    @Get()
    @UseInterceptors(TransactionInterceptor)
    async test(
        @SequelizeTransaction() transaction: Transaction,
    ) {
        throw new NotImplementedException();
    }
}
