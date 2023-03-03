import { Controller, Get, NotImplementedException, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transaction } from 'sequelize';
import { SequelizeTransaction } from 'src/database/common/transaction.decorator';
import { TransactionInterceptor } from 'src/database/common/transaction.interceptor';

@ApiTags('debug')
@Controller('debug')
export class DebugController {
    @Get()
    @ApiOperation({ summary: 'API for testing some nonsense' })
    @UseInterceptors(TransactionInterceptor)
    async test(
        @SequelizeTransaction() transaction: Transaction,
    ) {
        throw new NotImplementedException();
    }
}
