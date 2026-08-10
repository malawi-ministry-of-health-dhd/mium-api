import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MemisUserService } from '../memis/memis.users.service';
import { RolesService } from '../role/roles.service';
import { ProgramsService } from '../programs/programs.service';
import { PROTECTED_USERNAME } from '../common/protected-accounts';

describe('UsersService', () => {
  let service: UsersService;
  const prisma = {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    userRole: { deleteMany: jest.fn(), createMany: jest.fn() },
    userProgram: { deleteMany: jest.fn() },
    userFacility: { deleteMany: jest.fn() },
    role: { findMany: jest.fn().mockResolvedValue([{ id: 9, name: 'USER' }]) },
  };
  const memisUserService = {
    createMemisUser: jest.fn(),
    updateMemisUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: MemisUserService, useValue: memisUserService },
        { provide: RolesService, useValue: {} },
        { provide: ProgramsService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('protecting the MIUM service account', () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: PROTECTED_USERNAME,
        profile: null,
      });
    });

    it('refuses to create a user with the protected username', async () => {
      await expect(
        service.createUser(PROTECTED_USERNAME, 'whatever', ['ADMIN']),
      ).rejects.toThrow(ForbiddenException);
      expect(memisUserService.createMemisUser).not.toHaveBeenCalled();
    });

    it('refuses to create it regardless of casing or padding', async () => {
      await expect(
        service.createUser('  AdMiN  ', 'whatever', ['ADMIN']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('refuses to update it', async () => {
      await expect(
        service.updateUser(1, { password: 'newpassword' }),
      ).rejects.toThrow(ForbiddenException);
      expect(memisUserService.updateMemisUser).not.toHaveBeenCalled();
    });

    it('refuses to delete it', async () => {
      await expect(service.deleteUser(1)).rejects.toThrow(ForbiddenException);
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('refuses to reassign its roles', async () => {
      await expect(service.assignRolesToUser(1, ['USER'])).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.userRole.deleteMany).not.toHaveBeenCalled();
    });

    it('refuses to reassign its programs', async () => {
      await expect(
        service.assignProgramsToUser(1, ['Program A']),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.userProgram.deleteMany).not.toHaveBeenCalled();
    });

    it('refuses to reassign its facilities', async () => {
      await expect(service.assignFacilitiesToUser(1, [2])).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.userFacility.deleteMany).not.toHaveBeenCalled();
    });
  });

  it('lets ordinary accounts through the guard', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 2, username: 'clerk' });

    await expect(service.assignRolesToUser(2, ['USER'])).resolves.not.toThrow();
    expect(prisma.userRole.deleteMany).toHaveBeenCalledWith({
      where: { userId: 2 },
    });
  });
});
