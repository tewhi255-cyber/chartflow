declare module 'express-validator' {
  import { Request } from 'express';

  export interface ValidationError {
    param: string;
    msg: string;
    location?: string;
    value?: any;
    nestedErrors?: any[];
  }

  export interface Result {
    isEmpty(): boolean;
    array(): ValidationError[];
    mapped(): Record<string, ValidationError>;
  }

  export function validationResult(req: Request): Result;

  export function body(field: string): ValidationChain;
  export function param(field: string): ValidationChain;
  export function query(field: string): ValidationChain;

  export interface Validator {
    isLength(options: { min?: number; max?: number }): ValidationChain;
    isAlphanumeric(): ValidationChain;
    isEmail(): ValidationChain;
    normalizeEmail(): ValidationChain;
    notEmpty(): ValidationChain;
    withMessage(message: string): ValidationChain;
    isIn(values: any[]): ValidationChain;
    optional(): ValidationChain;
    isString(): ValidationChain;
    isInt(): ValidationChain;
    isBoolean(): ValidationChain;
    toLowerCase(): ValidationChain;
    trim(): ValidationChain;
    escape(): ValidationChain;
  }

  export interface ValidationChain extends Validator {
    (req: Request, res: any, next: any): void;
    run(req: Request): Promise<Result>;
  }
}
