import * as dotenv from 'dotenv';
dotenv.config();

import { connect, disconnect, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { PlatformUserSchema } from '../database/schemas/platform-user.schema';
import { AcademySchema } from '../database/schemas/academy.schema';
import { UserSchema } from '../database/schemas/user.schema';
import { ClassBatchSchema } from '../database/schemas/class-batch.schema';
import { FeeStructureSchema } from '../database/schemas/fee-structure.schema';
import { StudentSchema } from '../database/schemas/student.schema';
import { FeeScheduleSchema } from '../database/schemas/fee-schedule.schema';
import { PaymentSchema } from '../database/schemas/payment.schema';
import { CounterSchema } from '../database/schemas/counter.schema';

async function seed() {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI_DEVELOPMENT ||
    'mongodb://localhost:27017/prohit-educare';
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  const conn = await connect(mongoUri);

  const PlatformUser = conn.model('PlatformUser', PlatformUserSchema);
  const Academy = conn.model('Academy', AcademySchema);
  const User = conn.model('User', UserSchema);
  const ClassBatch = conn.model('ClassBatch', ClassBatchSchema);
  const FeeStructure = conn.model('FeeStructure', FeeStructureSchema);
  const Student = conn.model('Student', StudentSchema);
  const FeeSchedule = conn.model('FeeSchedule', FeeScheduleSchema);
  const Payment = conn.model('Payment', PaymentSchema);
  const Counter = conn.model('Counter', CounterSchema);

  console.log('Clearing existing database collections...');
  await Promise.all([
    PlatformUser.deleteMany({}),
    Academy.deleteMany({}),
    User.deleteMany({}),
    ClassBatch.deleteMany({}),
    FeeStructure.deleteMany({}),
    Student.deleteMany({}),
    FeeSchedule.deleteMany({}),
    Payment.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  console.log('1. Seeding Platform Owner...');
  const platformPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const platformOwner = await PlatformUser.create({
    name: 'PROHIT Admin',
    email: 'admin@prohiteducare.com',
    passwordHash: platformPasswordHash,
    role: 'SUPER_ADMIN',
  });
  console.log(`Platform Owner created: ${platformOwner.email}`);

  const defaultPasswordHash = await bcrypt.hash('Academy123!', 10);

  // 2. Provision Academy A ("Viraj Academy")
  console.log('2. Provisioning Academy A (Viraj Academy)...');
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 14);

  const academyA = await Academy.create({
    name: 'Viraj Academy',
    slug: 'viraj',
    subscriptionStatus: 'ACTIVE',
    trialEndsAt: trialEnds,
    primaryColor: '#4f46e5',
  });

  const userA = await User.create({
    academyId: academyA._id,
    name: 'Viraj Patel',
    email: 'admin@virajacademy.com',
    passwordHash: defaultPasswordHash,
    role: 'SUPER_ADMIN',
    phone: '9876543210',
    isActive: true,
  });

  // Class Batches for Academy A
  const classA10 = await ClassBatch.create({
    academyId: academyA._id,
    standard: 10,
    medium: 'english',
    section: 'none',
    batchName: 'Std 10th English Alpha',
  });

  const classA11 = await ClassBatch.create({
    academyId: academyA._id,
    standard: 11,
    medium: 'english',
    section: 'science',
    batchName: 'Std 11th Science English',
  });

  // Fee Structures for Academy A
  const feeStructA10 = await FeeStructure.create({
    academyId: academyA._id,
    standard: 10,
    name: 'Std 10 Annual Fee',
    totalAmount: 15000,
    installmentsCount: 3,
    installmentBreakdown: [
      { installmentNo: 1, dueDate: new Date('2026-06-01'), amount: 5000 },
      { installmentNo: 2, dueDate: new Date('2026-09-01'), amount: 5000 },
      { installmentNo: 3, dueDate: new Date('2026-12-01'), amount: 5000 },
    ],
  });

  // Students for Academy A
  const studentA1 = await Student.create({
    academyId: academyA._id,
    studentCode: 'STU-0001',
    name: 'Aarav Sharma',
    parentName: 'Rajesh Sharma',
    parentPhone: '9876500001',
    parentEmail: 'rajesh.sharma@example.com',
    classBatchId: classA10._id,
    standard: 10,
    status: 'ACTIVE',
    advanceBalance: 500,
  });

  // Fee Schedules for Student A1
  await FeeSchedule.create({
    academyId: academyA._id,
    studentId: studentA1._id,
    feeStructureId: feeStructA10._id,
    installmentNo: 1,
    dueDate: new Date('2026-06-01'),
    amount: 5000,
    paidAmount: 5000,
    status: 'PAID',
  });

  await FeeSchedule.create({
    academyId: academyA._id,
    studentId: studentA1._id,
    feeStructureId: feeStructA10._id,
    installmentNo: 2,
    dueDate: new Date('2026-09-01'),
    amount: 5000,
    paidAmount: 2500,
    status: 'PARTIAL',
  });

  await FeeSchedule.create({
    academyId: academyA._id,
    studentId: studentA1._id,
    feeStructureId: feeStructA10._id,
    installmentNo: 3,
    dueDate: new Date('2026-12-01'),
    amount: 5000,
    paidAmount: 0,
    status: 'PENDING',
  });

  await Payment.create({
    academyId: academyA._id,
    receiptNumber: 'REC-2026-00001',
    studentId: studentA1._id,
    paymentDate: new Date('2026-06-02'),
    totalAmountPaid: 7500,
    paymentMode: 'UPI',
    transactionRef: 'UPI123456789',
    allocations: [],
    advanceAdded: 500,
    createdByUserId: userA._id,
  });

  console.log(`Academy A (${academyA.slug}) seeded with Admin: ${userA.email}`);

  // 3. Provision Academy B ("Suraj Classes")
  console.log('3. Provisioning Academy B (Suraj Classes)...');
  const academyB = await Academy.create({
    name: 'Suraj Classes',
    slug: 'suraj',
    subscriptionStatus: 'ACTIVE',
    trialEndsAt: trialEnds,
    primaryColor: '#059669',
  });

  const userB = await User.create({
    academyId: academyB._id,
    name: 'Suraj Verma',
    email: 'admin@surajclasses.com',
    passwordHash: defaultPasswordHash,
    role: 'SUPER_ADMIN',
    phone: '9876543211',
    isActive: true,
  });

  const classB10 = await ClassBatch.create({
    academyId: academyB._id,
    standard: 10,
    medium: 'marathi',
    section: 'none',
    batchName: 'Std 10th Marathi Batch',
  });

  const studentB1 = await Student.create({
    academyId: academyB._id,
    studentCode: 'STU-0001',
    name: 'Rohan Deshmukh',
    parentName: 'Sanjay Deshmukh',
    parentPhone: '9876500002',
    parentEmail: 'sanjay.d@example.com',
    classBatchId: classB10._id,
    standard: 10,
    status: 'ACTIVE',
    advanceBalance: 0,
  });

  console.log(`Academy B (${academyB.slug}) seeded with Admin: ${userB.email}`);
  console.log('Seed completed successfully!');

  await disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
