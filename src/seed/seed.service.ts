import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../departments/entities/department.entity';
import { Specialization } from '../specializations/entities/specialization.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(Specialization)
    private readonly specRepo: Repository<Specialization>,
    @InjectRepository(Doctor)
    private readonly docRepo: Repository<Doctor>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  private async createDepartmentIfNotExists(name: string, location: string) {
    const existing = await this.deptRepo.findOneBy({ name });
    if (!existing) {
      return this.deptRepo.save({ name, location });
    }
    return existing;
  }

  private async createSpecializationIfNotExists(
    label: string,
    departmentId: number,
  ) {
    const existing = await this.specRepo.findOneBy({
      label,
      department_id: departmentId,
    });
    if (!existing) {
      return this.specRepo.save({ label, department_id: departmentId });
    }
    return existing;
  }

  private async createUserIfNotExists(userData: Partial<User>) {
    const existing = await this.userRepo.findOneBy({ email: userData.email });
    if (!existing) {
      return this.userRepo.save(userData);
    }
    return existing;
  }

  private async createDoctorIfNotExists(doctorData: Partial<Doctor>) {
    const existing = await this.docRepo.findOneBy({
      doctor_id: doctorData.doctor_id,
    });
    if (!existing) {
      return this.docRepo.save(doctorData);
    }
    return existing;
  }

  async onModuleInit() {
    const hashedPassword = await bcrypt.hash('test123', 10);

    // 1. Departments
    const generalTherapy = await this.createDepartmentIfNotExists(
      'Терапевтичне відділення',
      'Поверх 1',
    );
    const pediatricsDept = await this.createDepartmentIfNotExists(
      'Педіатричне відділення',
      'Поверх 2',
    );
    const specialMedicine = await this.createDepartmentIfNotExists(
      'Відділ спеціальної медицини',
      'Поверх 3',
    );

    // 2. Specializations
    // Терапевтичне відділення
    await this.createSpecializationIfNotExists(
      'Загальна терапія',
      generalTherapy.id,
    );
    await this.createSpecializationIfNotExists(
      'Гастроентерологія',
      generalTherapy.id,
    );
    const cardioSpec = await this.createSpecializationIfNotExists(
      'Кардіологія',
      generalTherapy.id,
    );
    await this.createSpecializationIfNotExists('Неврологія', generalTherapy.id);
    await this.createSpecializationIfNotExists(
      'Ендокринологія',
      generalTherapy.id,
    );
    await this.createSpecializationIfNotExists(
      'Сімейна медицина',
      generalTherapy.id,
    );

    // Педіатричне відділення
    const pediSpec = await this.createSpecializationIfNotExists(
      'Педіатрія',
      pediatricsDept.id,
    );
    await this.createSpecializationIfNotExists('Логопедія', pediatricsDept.id);
    await this.createSpecializationIfNotExists('Психологія', pediatricsDept.id);

    // Відділ спеціальної медицини
    await this.createSpecializationIfNotExists('Урологія', specialMedicine.id);
    await this.createSpecializationIfNotExists(
      'Гінекологія',
      specialMedicine.id,
    );
    await this.createSpecializationIfNotExists(
      'Ортопедія та травматологія',
      specialMedicine.id,
    );
    await this.createSpecializationIfNotExists(
      'Дерматологія',
      specialMedicine.id,
    );
    await this.createSpecializationIfNotExists(
      'Офтальмологія',
      specialMedicine.id,
    );
    await this.createSpecializationIfNotExists(
      'Отоларингологія',
      specialMedicine.id,
    );
    await this.createSpecializationIfNotExists(
      'Психотерапія',
      specialMedicine.id,
    );

    // 3. Users: Doctor, Client, Manager, Moderator
    const userDoctor = await this.createUserIfNotExists({
      name: 'Василь',
      surname: 'Іваненко',
      middlename: 'Гафрилов',
      date_of_birth: new Date('1980-05-20'),
      email: 'doc1@example.com',
      phone: '+380501112233',
      password_hash: hashedPassword,
      role: UserRole.DOCTOR,
    });

    const userClient = await this.createUserIfNotExists({
      name: 'Олена',
      surname: 'Петренко',
      middlename: '',
      date_of_birth: new Date('1990-07-15'),
      email: 'client1@example.com',
      phone: '+380671234567',
      password_hash: hashedPassword,
      role: UserRole.CLIENT,
    });

    const userManager = await this.createUserIfNotExists({
      name: 'Ігор',
      surname: 'Коваленко',
      middlename: '',
      date_of_birth: new Date('1985-01-10'),
      email: 'manager1@example.com',
      phone: '+380631112233',
      password_hash: hashedPassword,
      role: UserRole.MANAGER,
    });

    const userModerator = await this.createUserIfNotExists({
      name: 'Марія',
      surname: 'Сидоренко',
      middlename: '',
      date_of_birth: new Date('1988-03-22'),
      email: 'moderator1@example.com',
      phone: '+380661223344',
      password_hash: hashedPassword,
      role: UserRole.MODERATOR,
    });

    // 4. Doctors linked to users
    await this.createDoctorIfNotExists({
      doctor_id: userDoctor.user_id,
      user: userDoctor,
      specialization_id: cardioSpec.id.toString(),
      department_id: generalTherapy.id,
      rating: null,
      experience_years: 5,
      cabinet: 'A-101',
      consultation_price: 150.0,
    });
  }
}
