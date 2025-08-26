import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      include: { 
        roles: { include: { role: true } },
        programs: { include: { program: true } },
      },
    });
  }

  async createUser(
    username: string,
    password: string,
    roleNames: string[] = ['USER'],
    programNames: string[] = []
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const roles = await this.prisma.role.findMany({
      where: { name: { in: roleNames } },
    });

    const programs = await this.prisma.program.findMany({
      where: { name: { in: programNames } },
    });

    return this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        roles: { create: roles.map((r) => ({ roleId: r.id })) },
        programs: { create: programs.map((p) => ({ programId: p.id })) },
      },
      include: {
        roles: { include: { role: true } },
        programs: { include: { program: true } },
      },
    });
  }
  // Get all users
async getAllUsers() {
  return this.prisma.user.findMany({
    include: { roles: { include: { role: true } }, programs: { include: { program: true } }, facilities: { include: { facility: true } } },
  });
}

// Get user by ID
async getUserById(id: number) {
  return this.prisma.user.findUnique({
    where: { id },
    include: { roles: { include: { role: true } }, programs: { include: { program: true } } },
  });
}

// Assign roles to user
async assignRolesToUser(userId: number, roleNames: string[]) {
  // Delete existing roles
  await this.prisma.userRole.deleteMany({ where: { userId } });
  const roles = await this.prisma.role.findMany({ where: { name: { in: roleNames } } });
  const data = roles.map(r => ({ userId, roleId: r.id }));
  return this.prisma.userRole.createMany({ data });
}

// Assign programs to user
async assignProgramsToUser(userId: number, programNames: string[]) {
  await this.prisma.userProgram.deleteMany({ where: { userId } });
  const programs = await this.prisma.program.findMany({ where: { name: { in: programNames } } });
  const data = programs.map(p => ({ userId, programId: p.id }));
  return this.prisma.userProgram.createMany({ data });
}

// Delete user
async deleteUser(id: number) {
  return this.prisma.user.delete({ where: { id } });
}

// Update user password
async updateUser(id: number, password: string) {
  const hashed = await bcrypt.hash(password, 10);
  return this.prisma.user.update({ where: { id }, data: { password: hashed } });
}

async assignFacilitiesToUser(userId: number, facilityIds: number[]) {
  // Clear existing assignments (optional, depends on business logic)
  await this.prisma.userFacility.deleteMany({
    where: { userId },
  });

  // Create new assignments
  const assignments = facilityIds.map((facilityId) => ({
    userId,
    facilityId,
  }));

  await this.prisma.userFacility.createMany({
    data: assignments,
    skipDuplicates: true,
  });

  return this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      facilities: {
        include: { facility: true },
      },
    },
  });
}


}
