import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Facility } from '@prisma/client';
import { CreateFacilityDto, UpdateFacilityDto } from './dto/facility.dto';

@Injectable()
export class FacilityService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateFacilityDto): Promise<Facility> {
    return this.prisma.facility.create({
      data,
    });
  }

  async findAll(): Promise<Facility[]> {
    return this.prisma.facility.findMany();
  }

  async findOne(id: number): Promise<Facility | null> {
    return this.prisma.facility.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateFacilityDto): Promise<Facility> {
    return this.prisma.facility.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Facility> {
    return this.prisma.facility.delete({ where: { id } });
  }
}
