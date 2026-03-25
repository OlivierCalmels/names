declare module "sql.js" {
  export interface InitSqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer) => {
      close(): void;
      prepare(sql: string): unknown;
      run(sql: string): void;
    };
  }

  export default function initSqlJs(
    config?: {
      locateFile?: (file: string) => string;
      wasmBinary?: ArrayBuffer;
    },
  ): Promise<InitSqlJsStatic>;
}
