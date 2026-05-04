import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should render the landing page', () => {
      const response = { send: jest.fn() };

      appController.getLanding(response as any);

      expect(response.send).toHaveBeenCalledWith(
        expect.stringContaining('Welcome to MIUM API'),
      );
    });
  });
});
