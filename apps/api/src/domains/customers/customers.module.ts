import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersResolver } from './customers.resolver';
import { PrismaCustomerRepository } from './infrastructure/prisma-customer.repository';
import { CUSTOMER_REPOSITORY } from '../../core/constants/repository.tokens';

@Module({
  providers: [
    CustomersResolver,
    CustomersService,
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: PrismaCustomerRepository,
    },
  ],
  exports: [CustomersService],
})
export class CustomersModule {}
