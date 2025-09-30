import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, pass: string) {
    const roles = user.roles.map((r) => r.role.name);
    const programs = user.programs.map((p) => p.program.name);

    const payload = { username: user.username, sub: user.id, roles, programs };
    const key = process.env[`KEY`];
    if (!key) return 'Encryption key not set in environment variables';
    const password = CryptoJS.AES.encrypt(pass, key).toString();
    const username = CryptoJS.AES.encrypt(user.username, key).toString();

    // const bytes = CryptoJS.AES.decrypt(password, key);
    // const test = bytes.toString(CryptoJS.enc.Utf8);
    return {
      access_token: this.jwtService.sign(payload),
      username: username,
      password,
    };
  }
}
