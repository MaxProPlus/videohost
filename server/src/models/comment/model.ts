import Mapper from './mapper'
import MapperVideo from '../video/mapper'
import {Comment} from '../../common/entity/types'
import {defaultAvatar} from '../../entity/types'

class CommentModel {
    private mapper: Mapper
    private mapperVideo: MapperVideo

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
        this.mapperVideo = new MapperVideo(connection.getPoolPromise())
    }

    // Создать комментарий
    create = async (c: Comment) => {
        await this.mapperVideo.selectById(c.idVideo)
        return this.mapper.insert(c)
    }

    // Получить все комментарии по id видео
    getByIdVideo = async (idVideo: number): Promise<Comment[]> => {
        const comments = await this.mapper.selectByIdVideo(idVideo)
        comments.forEach(c => {
            if (!c.authorUrlAvatar) {
                c.authorUrlAvatar = defaultAvatar
            }
        })
        return comments
    }

    // Удалить комментарий
    remove = async (comment: Comment) => {
        const commentOld = await this.mapper.selectById(comment.id)
        if (comment.idUser !== commentOld.idUser) {
            return Promise.reject('Нет прав')
        }
        return this.mapper.remove(comment.id)
    }
}

export default CommentModel