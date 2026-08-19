import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import helmet from 'helmet';

describe('App Integration (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;
  let userId: string;
  let reservationId: string;

  const testUser = {
    name: 'E2E Test User',
    email: 'e2e@test.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(helmet());
    app.enableCors();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    
    // Cleanup any previous failed runs
    await prisma.reservation.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.reservation.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await app.close();
  });

  describe('Authentication flow', () => {
    it('/auth/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('email', testUser.email);
          expect(response.body).not.toHaveProperty('password');
          userId = response.body.id;
        });
    });

    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('access_token');
          jwtToken = response.body.access_token;
        });
    });
  });

  describe('Reservations flow', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().split('T')[0]; // yyyy-mm-dd
    
    const startTime = new Date(`${dateStr}T10:00:00Z`).toISOString();
    const endTime = new Date(`${dateStr}T12:00:00Z`).toISOString();

    it('/reservations (POST) - Create valid reservation', () => {
      return request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          roomId: 'sala-e2e',
          date: `${dateStr}T00:00:00Z`,
          startTime,
          endTime,
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.roomId).toBe('sala-e2e');
          reservationId = response.body.id;
        });
    });

    it('/reservations (POST) - Fail overlap reservation (409)', () => {
      const overlapStart = new Date(`${dateStr}T11:00:00Z`).toISOString();
      const overlapEnd = new Date(`${dateStr}T13:00:00Z`).toISOString();

      return request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          roomId: 'sala-e2e',
          date: `${dateStr}T00:00:00Z`,
          startTime: overlapStart,
          endTime: overlapEnd,
        })
        .expect(409);
    });

    it('/reservations (POST) - Fail past reservation (400)', () => {
      const pastStart = new Date(Date.now() - 100000).toISOString();
      const pastEnd = new Date(Date.now() + 3600000).toISOString();

      return request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          roomId: 'sala-e2e',
          date: new Date().toISOString(),
          startTime: pastStart,
          endTime: pastEnd,
        })
        .expect(400);
    });

    it('/reservations/:id (DELETE) - Cleanup reservation', () => {
      return request(app.getHttpServer())
        .delete(`/reservations/${reservationId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
    });
  });
});
