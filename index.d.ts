import { Knex as KnexJS } from "knex"

export declare type Knex = KnexJS

type DatabaseGetter = {
  getConnectionInfo: (
    database?: string,
    user?: string
  ) => {
    host: string
    user: string
    port: number
    password: string
    database: string
    ssl: boolean
  }
  (params?: {
    seed?: boolean
    migrate?: boolean
    testMode?: boolean
    user?: string
  }): Promise<Knex>
}

type GetDatabaseGetter = {
  default: DatabaseGetter
  (params?: {
    migrationFile?: string
    seedFile?: string
    migrationSQL?: string
    seedSQL?: string
    pool?: number
    defaults?: any
  }): DatabaseGetter
}

export declare const getDatabaseGetter: GetDatabaseGetter

export default getDatabaseGetter
