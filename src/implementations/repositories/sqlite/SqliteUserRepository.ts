import sqlite3 from 'sqlite3'
import { Database, open } from "sqlite";
import { IUserRepository, User } from "../../../data/contracts/IUserRepository";

export class SqliteUserRepository implements IUserRepository {
    private db: Database | null = null
    private static instance: SqliteUserRepository | null = null
    private idleTimeout: NodeJS.Timeout | null = null
    private timeoutDuration: number = 100000
    private fileName: string

    private constructor(db: Database, fileName: string) {
        this.db = db
        this.fileName = fileName

        db.exec('CREATE TABLE IF NOT EXISTS users (name TEXT)')
    }

    static async getInstance(filename: string): Promise<SqliteUserRepository> {
        if(!this.instance) {
            const db = await open({
                filename: filename,
                driver: sqlite3.Database
            })

            return new SqliteUserRepository(db, filename)

        } else {
            return this.instance
        }
        
    }

    async insertUser (user: User): Promise<void> {
        try {
            await this.ensureConnectionIsOpen()
            if(!this.db) throw Error('Database is closed')
            await this.db.run(
                'INSERT INTO users (name) VALUES(?)', 
                [user.name],
                (err: Error | null) => {
                    if(err !== null) throw err
                }
            )
            this.resetIdleTimeout()
        } catch (e) {
            throw e
        }
    }

    async getUserbyName (name: string): Promise<User | null> {
        try {
            await this.ensureConnectionIsOpen()
            if(!this.db) throw Error('Database is closed')
            const user = await this.db.get<User>(
                'SELECT * FROM users WHERE name = ?', 
                [name],
                (err: Error | null) => {
                    if (err !== null) {
                        throw err
                    }
                }
            )
            this.resetIdleTimeout()
            return user || null
        } catch (e) {
            throw e
        }

    }

    async close (): Promise<void> {
        try {
            if(this.db) {
                console.log('Connection closed')
                await this.db.close()
                this.db = null
            }
        } catch (e) {
            throw e
        }
    }

    private resetIdleTimeout(): void {
        if (this.idleTimeout) {
            clearTimeout(this.idleTimeout)
        }

        this.idleTimeout = setTimeout(() => {
            this.close()
        }, this.timeoutDuration)
    }

    private async ensureConnectionIsOpen(): Promise<void> {
        if(!this.db) {
            this.db = await open({
                filename: this.fileName,
                driver: sqlite3.Database
            })
            this.resetIdleTimeout()
        }
    }
}