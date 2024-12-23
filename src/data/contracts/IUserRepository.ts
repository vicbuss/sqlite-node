export type User = {
    name: string
}

export interface IUserRepository {
    getUserbyName : (name: string) => Promise<User | null>
    insertUser: (user: User) => Promise<void>
}