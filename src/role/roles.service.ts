import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { MemisClientService } from 'src/memis/memis-client.service';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    // private memisClient: MemisClientService,
  ) {}

  async createRole(name: string) {
    return this.prisma.role.create({
      data: { name },
    });
  }
  // async createRolesFromMemis() {
  //   const userRoles = await this.memisClient.getUserRoles();
  //   for (const role of userRoles) {
  //     this.prisma.role.upsert({
  //       where: { name: role.name },
  //       update: {},
  //       create: { name: role.displayName },
  //     });
  //   }
  //   return this.prisma.role.findMany();
  // }
  async getAllRoles() {
    // await this.createRolesFromMemis();
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
