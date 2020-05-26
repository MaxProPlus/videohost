import {Request, Response} from 'express'
import UserModel from '../models/user'
import Auth from '../services/auth'
import MyConnection from '../services/mysql'
import {User, UserPassword} from '../common/entity/types'
import Validator from '../common/validator'
import {UploadedFile} from 'express-fileupload'

class UserController {
    validator = new Validator()
    private userModel: UserModel
    private auth: Auth

    constructor(connection: MyConnection) {
        this.userModel = new UserModel(connection)
        this.auth = new Auth(connection)
    }

    // Регистрация
    signup(req: Request, res: Response) {
        const user: User = req.body
        const {ok, err} = this.validator.validateSignup(user)
        if (!ok) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.userModel.signup(user).then((r: string) => {
            res.cookie('token', r)
            return res.json({
                status: 'OK',
            })
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка регистрации, возможно логин или email уже занят',
            })
        })
    }

    // Авторизация
    login(req: Request, res: Response) {
        const user: User = req.body
        return this.userModel.login(user).then((r: any) => {
            res.cookie('token', r)
            return res.json({
                status: 'OK',
            })
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Неверный логин или пароль',
            })
        })
    }

    // Выход
    logout(req: Request, res: Response) {
        res.clearCookie('token')
        this.userModel.logout(req.cookies.token)
        return res.json({
            status: 'OK',
        })
    }

    // Получить пользователя по id
    getUser(req: Request, res: Response) {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.userModel.getById(id).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r]
            })
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка',
            })
        })
    }

    // Получить информацию о пользователе
    async getGeneral(req: Request, res: Response) {
        let id
        try {
            id = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка токена',
            })
        }
        return this.userModel.getGeneral(id).then((r: any) => {
            return res.json(r)
        }, () => {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: 'Ошибка получение данных',
            })
        })
    }

    // Получить контекст
    getContext(req: Request, res: Response) {
        return this.userModel.getContext(req.cookies.token).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r],
            })
        }, () => {
            res.clearCookie('token')
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка токена',
            })
        })
    }

    // Редактирование основной информации
    async updateGeneral(req: Request, res: Response) {
        const user: User = req.body
        try {
            user.id = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка токена',
            })
        }
        const {ok, err} = this.validator.validateGeneral(user)
        if (!ok) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.userModel.updateGeneral(user).then(() => {
            return res.json({
                status: 'OK',
            })
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка',
            })
        })
    }

    // Редактирование настроек безопасноти
    async updateSecure(req: Request, res: Response) {
        const user: User = req.body
        const {ok, err} = this.validator.validateSecure(user)
        if (!ok) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        try {
            user.id = await this.auth.checkAuthWithPassword(req.cookies.token, user.password)
        } catch (e) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка токена',
            })
        }
        return this.userModel.updateSecure(user).then((r: any) => {
            return res.json({
                status: 'OK',
            })
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка',
            })
        })
    }

    // Редактирование пароля
    async updatePassword(req: Request, res: Response) {
        const user: UserPassword = req.body
        try {
            user.id = await this.auth.checkAuthWithPassword(req.cookies.token, user.passwordAccept)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка токена',
            })
        }
        const {ok, err} = this.validator.validatePassword(user)
        if (!ok) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.userModel.updatePassword(user).then((r: any) => {
            return res.json({
                status: 'OK',
            })
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка',
            })
        })
    }

    // Загрузка аватарки
    async updateAvatar(req: Request, res: Response) {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: 'Не прикреплен файл',
            })
        }
        const {ok, err} = this.validator.validateImg(req.files.avatar as UploadedFile)
        if (!ok) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        let id
        try {
            id = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка токена',
            })
        }
        return this.userModel.updateAvatar(id, req.files.avatar).then((r: any) => {
            return res.json({
                status: 'OK',
            })
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка',
            })
        })
    }
}

export default UserController
