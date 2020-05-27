import Mapper from './mapper'
import Hash from '../../services/hash'
import VideoModel from '../video/model'
import Uploader from '../../services/uploader'
import {User} from '../../common/entity/types'

class UserModel {
    private mapper: Mapper
    private videoModel: VideoModel
    private hash = new Hash()
    private uploader = new Uploader()

    constructor(connection: any) {
        this.mapper = new Mapper(connection.getPoolPromise())
        this.videoModel = new VideoModel(connection)
    }

    // Регистрация
    signup = async (user: User) => {
        user.password = this.hash.getHash(user.password)
        const id = await this.mapper.signup(user)
        return this.mapper.saveToken({
            id,
            token: this.hash.getToken(),
        })
    }

    // Авторизация
    login = async (user: User) => {
        user.password = this.hash.getHash(user.password)
        const id = await this.mapper.login(user)
        return this.mapper.saveToken({
            id,
            token: this.hash.getToken(),
        })
    }

    // Получить контекст
    getContext = async (data: string) => {
        const context: User = await this.mapper.getContext(data)
        if (context.urlAvatar === null) {
            context.urlAvatar = '/avatar/standart.png'
        }
        return Promise.resolve(context)
    }

    // Проверка авторизации по токену
    checkAuthByToken = (data: string) => {
        return this.mapper.getIdByToken(data)
    }

    // Проверка авторизации по токену и паролю
    checkAuthByTokenWithPassword = (token: string, pass: string) => {
        pass = this.hash.getHash(pass)
        return this.mapper.getIdByTokenWithPassword(token, pass)
    }

    // Выход
    logout = (token: string) => {
        return this.mapper.logout(token)
    }

    // Получить пользователя по id
    getById = (id: number) => {
        const promises = []
        promises.push(this.mapper.getUserById(id))
        promises.push(this.videoModel.getVideoByUserId(id))
        return Promise.all(promises).then((value: any) => {
            const [user, videos] = value
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
    getGeneral = async (idProfile: number) => {
        return this.mapper.getUserInfoById(idProfile)
    }

    // Редактирование основной информации
    updateGeneral = async (user: any) => {
        await this.mapper.updateGeneral(user)
        return this.mapper.getUserInfoById(user.id)
    }

    // Редактирование настроек безопасноти
    updateSecure = async (user: User) => {
        return this.mapper.updateSecure(user)
    }

    // Редактирование пароля
    updatePassword = (user: any) => {
        user.password = this.hash.getHash(user.password)
        return this.mapper.updatePassword(user)
    }

    // Загрузка аватарки
    updateAvatar = async (id: number, avatar: any) => {
        const oldAvatarPath = (await this.mapper.getUserById(id)).urlAvatar
        if (oldAvatarPath) {
            this.uploader.remove(oldAvatarPath)
        }
        const infoAvatar = this.uploader.getInfo(avatar, 'avatar')
        avatar.mv(infoAvatar.path)
        return this.mapper.updateAvatar(id, infoAvatar.url)
    }
}

export default UserModel