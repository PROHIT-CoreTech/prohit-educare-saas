import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Academy } from '../src/database/schemas/academy.schema';
import { User } from '../src/database/schemas/user.schema';
import { Student } from '../src/database/schemas/student.schema';
import { ClassBatch } from '../src/database/schemas/class-batch.schema';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

describe('Tenant Isolation & Security E2E Test Suite', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let academyModel: Model<any>;
  let userModel: Model<any>;
  let studentModel: Model<any>;
  let classBatchModel: Model<any>;

  let academyA: any;
  let academyB: any;
  let tokenA: string;
  let tokenB: string;
  let studentB: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.setGlobalPrefix('api');
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    academyModel = moduleFixture.get<Model<any>>(getModelToken(Academy.name));
    userModel = moduleFixture.get<Model<any>>(getModelToken(User.name));
    studentModel = moduleFixture.get<Model<any>>(getModelToken(Student.name));
    classBatchModel = moduleFixture.get<Model<any>>(getModelToken(ClassBatch.name));

    // Clear test data
    await academyModel.deleteMany({});
    await userModel.deleteMany({});
    await studentModel.deleteMany({});
    await classBatchModel.deleteMany({});

    // Create Academy A
    academyA = await academyModel.create({
      name: 'Academy A',
      slug: 'academy-a',
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: new Date(Date.now() + 14 * 86400000),
    });

    const userA = await userModel.create({
      academyId: academyA._id,
      name: 'User A',
      email: 'usera@academy-a.com',
      passwordHash: 'hash',
      role: 'SUPER_ADMIN',
    });

    tokenA = jwtService.sign(
      { sub: userA._id.toString(), academyId: academyA._id.toString(), role: 'SUPER_ADMIN', email: userA.email },
      { secret: process.env.JWT_SECRET || 'super-secret-key-123' },
    );

    // Create Academy B
    academyB = await academyModel.create({
      name: 'Academy B',
      slug: 'academy-b',
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: new Date(Date.now() + 14 * 86400000),
    });

    const userB = await userModel.create({
      academyId: academyB._id,
      name: 'User B',
      email: 'userb@academy-b.com',
      passwordHash: 'hash',
      role: 'SUPER_ADMIN',
    });

    tokenB = jwtService.sign(
      { sub: userB._id.toString(), academyId: academyB._id.toString(), role: 'SUPER_ADMIN', email: userB.email },
      { secret: process.env.JWT_SECRET || 'super-secret-key-123' },
    );

    const classB = await classBatchModel.create({
      academyId: academyB._id,
      standard: 10,
      medium: 'english',
      section: 'none',
      batchName: 'Class B 10th',
    });

    studentB = await studentModel.create({
      academyId: academyB._id,
      studentCode: 'STU-B1',
      name: 'Student B',
      parentName: 'Parent B',
      parentPhone: '9999999999',
      classBatchId: classB._id,
      standard: 10,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Cross-Tenant Access Prevention', () => {
    it('Academy A requesting Academy B Student by ID MUST return 404 or 403', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/students/${studentB._id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect([403, 404]).toContain(res.status);
    });

    it('Academy A attempting to patch Academy B Student MUST return 404 or 403', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/students/${studentB._id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Hacked Student' });

      expect([403, 404]).toContain(res.status);
    });

    it('Academy A attempting to delete Academy B Student MUST return 404 or 403', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/students/${studentB._id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect([403, 404]).toContain(res.status);
    });
  });

  describe('2. Cashfree Webhook Signature Security', () => {
    it('Cashfree webhook endpoint MUST reject forged signature with HTTP 400', async () => {
      const payload = JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK', data: {} });
      const res = await request(app.getHttpServer())
        .post('/api/billing/webhook/cashfree')
        .set('x-webhook-signature', 'forged_fake_signature_123')
        .send(payload);

      expect(res.status).toBe(400);
    });

    it('Cashfree webhook endpoint MUST accept valid signature with HTTP 200', async () => {
      const payload = JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK', data: {} });
      const secret = process.env.CASHFREE_SECRET_KEY || 'test_secret_key_for_e2e';
      const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const res = await request(app.getHttpServer())
        .post('/api/billing/webhook/cashfree')
        .set('x-webhook-signature', validSignature)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });
});
