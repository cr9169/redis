import express from 'express';
import cors from 'cors';
import winston from 'winston';
import { Redis } from 'ioredis';

const app = express();
app.use(cors());
app.use(express.json());

const redisClient = new Redis({
  host: 'localhost', // Redis server host
  port: 6379, // Redis server port
  password: '', // Leave empty if no password set
  db: 0, // Default database index
});
