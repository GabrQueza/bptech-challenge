import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(() => 'test_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('1. Registro de usuário com sucesso', async () => {
      const dto = { name: 'Test', email: 'test@test.com', password: 'password123' };
      mockPrismaService.user.findUnique.mockResolvedValue(null); // email not taken
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        name: 'Test',
        email: 'test@test.com',
        password: 'hashedPassword',
      });

      const result = await authService.register(dto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { ...dto, password: 'hashedPassword' },
      });
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id', '1');
    });

    it('2. Erro de registro por email duplicado (deve lançar ConflictException)', async () => {
      const dto = { name: 'Test', email: 'duplicate@test.com', password: 'password123' };
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'duplicate@test.com' });

      await expect(authService.register(dto)).rejects.toThrow(ConflictException);
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('3. Login com sucesso (deve retornar o access_token)', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      const user = { id: '1', email: 'test@test.com', password: 'hashedPassword' };
      
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(dto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, 'hashedPassword');
      expect(mockJwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
      expect(result).toEqual({ access_token: 'test_token' });
    });

    it('4. Erro no login por senha inválida (deve lançar UnauthorizedException)', async () => {
      const dto = { email: 'test@test.com', password: 'wrongpassword' };
      const user = { id: '1', email: 'test@test.com', password: 'hashedPassword' };
      
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
