import { Test, TestingModule } from '@nestjs/testing';
import { ProgramsService } from './programs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProgramsService', () => {
  let service: ProgramsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgramsService, { provide: PrismaService, useValue: {} }],
    }).compile();

    service = module.get<ProgramsService>(ProgramsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
