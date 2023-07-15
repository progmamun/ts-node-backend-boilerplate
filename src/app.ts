import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { RateLimitRequestHandler, rateLimit } from 'express-rate-limit';
import compression from 'compression';

import globalErrorHandler from './app/middleware/globalErrorHandler';
import hpp from 'hpp';
// import routes from './app/routes';

const app: Application = express();

app.enable('trust proxy');

app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter: RateLimitRequestHandler = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
/* app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
); */
app.use(hpp());

app.use(compression());

// routes
// app.use('/api/v1', routes);

// root route
app.get('/', (req: Request, res: Response) => {
  res.send('Ts Server is running..');
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
