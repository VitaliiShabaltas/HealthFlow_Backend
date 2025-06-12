import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../departments/entities/department.entity';
import { Specialization } from '../specializations/entities/specialization.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { DeepPartial } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user.entity';

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
    private readonly userRepo: Repository<User>, // ← додай це
  ) {}

  async onModuleInit() {
    // 1. Departments
    const countDept = await this.deptRepo.count();
    if (countDept === 0) {
      const departments: DeepPartial<Department>[] = [
        {
          name: 'Терапевтичне відділення',
          location: 'Поверх 1',
        },
        {
          name: 'Педіатричне відділення',
          location: 'Поверх 2',
        },
        {
          name: 'Відділ спеціальної медицини',
          location: 'Поверх 3',
        },
      ];

      await this.deptRepo.save(departments);
    }

    // Отримаємо відділення з БД
    const departments = await this.deptRepo.find();
    const generalTherapy = departments.find(
      (d) => d.name === 'Терапевтичне відділення',
    );
    const pediatricsDept = departments.find(
      (d) => d.name === 'Педіатричне відділення',
    );
    const specialMedicine = departments.find(
      (d) => d.name === 'Відділ спеціальної медицини',
    );

    // 2. Specializations
    const countSpec = await this.specRepo.count();
    if (
      countSpec === 0 &&
      generalTherapy &&
      pediatricsDept &&
      specialMedicine
    ) {
      await this.specRepo.save([
        // Терапевтичне відділення
        { label: 'Загальна терапія', department_id: generalTherapy.id },
        { label: 'Гастроентерологія', department_id: generalTherapy.id },
        { label: 'Кардіологія', department_id: generalTherapy.id },
        { label: 'Неврологія', department_id: generalTherapy.id },
        { label: 'Ендокринологія', department_id: generalTherapy.id },
        { label: 'Сімейна медицина', department_id: generalTherapy.id },

        // Педіатричне відділення
        { label: 'Педіатрія', department_id: pediatricsDept.id },
        { label: 'Логопедія', department_id: pediatricsDept.id },
        { label: 'Психологія', department_id: pediatricsDept.id },

        // Відділ спеціальної медицини
        { label: 'Урологія', department_id: specialMedicine.id },
        { label: 'Гінекологія', department_id: specialMedicine.id },
        {
          label: 'Ортопедія та травматологія',
          department_id: specialMedicine.id,
        },
        { label: 'Дерматологія', department_id: specialMedicine.id },
        { label: 'Офтальмологія', department_id: specialMedicine.id },
        { label: 'Отоларингологія', department_id: specialMedicine.id },
        { label: 'Психотерапія', department_id: specialMedicine.id },
      ]);
    }

    // 3. Doctors
    const countDoc = await this.docRepo.count();
    if (countDoc === 0) {
      const cardioSpec = await this.specRepo.findOneBy({
        label: 'Кардіологія',
      });
      const pediSpec = await this.specRepo.findOneBy({ label: 'Педіатрія' });

      if (!cardioSpec || !pediSpec || !generalTherapy || !pediatricsDept) {
        return;
      }

      const user1 = await this.userRepo.save({
        user_id: 1,
        name: 'Кардіолог',
        surname: 'Іваненко',
        date_of_birth: new Date('1980-05-20'),
        email: 'doc1@example.com',
        phone: '+380501112233',
        password_hash: 'somehash',
        role: UserRole.DOCTOR,
      });

      await this.docRepo.save({
        doctor_id: user1.user_id, // Same ID as user
        user: user1,
        specialization_id: cardioSpec.id.toString(),
        department_id: generalTherapy.id,
        rating: null,
        experience_years: 5,
        cabinet: 'A-101',
        consultation_price: 150.0,
      });
    }
  }
}
