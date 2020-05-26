import {Comment, User, UserPassword, Video} from '../entity/types'
import {UploadedFile} from 'express-fileupload'

class Validator {
    // Удалить лишние пробелы
    trim(s: string) {
        return s.trim().replace(/\s{2,}/g, ' ')
    }

    // Валидация настроек безопасности
    validateSecure(user: User) {
        let ok = true
        let err = ''
        user.login = user.login.toLowerCase()
        if (!/^[a-z0-9_-]{3,16}$/.test(user.login)) {
            ok = false
            err += 'Длина логина должна быть от 3 до 16 знаков и должен состоять из цифр, строчных букв, символов - и _.\n'
        }
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i.test(user.email)) {
            ok = false
            err += 'Не валидный email.\n'
        }
        return {ok, err}
    }

    // Валидация регистрации
    validateSignup(user: User) {
        let {ok, err} = this.validateSecure(user)
        if (!/^[A-Za-z0-9_-]{3,16}$/.test(user.password)) {
            ok = false
            err += 'Длина пароля должна быть от 3 до 16 знаков и должен состоять из цифр, прописных и строчных букв, символов - и _.\n'
        }
        if (user.password !== user.passwordRepeat) {
            ok = false
            err += 'Пароли не совпадают.\n'
        }
        return {ok, err}
    }

    // Валидация пароля
    validatePassword(user: UserPassword) {
        let ok = true
        let err = ''
        if (!/^[A-Za-z0-9_-]{3,16}$/.test(user.password)) {
            ok = false
            err += 'Длина пароля должна быть от 3 до 16 знаков и должен состоять из цифр, прописных и строчных букв, символов - и _.\n'
        }
        if (user.password !== user.passwordRepeat) {
            ok = false
            err += 'Пароли не совпадают.\n'
        }
        return {ok, err}
    }

    // Валидация основной информации
    validateGeneral(user: User) {
        let ok = true
        let err = ''
        user.nickname = this.trim(user.nickname)
        if (user.nickname === '') {
            ok = false
            err += 'Никнейм не может быть пустым.\n'
        }
        return {ok, err}
    }

    // Валидация изображений
    validateImg(file: UploadedFile | File): any {
        let ok = true
        let err = ''
        const type = 'mimetype' in file ? file.mimetype : file.type
        switch (type) {
            case 'image/jpeg':
            case 'image/png':
            case 'image/webp':
                break
            default:
                ok = false
                err += 'Не поддерживаемый тип изображения. Поддерживаемые форматы: jpeg, png, webp.\n'
        }
        return {ok, err}
    }

    // Валидация файла видео
    validateVideoFile = (file: UploadedFile | File) => {
        let ok = true
        let err = ''
        const type = 'mimetype' in file ? file.mimetype : file.type
        switch (type) {
            case 'video/mp4':
            case 'video/ogg':
                break
            default:
                ok = false
                err += 'Не поддерживаемый тип видео. Поддерживаемые форматы: mp4, ogg.\n'
        }
        return {ok, err}
    }

    // Валидация информации видео
    validateVideoInfo = (video: Video) => {
        let ok = true
        let err = ''
        video.title = this.trim(video.title)
        if (video.title.length < 3 || video.title.length > 100) {
            ok = false
            err += 'Длина названия видео должна быть от 3 до 100 символов.\n'
        }
        if (video.description.length < 3 || video.description.length > 150) {
            ok = false
            err += 'Длина описания видео должна быть от 3 до 150 символов.\n'
        }
        return {ok, err}
    }

    // Валидация комментария
    validateComment = (comment: Comment) => {
        let ok = true
        let err = ''
        comment.text = this.trim(comment.text)
        if (comment.text.length < 3 || comment.text.length > 150) {
            ok = false
            err += 'Длина комментария должна быть от 3 до 150 символов.\n'
        }
        return {ok, err}
    }
}

export default Validator