import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import winston from 'winston';
import { Redis } from 'ioredis';
import IUser from './user';

const port = 3000;
const app = express();
app.use(cors());
app.use(express.json());

const redisClient = new Redis({
  host: 'localhost', // Redis server host
  port: 6379, // Redis server port
  password: '', // Leave empty if no password set
  db: 0, // Default database index
});

const setUserDetailsWithId = async (id: string, userDetails: IUser) => {
  const status = await redisClient.set(
    `user:${id}`,
    JSON.stringify(userDetails),
  );
  return status;
};

// using set func
const setUserDetailsWithIdAndEx1 = async (
  id: string,
  userDetails: IUser,
  exTimeInSeconds: number,
) => {
  const status = await redisClient.set(
    `user:${id}`,
    JSON.stringify(userDetails),
    'EX',
    exTimeInSeconds,
  );
  return status;
};

// using setex func
const setUserDetailsWithIdAndEx2 = async (
  id: string,
  userDetails: IUser,
  exTimeInSeconds: number,
) => {
  const status = await redisClient.setex(
    `user:${id}`,
    exTimeInSeconds,
    JSON.stringify(userDetails),
  );
  return status;
};

const getUserById = async (id: string) => {
  const user = await redisClient.get(`user:${id}`);
  return user;
};

const getUserByIdAndModifyExTime = async (
  id: string,
  exTimeInSeconds: number,
) => {
  const user = await redisClient.getex(`user:${id}`, 'EX', exTimeInSeconds);
  return user;
};

app.get(
  '/users/:id',
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await getUserById(req.params.id);
    res.json(user ?? 'Cant find user :(');
  },
);
app.patch(
  '/users/:id/ttl/:ttl',
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await getUserByIdAndModifyExTime(
      req.params.id,
      Number(req.params.ttl),
    );
    res.json(user ?? 'Cant find user :(');
  },
);

//
app.post(
  '/users/:id',
  async (req: Request, res: Response, _next: NextFunction) => {
    const status = await setUserDetailsWithId(req.params.id, req.body);
    res.json(status ?? 'Data Posting Failed failed :(');
  },
);

app.post(
  '/users/:id/ttl/:ttl',
  async (req: Request, res: Response, _next: NextFunction) => {
    const status = await setUserDetailsWithIdAndEx1(
      req.params.id,
      req.body,
      Number(req.params.ttl),
    );
    res.json(status ?? 'Data Posting Failed failed :(');
  },
);

app.listen(port, () => console.log(`Started server on port ${port}`));
