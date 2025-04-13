import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { Address, AddressSchema } from './schemas/address.schema';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
    JwtModule.register({}),
  ],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
