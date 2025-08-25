import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  // Create a new program
  async createProgram(name: string) {
    return this.prisma.program.create({ data: { name } });
  }

  // Get all programs
  async getAllPrograms() {
    return this.prisma.program.findMany();
  }

  // Get a program by ID
  async getProgramById(id: number) {
    return this.prisma.program.findUnique({ where: { id } });
  }

  // Update program
  async updateProgram(id: number, name: string) {
    return this.prisma.program.update({
      where: { id },
      data: { name },
    });
  }

  // Delete program
  async deleteProgram(id: number) {
    return this.prisma.program.delete({ where: { id } });
  }

  // Assign programs to a user
  async assignProgramsToUser(userId: number, programIds: number[]) {
    // Remove existing programs
    await this.prisma.userProgram.deleteMany({ where: { userId } });

    // Assign new programs
    const data = programIds.map((programId) => ({ userId, programId }));
    return this.prisma.userProgram.createMany({ data });
  }

  // Get user's programs
  async getUserPrograms(userId: number) {
    return this.prisma.userProgram.findMany({
      where: { userId },
      include: { program: true },
    });
  }
}
