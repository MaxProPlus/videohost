import crypto from 'crypto'

class Hash {

    // Получить хеш пароля
    getHash = (password: string) => {
        return crypto.createHash('sha1').update(password).digest('hex')
    }

    // Получить рандомный хеш
    getHashWithSalt = (data: any) => {
        return crypto.createHash('md5').update(data + Math.random().toString()).digest('hex')
    }

    // Сгенерировать токен
    getToken = () => {
        const currentDate = (new Date()).valueOf().toString()
        const random = Math.random().toString()
        return crypto.createHash('sha1').update(currentDate + random).digest('hex')
    }
}

export default Hash