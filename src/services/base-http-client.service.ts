import { Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as https from 'https';

export abstract class BaseHttpClientService {
  protected readonly logger = new Logger(BaseHttpClientService.name);
  protected readonly axiosInstance: AxiosInstance;
  protected readonly config: {
    baseUrl: string;
    auth: { username: string; password: string };
    timeout: number;
  };

  constructor(envPrefix: string) {
    this.config = {
      baseUrl: process.env[`${envPrefix}_BASE_URL`] || '',
      auth: {
        username: process.env[`${envPrefix}_USERNAME`] || '',
        password: process.env[`${envPrefix}_PASSWORD`] || '',
      },
      timeout: parseInt(process.env[`${envPrefix}_TIMEOUT`] || '30000'),
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      auth: this.config.auth,
      timeout: this.config.timeout,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }
}
