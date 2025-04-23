import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from './customer.controller';
import { Project, ProjectSchema } from '../project/schemas/project.schema';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    ProjectModule,
    JwtModule.register({}),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
