import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { MemisUnavailableError } from './memis-client.service';
import { MEMIS_AVAILABLE_HEADER, MemisController } from './memis.controller';
import { MemisUserService } from './memis.users.service';

describe('MemisController', () => {
  let controller: MemisController;
  let res: Response;
  const memisUserService = {
    getUserGroups: jest.fn(),
    getUserIdsFromUserGroups: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    res = { setHeader: jest.fn() } as unknown as Response;

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

    await expect(controller.getUserGroups(res)).resolves.toEqual(userGroups);
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it('should return MEMIS user IDs from user groups', async () => {
    memisUserService.getUserIdsFromUserGroups.mockResolvedValue(['user-id']);

    await expect(controller.getUserIdsFromUserGroups(res)).resolves.toEqual({
      userIds: ['user-id'],
    });
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it('should flag an empty list instead of failing when MEMIS is unreachable', async () => {
    memisUserService.getUserGroups.mockRejectedValue(
      new MemisUnavailableError('ECONNREFUSED'),
    );

    await expect(controller.getUserGroups(res)).resolves.toEqual([]);
    expect(res.setHeader).toHaveBeenCalledWith(MEMIS_AVAILABLE_HEADER, 'false');
  });

  it('should flag empty user IDs instead of failing when MEMIS is unreachable', async () => {
    memisUserService.getUserIdsFromUserGroups.mockRejectedValue(
      new MemisUnavailableError('ETIMEDOUT'),
    );

    await expect(controller.getUserIdsFromUserGroups(res)).resolves.toEqual({
      userIds: [],
    });
    expect(res.setHeader).toHaveBeenCalledWith(MEMIS_AVAILABLE_HEADER, 'false');
  });

  it('should propagate errors that are not MEMIS outages', async () => {
    memisUserService.getUserGroups.mockRejectedValue(new Error('boom'));

    await expect(controller.getUserGroups(res)).rejects.toThrow('boom');
    expect(res.setHeader).not.toHaveBeenCalled();
  });
});
