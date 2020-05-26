import Mapper from './mapper'
import MapperVideo from '../video/mapper'
import {Comment} from '../../common/entity/types'
import MyConnection from '../../services/mysql'
import {defaultAvatar} from '../../entity/types'

class CommentModel {
    private mapper: Mapper
    private mapperVideo: MapperVideo

    constructor(connection: MyConnection) {
        this.mapper = new Mapper(connection.getPoolPromise())
        this.mapperVideo = new MapperVideo(connection.getPoolPromise())
    }

    // Создать комментарий
    async create(comment: Comment) {
        try {
            await this.mapperVideo.selectById(comment.idVideo)
        } catch (err) {
            return Promise.reject(err)
        }
        return this.mapper.insert(comment)
    }

    // Получить все комментарии по id видео
    async getByIdVideo(idVideo: number): Promise<Comment[]> {
        try {
            const comments = await this.mapper.selectByIdVideo(idVideo)
            comments.forEach(c => {
                if (!c.authorUrlAvatar) {
                    c.authorUrlAvatar = defaultAvatar
                }
            })
            return comments
        } catch (err) {
            return err
        }
    }

    // Удалить комментарий
    async remove(comment: Comment) {
        try {
            const commentOld = await this.mapper.selectById(comment.id)
            if (comment.idUser !== commentOld.idUser) {
                return Promise.reject('Нет прав')
            }
        } catch (err) {
            return Promise.reject(err)
        }
        return this.mapper.remove(comment.id)
    }
}

export default CommentModel