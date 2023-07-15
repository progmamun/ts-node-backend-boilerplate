import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
// import { rateLimit } from 'express-rate-limit';
import compression from 'compression';

import globalErrorHandler from './app/middleware/globalErrorHandler';
// import routes from './app/routes';

const app: Application = express();

app.enable('trust proxy');

app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!',
// });

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

app.use(compression());

// routes
// app.use('/api/v1', routes, limiter);

// root route
app.get('/', (req: Request, res: Response) => {
  res.send('RUB Book server is running..');
});

//global error handler
app.use(globalErrorHandler);

//handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
  next();
});

export default app;
