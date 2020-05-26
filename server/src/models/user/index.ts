import Mapper from './mapper'
import Hash from '../../services/hash'
import VideoModel from '../video'
import Uploader from '../../services/uploader'
import MyConnection from '../../services/mysql'
import {User, Video} from '../../common/entity/types'

class UserModel {
    private mapper: Mapper
    private videoModel: VideoModel
    private hash = new Hash()
    private uploader = new Uploader()

    constructor(connection: MyConnection) {
        this.mapper = new Mapper(connection.getPoolPromise())
        this.videoModel = new VideoModel(connection)
    }

    // Регистрация
    async signup(user: User) {
        user.password = this.hash.getHash(user.password)
        try {
            const id = await this.mapper.signup(user)
            return this.mapper.saveToken({
                id,
                token: this.hash.getToken(),
            })
        } catch (err) {
            return Promise.reject(err)
        }
    }

    // Авторизация
    async login(user: User) {
        user.password = this.hash.getHash(user.password)
        let id
        try {
            id = await this.mapper.login(user)
        } catch (err) {
            return Promise.reject(err)
        }
        return this.mapper.saveToken({
            id,
            token: this.hash.getToken(),
        })
    }

    // Получить контекст
    async getContext(data: string) {
        let context = new User()
        try {
            context = await this.mapper.getContext(data)
        } catch (err) {
            return Promise.reject(err)
        }
        if (context.urlAvatar === null) {
            context.urlAvatar = '/avatar/standart.png'
        }
        return Promise.resolve(context)
    }

    // Проверка авторизации по токену
    checkAuthByToken(data: string) {
        return this.mapper.getIdByToken(data)
    }

    // Проверка авторизации по токену и паролю
    checkAuthByTokenWithPassword(token: string, pass: string) {
        pass = this.hash.getHash(pass)
        return this.mapper.getIdByTokenWithPassword(token, pass)
    }

    // Выход
    logout(token: string) {
        return this.mapper.logout(token)
    }

    // Получить пользователя по id
    async getById(id: number) {
        const promises = []
        promises.push(this.mapper.getUserById(id))
        promises.push(this.videoModel.getVideoByUserId(id))
        return Promise.all(promises).then((res: any) => {
            const [user, videos]: [User, Video] = res
            if (user.urlAvatar === null) {
                user.urlAvatar = '/avatar/standart.png'
            }
            return {
                user,
                videos,
            }
        })
    }

    // Получить информацию о пользователе
    async getGeneral(idProfile: number) {
        return this.mapper.getUserInfoById(idProfile)
    }

    // Редактирование основной информации
    updateGeneral(user: any) {
        return this.mapper.updateGeneral(user)
    }

    // Редактирование настроек безопасноти
    updateSecure(user: any) {
        return this.mapper.updateSecure(user)
    }

    // Редактирование пароля
    updatePassword(user: any) {
        user.password = this.hash.getHash(user.password)
        return this.mapper.updatePassword(user)
    }

    // Загрузка аватарки
    async updateAvatar(id: number, avatar: any) {
        try {
            const oldAvatarPath = (await this.mapper.getUserById(id)).urlAvatar
            if (oldAvatarPath) {
                this.uploader.remove(oldAvatarPath)
            }
        } catch (err) {
            return Promise.reject(err)
        }
        const infoAvatar = this.uploader.getInfo(avatar, 'avatar')
        avatar.mv(infoAvatar.path)
        return this.mapper.updateAvatar(id, infoAvatar.url)
    }
}

export default UserModel