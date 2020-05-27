import {Comment} from '../../common/entity/types'
import logger from '../../services/logger'

class Mapper {
    private pool: any

    constructor(pool: any) {
        this.pool = pool
    }

    // Вставить комментарий
    insert = (c: Comment) => {
        const sql = `INSERT INTO comment (text, id_user, id_video)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [c.text, c.idUser, c.idVideo]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить комментарий по id
    selectById = (id: number): Promise<Comment> => {
        const sql = `SELECT c.id,
                            c.text,
                            c.id_video   AS idVideo,
                            c.id_user    AS idUser,
                            p.nickname   AS authorNickname,
                            p.url_avatar AS authorUrlAvatar
                     FROM comment c
                              JOIN user p on p.id = c.id_user
                     WHERE c.id = ?`
        return this.pool.query(sql, [id]).then(([r]: [Comment[]]) => {
            if (!r.length) {
                return Promise.reject('Не найдено')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Выборка комментариев по id видео
    selectByIdVideo = (id: number): Promise<Comment[]> => {
        const sql = `SELECT c.id,
                            c.text,
                            c.id_video   AS idVideo,
                            c.id_user    AS idUser,
                            p.nickname   AS authorNickname,
                            p.url_avatar AS authorUrlAvatar
                     FROM comment c
                              JOIN user p on p.id = c.id_user
                     WHERE c.id_video = ?
                     ORDER BY c.id DESC`
        return this.pool.query(sql, [id]).then(([r]: [Comment[]]) => {
            return Promise.resolve(r)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удаление комментария по id
    remove = (id: number) => {
        const sql = `DELETE
                     FROM comment
                     WHERE id = ?`
        return this.pool.query(sql, [id]).then(() => {
            return Promise.resolve()
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }
}

export default Mapper
