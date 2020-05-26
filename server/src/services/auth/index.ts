import UserModel from '../../models/user'
import MyConnection from '../mysql'

class Auth {
    private userModel: UserModel

    constructor(connection: MyConnection) {
        this.userModel = new UserModel(connection)
    }

    // Проверка авторизации по токену
    checkAuth = (data: string) => {
        return this.userModel.checkAuthByToken(data)
    }

    // Проверка авторизации по токену и паролю
    checkAuthWithPassword = (token: string, pass: string) => {
        return this.userModel.checkAuthByTokenWithPassword(token, pass)
    }
}

export default Auth
