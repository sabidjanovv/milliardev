import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from './customer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
