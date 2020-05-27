import {User, UserPassword} from "../../../server/src/common/entity/types"

class UserApi {
    updateGeneral(profile: User) {
        const url = '/api/users/general'
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(profile),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json()).then(r => {
            if (r.status !== 'OK')
                return Promise.reject(r.errorMessage)
            return r.results[0]
        })
    }

    updateAvatar(avatar: FormData) {
        const url = '/api/users/avatar'
        return fetch(url, {
            method: 'POST',
            body: avatar
        }).then(r => r.json())
    }

    updateSecure(user: User) {
        const url = '/api/users/secure'
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    }

    updatePassword = (user: UserPassword) => {
        const url = '/api/users/password'
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    };

    getGeneral() {
        const url = '/api/users/general'
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    }

    login(user: User) {
        const url = '/api/users/login'
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(user),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    }

    logout() {
        const url = '/api/users/logout'
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    }

    getContext() {
        const url = '/api/users/context'
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    }

    signup(formData: User) {
        const url = '/api/users/signup'
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    }

    getUser(id: number) {
        const url = '/api/users/' + id
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    }
}

export default UserApi