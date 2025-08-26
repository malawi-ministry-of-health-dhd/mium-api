import { Controller, Get, Res } from '@nestjs/common';
import express from 'express';

@Controller()
export class AppController {
  @Get()
  getLanding(@Res() res: express.Response) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>MIUM API</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
              body {
                  font-family: 'Inter', sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background: #006401;
                  color: #fff;
                  text-align: center;
              }

              .container {
                  max-width: 600px;
                  padding: 40px;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 16px;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
              }

              img.logo {
                  width: 120px;
                  margin-bottom: 20px;
              }

              h1 {
                  font-size: 2.5rem;
                  margin-bottom: 1rem;
              }

              p {
                  font-size: 1.2rem;
                  margin-bottom: 2rem;
              }

              .button {
                  display: inline-block;
                  padding: 12px 24px;
                  font-size: 1rem;
                  font-weight: 700;
                  color: #006401;
                  background: #fff;
                  border-radius: 8px;
                  text-decoration: none;
                  transition: all 0.3s ease;
              }

              .button:hover {
                  background: #e0f4e0;
              }
          </style>
      </head>
      <body>
          <div class="container">
             
              <h1>Welcome to MIUM API</h1>
              <p>Mahis Integrated User Management</p>
              <a class="button" href="api/docs" target="_blank">View API Documentation</a>
          </div>
      </body>
      </html>
    `;
    res.send(html);
  }
}
