import {Request, Response} from 'express'
import UserModel from '../models/user/model'
import Auth from '../services/auth'
import connection from '../services/mysql'
import {User, UserPassword} from '../common/entity/types'
import Validator from '../common/validator'
import {UploadedFile} from 'express-fileupload'

class UserController {
    validator = new Validator()
    private userModel: UserModel
    private auth: Auth

    constructor() {
        this.userModel = new UserModel(connection)
        this.auth = new Auth(connection)
    }

    // Регистрация
    signup = (req: Request, res: Response) => {
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
    login = (req: Request, res: Response) => {
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
    logout = (req: Request, res: Response) => {
        res.clearCookie('token')
        this.userModel.logout(req.cookies.token)
        return res.json({
            status: 'OK',
        })
    }

    // Получить пользователя по id
    getUser = (req: Request, res: Response) => {
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
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить информацию о пользователе
    getGeneral = async (req: Request, res: Response) => {
        let id
        try {
            id = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.userModel.getGeneral(id).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r]
            })
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить контекст
    getContext = (req: Request, res: Response) => {
        return this.userModel.getContext(req.cookies.token).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r],
            })
        }, () => {
            res.clearCookie('token')
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        })
    }

    // Редактирование основной информации
    updateGeneral = async (req: Request, res: Response) => {
        const user: User = req.body
        try {
            user.id = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        const {ok, err} = this.validator.validateGeneral(user)
        if (!ok) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.userModel.updateGeneral(user).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r]
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Редактирование настроек безопасноти
    updateSecure = async (req: Request, res: Response) => {
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
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.userModel.updateSecure(user).then(() => {
            return res.json({
                status: 'OK',
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Редактирование пароля
    updatePassword = async (req: Request, res: Response) => {
        const user: UserPassword = req.body
        try {
            user.id = await this.auth.checkAuthWithPassword(req.cookies.token, user.passwordAccept)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        const {ok, err} = this.validator.validatePassword(user)
        if (!ok) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: err,
            })
        }
        return this.userModel.updatePassword(user).then(() => {
            return res.json({
                status: 'OK',
            })
        }, (err: any) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Загрузка аватарки
    updateAvatar = async (req: Request, res: Response) => {
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
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.userModel.updateAvatar(id, req.files.avatar).then(() => {
            return res.json({
                status: 'OK',
            })
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }
}

export default UserController
