declare module 'mysql2/promise' {
  import { EventEmitter } from 'events';

  export interface RowDataPacket {
    constructor: { name: 'RowDataPacket' };
    [column: string]: any;
  }

  export interface OkPacket {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus?: number;
    warningCount?: number;
    message?: string;
    protocol41?: boolean;
    changedRows?: number;
  }

  export interface ResultSetHeader {
    affectedRows: number;
    insertId: number;
    fieldCount: number;
    serverStatus?: number;
    warningCount?: number;
    message?: string;
    protocol41?: boolean;
    changedRows?: number;
  }

  export interface FieldPacket {
    catalog: string;
    db: string;
    table: string;
    orgTable: string;
    name: string;
    orgName: string;
    charsetNr: number;
    length: number;
    type: number;
    flags: number;
    decimals: number;
    default?: any;
    zeroFill: boolean;
    protocol41: boolean;
  }

  export interface PoolConnection {
    query(sql: string, values?: any[]): Promise<any>;
    execute(sql: string, values?: any[]): Promise<[any[], FieldPacket[]]>;
    release(): void;
  }

  export interface Pool {
    execute(sql: string, values?: any[]): Promise<[any[], FieldPacket[]]>;
    query(sql: string, values?: any[]): Promise<[any[], FieldPacket[]]>;
    getConnection(): Promise<PoolConnection>;
    end(): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): this;
    pool: any;
    config: any;
  }

  export function createPool(config: any): Pool;
}
