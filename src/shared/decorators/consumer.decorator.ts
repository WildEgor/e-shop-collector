import {
  Controller,
  UseFilters,
  UsePipes,
  ValidationPipe,
  applyDecorators,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ValidationError } from 'class-validator';
import { ExceptionFilter } from '../filters/exception.filter';

export const ConsumerController = () =>
  applyDecorators(
    Controller(),
    UseFilters(ExceptionFilter),
    UsePipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory: (validationErrors: ValidationError[] = []) =>
          new RpcException(validationErrors),
      }),
    ),
  );
