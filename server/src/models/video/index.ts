import Mapper from './mapper'
import Uploader from '../../services/uploader'
import {Estimate, Video, VideoUpload} from '../../common/entity/types'
import {defaultAvatar, defaultPreview} from '../../entity/types'
import MyConnection from '../../services/mysql'

class VideoModel {
    private connection: MyConnection

    private mapper: Mapper
    private uploader = new Uploader()

    constructor(connection: MyConnection) {
        this.connection = connection
        this.mapper = new Mapper(connection.getPoolPromise())
    }

    // Загрузить видео
    async create(video: VideoUpload) {
        const infoVideo = this.uploader.getInfo(video.fileVideo, 'video')
        video.urlVideo = infoVideo.url

        let infoPreview
        if (!!video.filePreview) {
            infoPreview = this.uploader.getInfo(video.filePreview, 'preview')
            video.urlPreview = infoPreview.url
        }

        try {
            const id = await this.mapper.insert(video)
            video.fileVideo.mv(infoVideo.path)
            if (!!infoPreview) {
                video.filePreview.mv(infoPreview.path)
            }
            return id
        } catch (err) {
            return Promise.reject(err)
        }
    }

    // Получить видео по id
    async get(id: number, idUser?: number) {
        if (idUser) {
            const estimate = new Estimate()
            estimate.idVideo = id
            estimate.idUser = idUser
            estimate.star = 0
            this.setEstimate(estimate)
        }
        try {
            const video = await this.mapper.selectById(id, idUser)
            if (!video.user.urlAvatar) {
                video.user.urlAvatar = defaultAvatar
            }
            if (!video.urlPreview) {
                video.urlPreview = defaultPreview
            }
            return video
        } catch (err) {
            return Promise.reject(err)
        }
    }

    // Пост обработка видео
    afterGet(vs: Video[]) {
        vs.forEach(v => {
            if (!v.user.urlAvatar) v.user.urlAvatar = defaultAvatar
            if (!v.urlPreview) v.urlPreview = defaultPreview
        })
    }

    // Получить популярные видео
    async getRating() {
        try {
            const videos = await this.mapper.selectRating()
            this.afterGet(videos)
            return videos
        } catch (err) {
            return err
        }
    }

    // Получить по лайкам видео
    async getLiking() {
        try {
            const videos = await this.mapper.selectLiking()
            this.afterGet(videos)
            return videos
        } catch (err) {
            return err
        }
    }

    // Получить последние загруженные видео
    async getRecently() {
        try {
            const videos = await this.mapper.selectRecently()
            this.afterGet(videos)
            return videos
        } catch (err) {
            return err
        }
    }

    // Получить видео пользователя по id
    async getVideoByUserId(id: number) {
        try {
            const videos = await this.mapper.selectVideosByUserId(id)
            this.afterGet(videos)
            return videos
        } catch (err) {
            return err
        }
    }

    // Поиск видео по запросу
    search = (query: string) => {
        return this.mapper.selectVideosByQuery(query)
    }

    // Редактирование видео
    async update(video: VideoUpload) {
        let infoPreview
        if (video.filePreview) {
            infoPreview = this.uploader.getInfo(video.filePreview, 'preview')
            video.urlPreview = infoPreview.url
        }

        try {
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
        } catch (err) {
            return Promise.reject(err)
        }
    }

    // Удаление видео
    async remove(video: Video) {
        try {
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
        } catch (err) {
            return Promise.reject(err)
        }
    }

    // Установка просмотров, лайкой, дизлайков
    async setEstimate(estimate: Estimate) {
        try {
            await this.get(estimate.idVideo)
            let starred = true
            try {
                await this.mapper.selectStar(estimate.idVideo, estimate.idUser)
            } catch (err) {
                if (err.message !== 'NOT_FOUND') {
                    return Promise.reject(err)
                }
                starred = false
            }
            if (starred) {
                if (estimate.star !== 0) {
                    await this.mapper.updateEstimate(estimate)
                }
            } else {
                await this.mapper.createEstimate(estimate)
            }
        } catch (err) {
            return Promise.reject(err)
        }
        return this.mapper.selectEstimate(estimate.idVideo, estimate.idUser)
    }

}

export default VideoModel