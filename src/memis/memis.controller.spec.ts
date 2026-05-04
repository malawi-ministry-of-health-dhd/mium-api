import { Test, TestingModule } from '@nestjs/testing';
import { MemisController } from './memis.controller';
import { MemisUserService } from './memis.users.service';

describe('MemisController', () => {
  let controller: MemisController;
  const memisUserService = {
    getUserGroups: jest.fn(),
    getUserIdsFromUserGroups: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemisController],
      providers: [{ provide: MemisUserService, useValue: memisUserService }],
    }).compile();

    controller = module.get<MemisController>(MemisController);
  });

  it('should return MEMIS user groups', async () => {
    const userGroups = [
      {
        id: 'group-id',
        displayName: 'Admins',
        users: [{ id: 'user-id', username: 'admin' }],
      },
    ];
    memisUserService.getUserGroups.mockResolvedValue(userGroups);

    await expect(controller.getUserGroups()).resolves.toEqual(userGroups);
  });

  it('should return MEMIS user IDs from user groups', async () => {
    memisUserService.getUserIdsFromUserGroups.mockResolvedValue(['user-id']);

    await expect(controller.getUserIdsFromUserGroups()).resolves.toEqual({
      userIds: ['user-id'],
    });
  });
});
