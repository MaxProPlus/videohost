import {Comment} from "../../../server/src/common/entity/types"

class Model {
    create(comment: Comment) {
        let url = '/api/videos/' + comment.idVideo + '/comments'
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(comment),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    }

    getComments(idVideo: string) {
        let url = '/api/videos/' + idVideo + '/comments'
        return fetch(url, {
            method: 'GET'
        }).then(r => r.json())
    }

    remove(id: number) {
        let url = '/api/videos/' + 0 + '/comments/' + id
        return fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    }
}

export default Model