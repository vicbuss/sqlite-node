import { SqliteUserRepository } from '../implementations/repositories/sqlite/SqliteUserRepository'

async function execute() {
    const userRepository = await SqliteUserRepository.getInstance(':memory:')
    try {
    
        await userRepository.insertUser({name: 'Bob'})

        const user = await userRepository.getUserbyName('Bob')
        console.log(user)

    } catch (e) {
        console.log(e)
    } 
}

execute()
