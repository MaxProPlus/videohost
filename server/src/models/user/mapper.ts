import {User} from '../../common/entity/types'
import {Token} from '../../entity/types'
import logger from '../../services/logger'

class Mapper {
    private pool: any

    constructor(pool: any) {
        this.pool = pool
    }

    // Регистрация
    signup = (user: User) => {
        const sql = `INSERT INTO user (login, sha_pass_hash, email, nickname)
                     VALUES (?, ?, ?, ?)`
        return this.pool.query(sql, [user.login, user.password, user.email, user.login]).then(([r]: any) => {
            return Promise.resolve(r.insertId)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Авторизация
    login = (user: User) => {
        const sql = `SELECT u.id
                     FROM user u
                     WHERE u.login = ?
                       AND u.sha_pass_hash = ?`
        return this.pool.query(sql, [user.login, user.password]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Неверный логин или пароль')
            }
            return Promise.resolve(r[0].id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Сохранить токен
    saveToken = (data: Token) => {
        const sql = 'INSERT INTO token(id_user, text) VALUES(?, ?)'
        return this.pool.query(sql, [data.id, data.token]).then(() => {
            return Promise.resolve(data.token)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить контекст
    getContext = (token: string) => {
        const sql = `SELECT t.id_user    AS id,
                            u.nickname   AS nickname,
                            u.url_avatar AS urlAvatar
                     FROM token t
                              JOIN user u ON u.id = t.id_user
                     WHERE t.text = ?`
        return this.pool.query(sql, [token]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Неверный токен')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Проверка авторизации по токену
    getIdByToken = (data: string) => {
        const sql = `SELECT id_user AS id
                     FROM token
                     WHERE text = ?`
        return this.pool.query(sql, [data]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Ошибка токена')
            }
            return Promise.resolve(r[0].id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Проверка авторизации по токену и паролю
    getIdByTokenWithPassword = (token: string, pass: string) => {
        const sql = `SELECT t.id_user AS id
                     FROM token t
                              JOIN user u ON u.id = t.id_user
                     WHERE t.text = ?
                       AND u.sha_pass_hash = ?`
        return this.pool.query(sql, [token, pass]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Ошибка токена или пароля')
            }
            return Promise.resolve(r[0].id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Выход
    logout = (token: string) => {
        const sql = `DELETE
                     FROM token
                     WHERE text = ?`
        return this.pool.query(sql, [token]).then(() => {
            return Promise.resolve()
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить пользователя по id
    getUserById = (id: number) => {
        const sql = `SELECT u.id,
                            u.nickname,
                            u.url_avatar AS urlAvatar
                     FROM user u
                     WHERE u.id = ?`
        return this.pool.query(sql, [id]).then(([r]: [User[]]) => {
            if (!r.length) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Получить информацию о пользователе
    getUserInfoById = (id: number) => {
        const sql = `SELECT u.firstname,
                            u.secondname,
                            u.nickname,
                            u.url_avatar as urlAvatar,
                            u.login,
                            u.email
                     FROM user u
                     WHERE u.id = ?`
        return this.pool.query(sql, [id]).then(([r]: any) => {
            if (!r.length) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(r[0])
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Редактирование основной информации
    updateGeneral = (user: User) => {
        const sql = `UPDATE user p
                     SET p.firstname  = ?,
                         p.secondname = ?,
                         p.nickname   = ?
                     WHERE p.id = ? `
        return this.pool.query(sql, [user.firstname, user.secondname, user.nickname, user.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(user.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Редактирование настроек безопасноти
    updateSecure = (user: any) => {
        const sql = `UPDATE user u
                     SET u.email = ?,
                         u.login=?
                     WHERE u.id = ?`
        return this.pool.query(sql, [user.email, user.login, user.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(user.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Редактирование пароля
    updatePassword = (user: User) => {
        const sql = `UPDATE user u
                     SET u.sha_pass_hash = ?
                     WHERE u.id = ?`
        return this.pool.query(sql, [user.password, user.id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(user.id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })
    }

    // Загрузка аватарки
    updateAvatar = (id: number, avatarUrl: string) => {
        const sql = `UPDATE user p
                     SET p.url_avatar = ?
                     WHERE p.id = ?`
        return this.pool.query(sql, [avatarUrl, id]).then(([r]: any) => {
            if (!r.affectedRows) {
                return Promise.reject('Не найден пользователь')
            }
            return Promise.resolve(id)
        }, (err: any) => {
            logger.error('Ошибка запроса к бд: ', err)
            return Promise.reject('Ошибка запроса к бд')
        })

    }
}

export default Mapper
