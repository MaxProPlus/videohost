import {Request, Response} from 'express'
import VideoModel from '../models/video'
import Auth from '../services/auth'
import Validator from '../common/validator'
import {Estimate, Video, VideoUpload} from '../common/entity/types'
import {UploadedFile} from 'express-fileupload'
import MyConnection from '../services/mysql'

class VideoController {
    private videoModel: VideoModel
    private auth: Auth
    private validator = new Validator()

    constructor(connection: MyConnection) {
        this.videoModel = new VideoModel(connection)
        this.auth = new Auth(connection)
    }

    // Загрузка видео
    async create(req: Request, res: Response) {
        if (!req.files || Object.keys(req.files).length < 1 || !req.files.file_video) {
            return res.json({
                status: 'INVALID_FILE',
                errorMessage: 'Не прикрепленно видео',
            })
        }
        const video: VideoUpload = req.body
        video.fileVideo = req.files.file_video as UploadedFile
        video.filePreview = req.files.file_preview as UploadedFile
        let status = true, errorMessage = ''

        let check = this.validator.validateVideoInfo(video)
        status = check.ok && status
        errorMessage += check.err

        check = this.validator.validateVideoFile(video.fileVideo)
        status = check.ok && status
        errorMessage += check.err

        if (video.filePreview) {
            check = this.validator.validateImg(video.filePreview)
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
            video.idUser = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Неверный токен',
            })
        }
        return this.videoModel.create(video).then((r: any) => {
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

    // Получить видео по id
    async get(req: Request, res: Response) {
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
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка',
            })
        })
    }

    // Получить популярные видео
    getRating(req: Request, res: Response) {
        return this.videoModel.getRating().then((r: any) => {
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

    // Получить по лайкам видео
    getLiking(req: Request, res: Response) {
        return this.videoModel.getLiking().then((r: any) => {
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

    // Получить последние загруженные видео
    getRecently(req: Request, res: Response) {
        return this.videoModel.getRecently().then((r: any) => {
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

    // Поиск видео по запросу
    search(req: Request, res: Response) {
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
        }, () => {
            return res.json({
                status: 'ERROR',
                errorMessage: 'Ошибка',
            })
        })

    }

    // Редактирование видео
    async update(req: Request, res: Response) {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        const video: VideoUpload = req.body
        video.id = id
        delete video.filePreview

        let status = true, errorMessage = '', check
        if (req.files) {
            check = this.validator.validateImg(req.files.filePreview as UploadedFile)
            status = status && check.ok
            errorMessage += check.err
            video.filePreview = req.files.filePreview as UploadedFile
        }

        check = this.validator.validateVideoInfo(video)
        status = status && check.ok
        errorMessage += check.err

        if (!status) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage,
            })
        }
        try {
            video.idUser = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка токена',
            })
        }
        return this.videoModel.update(video).then((r: any) => {
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

    // Удаление видео
    async remove(req: Request, res: Response) {
        const video = new Video()
        video.id = parseInt(req.params.id)
        if (isNaN(video.id)) {
            return res.json({
                status: 'INVALID_PARSE',
                errorMessage: 'Ошибка парсинга id',
            })
        }
        try {
            video.idUser = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Неверный токен',
            })
        }
        return this.videoModel.remove(video).then((r: any) => {
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

    // Установка просмотров, лайкой, дизлайков
    async setEstimate(req: Request, res: Response) {
        const estimate: Estimate = req.body
        if (estimate && (estimate.star < 0 || estimate.star > 2)) {
            return res.json({
                status: 'INVALID_DATA',
                errorMessage: 'Ошибка данных',
            })
        }
        try {
            estimate.idUser = await this.auth.checkAuth(req.cookies.token)
        } catch (err) {
            return res.json({
                status: 'INVALID_AUTH',
                errorMessage: 'Ошибка токена',
            })
        }
        return this.videoModel.setEstimate(estimate).then((r: any) => {
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
}

export default VideoController
