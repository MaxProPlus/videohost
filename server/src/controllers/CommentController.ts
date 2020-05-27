import {Request, Response} from 'express'
import CommentModel from '../models/comment/model'
import Auth from '../services/auth'
import {Comment} from '../common/entity/types'
import connection from '../services/mysql'
import Validator from '../common/validator'

class CommentController {
    private commentModel: CommentModel
    private auth: Auth
    private validator = new Validator()

    constructor() {
        this.commentModel = new CommentModel(connection)
        this.auth = new Auth(connection)
    }

    // Создать комментарий
    create = async (req: Request, res: Response) => {
        const c: Comment = req.body
        try {
            c.idUser = await this.auth.checkAuth(req.cookies.token)
            const {ok, err} = this.validator.validateComment(c)
            if (!ok) {
                return res.json({
                    status: 'INVALID_DATA',
                    errorMessage: err,
                })
            }
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Неверный токен',
            })
        }
        return this.commentModel.create(c).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r],
            })
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Получить все комментарии по id видео
    getByIdVideo = async (req: Request, res: Response) => {
        const idVideo = parseInt(req.params.id_video)
        if (isNaN(idVideo)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        return this.commentModel.getByIdVideo(idVideo).then((r: Comment[]) => {
            return res.json({
                status: 'OK',
                results: r,
            })
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }

    // Удалить комментарий
    remove = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id_comment)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const comment = new Comment()
        comment.id = id
        try {
            comment.idUser = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Неверный токен',
            })
        }
        return this.commentModel.remove(comment).then((r: any) => {
            return res.json({
                status: 'OK',
                results: r,
            })
        }, (err) => {
            return res.json({
                status: 'ERROR',
                errorMessage: err,
            })
        })
    }
}

export default CommentController
