import {Estimate} from "../../../server/src/common/entity/types"

class VideoApi {
    getRating() {
        const url = '/api/videos/rating'
        return fetch(url).then(r => r.json())
    }

    getLiking() {
        const url = '/api/videos/liking'
        return fetch(url).then(r => r.json())
    }

    getRecently() {
        const url = '/api/videos/recently'
        return fetch(url).then(r => r.json())
    }

    search(query: string) {
        const url = '/api/videos/search?query=' + query
        return fetch(url).then(r => r.json())
    }

    getById(id: string) {
        const url = '/api/videos/' + id
        return fetch(url).then(r => r.json())
    }

    create(video: FormData) {
        const url = '/api/videos'
        return fetch(url, {
            method: 'POST',
            body: video,
        }).then(r => r.json())
    }

    update(video: FormData) {
        const url = '/api/videos/' + video.get('id')
        return fetch(url, {
            method: 'PUT',
            body: video,
        }).then(r => r.json())
    }

    setEstimate(estimate: Estimate) {
        const url = '/api/videos/estimate'
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(estimate),
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(r => r.json())
    }

    delete(id: string) {
        const url = '/api/videos/' + id
        return fetch(url, {
            method: 'DELETE',
        }).then(r => r.json())
    }
}

export default VideoApi