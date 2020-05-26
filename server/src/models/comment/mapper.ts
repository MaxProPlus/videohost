import {Comment} from '../../common/entity/types'

class Mapper {
    private pool: any

    constructor(pool: any) {
        this.pool = pool
    }

    // Вставить комментарий
    insert(comment: Comment) {
        const sql = `
            INSERT INTO comment (text, id_user, id_video)
            VALUES (?, ?, ?)`
        return this.pool.query(sql, [comment.text, comment.idUser, comment.idVideo]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, () => {
            return Promise.reject('Ошибка запроса')
        })
    }

    // Получить комментарий по id
    selectById(idComment: number): Promise<Comment> {
        const sql = `
            SELECT c.id         AS id,
                   c.text       AS text,
                   c.id_video   AS idVideo,
                   c.id_user    AS idUser,
                   p.nickname   AS authorNickname,
                   p.url_avatar AS authorUrlAvatar
            FROM comment c
                     JOIN user p on p.id = c.id_user
            WHERE c.id = ?`
        return this.pool.query(sql, [idComment]).then(([r]: [Comment[]]) => {
            if (!r.length) {
                return Promise.reject('Не найдено')
            }
            return Promise.resolve(r[0])
        }, () => {
            return Promise.reject('Ошибка запроса')
        })
    }

    // Выборка комментариев по id видео
    selectByIdVideo(idVideo: number): Promise<Comment[]> {
        const sql = `
            SELECT c.id         AS id,
                   c.text       AS text,
                   c.id_video   AS idVideo,
                   c.id_user    AS idUser,
                   p.nickname   AS authorNickname,
                   p.url_avatar AS authorUrlAvatar
            FROM comment c
                     JOIN user p on p.id = c.id_user
            WHERE c.id_video = ?
            ORDER BY c.id DESC`
        return this.pool.query(sql, [idVideo]).then(([r]: [Comment[]]) => {
            return Promise.resolve(r)
        }, () => {
            return Promise.reject('Ошибка запроса')
        })
    }

    // Удаление комментария по id
    remove(idComment: number) {
        const sql = `
            DELETE
            FROM comment
            WHERE id = ?`
        return this.pool.query(sql, [idComment]).then(([r]: any) => {
            return Promise.resolve()
        }, () => {
            return Promise.reject('Ошибка запроса')
        })
    }
}

export default Mapper
