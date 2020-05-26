import {Request, Response} from 'express'
import CommentModel from '../models/comment/model'
import Auth from '../services/auth'
import {Comment} from '../common/entity/types'
import MyConnection from '../services/mysql'
import Validator from '../common/validator'

class CommentController {
    private commentModel: CommentModel
    private auth: Auth
    private validator = new Validator()

    constructor(connection: MyConnection) {
        this.commentModel = new CommentModel(connection)
        this.auth = new Auth(connection)
    }

    // Создать комментарий
    async create(req: Request, res: Response) {
        const comment: Comment = req.body
        try {
            comment.idUser = await this.auth.checkAuth(req.cookies.token)
            const {ok, err} = this.validator.validateComment(comment)
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
        return this.commentModel.create(comment).then((r: any) => {
            return res.json({
                status: 'OK',
                results: [r],
            })
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка',
            })
        })
    }

    // Получить все комментарии по id видео
    async getByIdVideo(req: Request, res: Response) {
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
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка',
            })
        })
    }

    // Удалить комментарий
    async remove(req: Request, res: Response) {
        const idComment = parseInt(req.params.id_comment)
        if (isNaN(idComment)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const comment = new Comment()
        comment.id = idComment
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
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка',
            })
        })
    }
}

export default CommentController
