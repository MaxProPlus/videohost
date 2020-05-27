import {UploadedFile} from 'express-fileupload'

export class User {
    id = 0
    login = ''
    email = ''
    firstname = ''
    secondname = ''
    nickname = ''
    urlAvatar = ''
    password = ''
    passwordRepeat = ''
}

export class UserPassword {
    id = 0
    password = ''
    passwordRepeat = ''
    passwordAccept = ''
}

export class Estimate {
    id = 0
    star = 0
    idUser = 0
    idVideo = 0
}

export class Comment {
    id = 0
    text = ''
    idUser = 0
    idVideo = 0
    authorNickname = ''
    authorUrlAvatar = ''
}

export class Video {
    id = 0
    title = ''
    description = ''
    urlVideo = ''
    urlPreview = ''
    rating = 0
    like = 0
    dislike = 0
    idUser = 0
    user = new User()
    star = 0
}

export class VideoUpload extends Video {
    fileVideo!: UploadedFile
    filePreview!: UploadedFile
}