import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(name: string) {
    return this.prisma.role.create({
      data: { name },
    });
  }

  async getAllRoles() {
    return this.prisma.role.findMany();
  }

  async getRoleById(id: number) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  async updateRole(id: number, name: string) {
    return this.prisma.role.update({
      where: { id },
      data: { name },
    });
  }

  async deleteRole(id: number) {
    return this.prisma.role.delete({ where: { id } });
  }
}
