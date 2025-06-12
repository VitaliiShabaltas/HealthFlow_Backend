import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from '../departments/entities/department.entity';
import { Specialization } from '../specializations/entities/specialization.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { SeedService } from './seed.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, Specialization, Doctor, User]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
