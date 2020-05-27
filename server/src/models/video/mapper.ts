import {Estimate, User, Video} from '../../common/entity/types'
import {VideoSample} from './types'
import logger from '../../services/logger'

class Mapper {
    // Начало sql запроса видео
    sqlSelect = `SELECT v.id,
                        v.title,
                        v.description,
                        v.url_video   AS urlVideo,
                        v.url_preview AS urlPreview,
                        v.rating,
                        v.like,
                        v.dislike,
                        v.id_user     AS idUser,
                        p.nickname    AS userNickname,
                        p.url_avatar  AS userUrlAvatar
                 FROM video v
                          JOIN user p on p.id = v.id_user`
    private pool: any

    constructor(pool: any) {
        this.pool = pool
    }

    // Вставка видео в бд
    insert = (video: Video) => {
        const sql = `INSERT INTO video (title, description, url_video, url_preview, id_user)
                     VALUES (?, ?, ?, ?, ?);
        `
        return this.pool.query(sql, [video.title, video.description, video.urlVideo, video.urlPreview, video.idUser]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Выборка видео по id
    selectById = (id: number, idUser?: number): Promise<Video> => {
        const sql = `SELECT v.id,
                            v.title,
                            v.description,
                            v.url_video   AS urlVideo,
                            v.url_preview AS urlPreview,
                            v.rating,
                            v.like,
                            v.dislike,
                            v.id_user     AS idUser,
                            u.nickname    AS userNickname,
                            u.url_avatar  AS userUrlAvatar,
                            e.star
                     FROM video v
                              JOIN user u on u.id = v.id_user
                              LEFT JOIN estimate e ON e.id_user = ? AND e.id_video = v.id
                     WHERE v.id = ?`
        return this.pool.query(sql, [idUser, id]).then(([r]: [VideoSample[]]) => {
            if (!r.length) {
                return Promise.reject('Не найдено видео')
            }
            const v = {
                ...r[0],
                user: {
                    urlAvatar: r[0].userUrlAvatar,
                    nickname: r[0].userNickname,
                    id: r[0].idUser,
                } as User
            } as Video
            return Promise.resolve(v)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Пост обработка видео
    afterSelect = (p: Promise<any>): Promise<Video[]> => {
        return p.then(([r]: [VideoSample[]]) => {
            const videos: Video[] = []
            r.forEach(vs => {
                const v = {
                    ...vs,
                    user: {
                        urlAvatar: vs.userUrlAvatar,
                        nickname: vs.userNickname,
                        id: vs.idUser,
                    } as User
                } as Video
                videos.push(v)
            })
            return Promise.resolve(videos)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Выборка по просмотрам
    selectRating = () => {
        const sql = `${this.sqlSelect}
                     ORDER BY v.rating DESC
                     LIMIT 6`
        return this.afterSelect(this.pool.query(sql))
    }

    // Выборка по лайкам
    selectLiking = () => {
        const sql = `${this.sqlSelect}
                     ORDER BY v.like DESC
                     LIMIT 6`
        return this.afterSelect(this.pool.query(sql))
    }

    // Выборка по последним загруженным
    selectRecently = () => {
        const sql = `${this.sqlSelect}
                     ORDER BY v.id DESC
                     LIMIT 6`
        return this.afterSelect(this.pool.query(sql))
    }

    // Выборка по id пользователя
    selectVideosByUserId = (id: number) => {
        const sql = `${this.sqlSelect}
                     WHERE v.id_user = ?`
        return this.afterSelect(this.pool.query(sql, [id]))
    }

    // Запрос на статистику видео
    selectStar = (idVideo: number, idUser: number) => {
        const sql = `SELECT r.id,
                            r.star,
                            r.id_user  AS idUser,
                            r.id_video AS idVideo
                     FROM estimate r
                     WHERE r.id_video = ?
                       AND r.id_user = ?`
        return this.pool.query(sql, [idVideo, idUser]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject(new Error('NOT_FOUND'))
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Выборка по запросу
    selectVideosByQuery = (query: string) => {
        const sql = `${this.sqlSelect}
                     WHERE v.title LIKE ?`
        query = '%' + query + '%'
        return this.afterSelect(this.pool.query(sql, [query]))
    }

    // Запрос на оценку видео по id пользователя
    selectEstimate = (idVideo: number, idUser: number) => {
        const sql = `SELECT v.rating,
                            v.like,
                            v.dislike,
                            e.star
                     FROM video v
                              LEFT JOIN estimate e ON e.id_user = ? AND e.id_video = v.id
                     WHERE v.id = ?`
        return this.pool.query(sql, [idUser, idVideo]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Не найдено видео')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Обновление видео
    update = (v: Video) => {
        const sql = `UPDATE video
                     SET title       = ?,
                         description = ?,
                         url_preview = ?
                     WHERE id = ?`
        return this.pool.query(sql, [v.title, v.description, v.urlPreview, v.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найдено видео')
            }
            return Promise.resolve(v.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Удаление видео
    remove = (id: number) => {
        const sql = `DELETE
                     FROM video
                     WHERE id = ?`
        return this.pool.query(sql, [id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найдено видео')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })

    }

    // Создание оценки видео
    createEstimate = (e: Estimate) => {
        const sql = `INSERT INTO estimate(id_video, id_user, star)
                     VALUES (?, ?, ?)`
        return this.pool.query(sql, [e.idVideo, e.idUser, e.star]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Обновление оценки видео
    updateEstimate = (e: Estimate) => {
        const sql = `UPDATE estimate
                     SET star = ?
                     WHERE id_video = ?
                       AND id_user = ?`
        return this.pool.query(sql, [e.star, e.idVideo, e.idUser]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найдена оценка')
            }
            return Promise.resolve()
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })

    }
}

export default Mapper
