import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceResolver } from './finance.resolver';
import { PrismaFinanceRepository } from './infrastructure/prisma-finance.repository';
import { FINANCE_REPOSITORY } from '../../core/constants/repository.tokens';

@Module({
  providers: [
    FinanceResolver,
    FinanceService,
    {
      provide: FINANCE_REPOSITORY,
      useClass: PrismaFinanceRepository,
    },
  ],
  exports: [FinanceService],
})
export class FinanceModule {}
