import Mapper from './mapper'
import Uploader from '../../services/uploader'
import {Estimate, Video, VideoUpload} from '../../common/entity/types'
import {defaultAvatar, defaultPreview} from '../../entity/types'

class VideoModel {
    private mapper: Mapper
    private uploader = new Uploader()

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    // Загрузить видео
    create = async (v: VideoUpload) => {
        const infoVideo = this.uploader.getInfo(v.fileVideo, 'video')
        v.urlVideo = infoVideo.url

        let infoPreview
        if (!!v.filePreview) {
            infoPreview = this.uploader.getInfo(v.filePreview, 'preview')
            v.urlPreview = infoPreview.url
        }

        const id = await this.mapper.insert(v)
        v.fileVideo.mv(infoVideo.path)
        if (!!infoPreview) {
            v.filePreview.mv(infoPreview.path)
        }
        return id
    }

    // Получить видео по id
    get = async (id: number, idUser?: number) => {
        if (idUser) {
            const estimate = new Estimate()
            estimate.idVideo = id
            estimate.idUser = idUser
            this.setEstimate(estimate)
        }
        const v: Video = await this.mapper.selectById(id, idUser)
        if (!v.user.urlAvatar) {
            v.user.urlAvatar = defaultAvatar
        }
        if (!v.urlPreview) {
            v.urlPreview = defaultPreview
        }
        return v
    }

    // Пост обработка видео
    afterGet = (vs: Video[]) => {
        vs.forEach(v => {
            if (!v.user.urlAvatar) v.user.urlAvatar = defaultAvatar
            if (!v.urlPreview) v.urlPreview = defaultPreview
        })
    }

    // Получить популярные видео
    getRating = async () => {
        const videos = await this.mapper.selectRating()
        this.afterGet(videos)
        return videos
    }

    // Получить по лайкам видео
    getLiking = async () => {
        const videos = await this.mapper.selectLiking()
        this.afterGet(videos)
        return videos
    }

    // Получить последние загруженные видео
    getRecently = async () => {
        const videos = await this.mapper.selectRecently()
        this.afterGet(videos)
        return videos
    }

    // Получить видео пользователя по id
    getVideoByUserId = async (id: number) => {
        const videos = await this.mapper.selectVideosByUserId(id)
        this.afterGet(videos)
        return videos
    }

    // Поиск видео по запросу
    search = (query: string) => {
        return this.mapper.selectVideosByQuery(query)
    }

    // Редактирование видео
    update = async (video: VideoUpload) => {
        let infoPreview
        if (video.filePreview) {
            infoPreview = this.uploader.getInfo(video.filePreview, 'preview')
            video.urlPreview = infoPreview.url
        }
        const videoOld = await this.mapper.selectById(video.id)
        if (videoOld.idUser !== video.idUser) {
            return Promise.reject('Нет прав')
        }
        if (video.filePreview && infoPreview) {
            if (!!videoOld.urlPreview) {
                this.uploader.remove(videoOld.urlPreview)
            }
            video.filePreview.mv(infoPreview.path)
        } else {
            video.urlPreview = videoOld.urlPreview
        }
        return this.mapper.update(video)
    }

    // Удаление видео
    remove = async (video: Video) => {
        const videoOld = await this.mapper.selectById(video.id)
        if (videoOld.idUser !== video.idUser) {
            return Promise.reject('Нет прав')
        }
        const id = await this.mapper.remove(video.id)
        if (!!videoOld.urlPreview) {
            this.uploader.remove(videoOld.urlPreview)
        }
        this.uploader.remove(videoOld.urlVideo)
        return id
    }

    // Установка просмотров, лайкой, дизлайков
    setEstimate = async (e: Estimate) => {
        await this.get(e.idVideo)
        let starred = true
        try {
            await this.mapper.selectStar(e.idVideo, e.idUser)
        } catch (err) {
            if (err.message !== 'NOT_FOUND') {
                return Promise.reject(err)
            }
            starred = false
        }
        if (starred) {
            if (e.star !== 0) {
                await this.mapper.updateEstimate(e)
            }
        } else {
            await this.mapper.createEstimate(e)
        }
        return this.mapper.selectEstimate(e.idVideo, e.idUser)
    }

}

export default VideoModel