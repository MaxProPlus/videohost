import {Request, Response} from 'express'
import VideoModel from '../models/video/model'
import Auth from '../services/auth'
import Validator from '../common/validator'
import {Estimate, Video, VideoUpload} from '../common/entity/types'
import {UploadedFile} from 'express-fileupload'
import connection from '../services/mysql'

class VideoController {
    private videoModel: VideoModel
    private auth: Auth
    private validator = new Validator()

    constructor() {
        this.videoModel = new VideoModel(connection)
        this.auth = new Auth(connection)
    }

    // Загрузка видео
    create = async (req: Request, res: Response) => {
        if (!req.files || Object.keys(req.files).length < 1 || !req.files.file_video) {
            return res.json({
                status: 'INVALID_FILE',
                errorMessage: 'Не прикрепленно видео',
            })
        }
        const v: VideoUpload = req.body
        v.fileVideo = req.files.file_video as UploadedFile
        v.filePreview = req.files.file_preview as UploadedFile
        let status = true, errorMessage = ''

        let check = this.validator.validateVideoInfo(v)
        status = check.ok && status
        errorMessage += check.err

        check = this.validator.validateVideoFile(v.fileVideo)
        status = check.ok && status
        errorMessage += check.err

        if (v.filePreview) {
            check = this.validator.validateImg(v.filePreview)
            status = check.ok && status
            errorMessage += check.err
        }
        if (!status) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage,
            })
        }
        try {
            v.idUser = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.videoModel.create(v).then((r: any) => {
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

    // Получить видео по id
    get = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }

        let idUser = 0
        try {
            idUser = await this.auth.checkAuth(req.cookies.token)
        } catch {
        }
        return this.videoModel.get(id, idUser).then((r: any) => {
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

    // Получить популярные видео
    getRating = (req: Request, res: Response) => {
        return this.videoModel.getRating().then((r: any) => {
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

    // Получить по лайкам видео
    getLiking = (req: Request, res: Response) => {
        return this.videoModel.getLiking().then((r: any) => {
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

    // Получить последние загруженные видео
    getRecently = (req: Request, res: Response) => {
        return this.videoModel.getRecently().then((r: any) => {
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

    // Поиск видео по запросу
    search = (req: Request, res: Response) => {
        const query = req.query.query as string
        if (!query) {
            return res.json({
                status: 'INVALID_PARAM',
                errorMessage: 'Пустой запрос',
            })
        }
        return this.videoModel.search(query).then((r: any) => {
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

    // Редактирование видео
    update = async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const v: VideoUpload = req.body
        v.id = id
        delete v.filePreview

        let status = true, errorMessage = '', check
        if (req.files) {
            check = this.validator.validateImg(req.files.filePreview as UploadedFile)
            status = status && check.ok
            errorMessage += check.err
            v.filePreview = req.files.filePreview as UploadedFile
        }

        check = this.validator.validateVideoInfo(v)
        status = status && check.ok
        errorMessage += check.err

        if (!status) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage,
            })
        }
        try {
            v.idUser = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.videoModel.update(v).then((r: any) => {
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

    // Удаление видео
    remove = async (req: Request, res: Response) => {
        const v = new Video()
        v.id = parseInt(req.params.id)
        if (isNaN(v.id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        try {
            v.idUser = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.videoModel.remove(v).then((r: any) => {
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


    // Установка просмотров, лайкой, дизлайков
    setEstimate = async (req: Request, res: Response) => {
        const e: Estimate = req.body
        if (e && (e.star < 0 || e.star > 2)) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: 'Ошибка входных параметров',
            })
        }
        try {
            e.idUser = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка авторизации',
            })
        }
        return this.videoModel.setEstimate(e).then((r: any) => {
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
}

export default VideoController
