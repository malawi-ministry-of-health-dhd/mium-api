import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

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
    const roles    = user.roles.map((r) => r.role.name);
    const programs = user.programs.map((p) => p.program.name);

    const payload = { username: user.username, sub: user.id, roles, programs };
    const key = process.env['KEY'];
    if (!key) return 'Encryption key not set in environment variables';

    const memis_auth = CryptoJS.AES.encrypt(
      JSON.stringify({ username: user.username, password: pass }),
      key,
    ).toString();

    // Attempt MEMIS login if MEMIS_LOGIN_URL is configured
    const memis_login_valid = await this.tryMemisLogin(user.username, pass);

    return {
      access_token: this.jwtService.sign(payload),
      memis_auth,
      memis_login_valid,
    };
  }

  private async tryMemisLogin(username: string, password: string): Promise<boolean> {
    const baseUrl = process.env['MEMIS_BASE_URL'];

    if (!baseUrl) {
      this.logger.debug('MEMIS_BASE_URL not set — skipping MEMIS login check');
      return false;
    }

    // MEMIS is a DHIS2 instance — validate credentials via GET /me with Basic Auth
    const endpoint = `${baseUrl}/me?fields=id,username`;
    this.logger.log(`MEMIS › attempting login for "${username}" → ${endpoint}`);

    const t0 = Date.now();
    try {
      const res = await axios.get(endpoint, {
        auth: { username, password },
        timeout: 8000,
        validateStatus: (status) => status < 500,
      });

      const elapsed = Date.now() - t0;
      const valid   = res.status === 200 && !!res.data?.username;

      if (valid) {
        this.logger.log(
          `MEMIS › login valid for "${username}" — DHIS2 user: ${res.data.displayName ?? res.data.username} (HTTP ${res.status} · ${elapsed}ms)`,
        );
      } else {
        this.logger.warn(
          `MEMIS › login invalid for "${username}" (HTTP ${res.status} · ${elapsed}ms)`,
        );
      }

      return valid;
    } catch (err: any) {
      const elapsed = Date.now() - t0;
      const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.includes('timeout');
      this.logger.error(
        `MEMIS › login request failed for "${username}" (${elapsed}ms) — ${isTimeout ? 'timeout' : err?.message}`,
      );
      return false;
    }
  }
}
