import React, {Component} from "react"
import './VideoUpdate.scss'
import history from "utils/history"
import VideoApi from "api/videoApi"
import Spinner from "components/spinner/Spinner"
import Button from "components/button/Button"
import Validator from "../../../../server/src/common/validator"
import InputField from "../../components/form/input-field/InputField";

type stateTypes = {
    id: string
    isLoaded: boolean
    title: string,
    description: string,
    filePreview: any,
    errorMessage_update: string,
    errorMessage_delete: string,
}

class VideoUpdate extends Component<{}, stateTypes> {
    videoApi = new VideoApi();
    validator = new Validator();

    constructor(props: any) {
        super(props)
        this.state = {
            id: '0',
            isLoaded: false,
            title: '',
            description: '',
            filePreview: null,
            errorMessage_update: '',
            errorMessage_delete: '',
        }
    }

    static getDerivedStateFromProps(nextProps: any, prevState: stateTypes) {
        if (nextProps.match.params.id !== prevState.id) {
            return {
                id: nextProps.match.params.id,
            }
        }

        return null
    }

    componentDidMount() {
        this.updateData()
    }

    updateData() {
        console.log(this.state.id)
        this.videoApi.getById(this.state.id).then(r => {
            if (r.status !== 'OK') {
                console.error(r.errorMessage_update)
                return
            }
            this.setState({
                ...r.results[0],
            })
        }).finally(() => {
            this.setState({
                isLoaded: true
            })
        })
    }

    componentDidUpdate(prevProps: any, prevState: Readonly<stateTypes>) {
        if (prevProps.match.params.id !== this.state.id) {
            this.setState({
                isLoaded: false,
            })
            this.updateData()
        }
    }

    handlePreviewChange = (e: any) => {
        let file = e.target.files[0]

        const {ok, err} = this.validator.validateImg(file)
        if (!ok) {
            e.target.value = ''
            this.setState({
                errorMessage_update: err
            })
            return
        }
        this.setState({
            errorMessage_update: '',
            filePreview: file,
        })
    };

    handleChange = (e: any) => {
        // @ts-ignore
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    handleSubmit = (e: any) => {
        this.setState({
            errorMessage_update: '',
            isLoaded: false,
        })
        e.preventDefault()
        let formData = new FormData()
        formData.append('id', this.state.id)
        formData.append('title', this.state.title)
        formData.append('description', this.state.description)
        formData.append('filePreview', this.state.filePreview)
        this.videoApi.update(formData).then(r => {
            if (r.status !== 'OK') {
                this.setState({
                    errorMessage_update: r.errorMessage
                })
                return
            }
            history.push('/video/' + r.results[0])
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    };

    handleDelete = (e: any) => {
        e.preventDefault()
        console.log(this.state.id)
        this.videoApi.delete(this.state.id).then(r => {
            if (r.status !== 'OK') {
                this.setState({
                    errorMessage_delete: r.errorMessage
                })
                return
            }
            history.push('/')
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    };

    render() {
        return (
            <div className="video-upload">
                {!this.state.isLoaded && <Spinner/>}
                <form onSubmit={this.handleSubmit} className="form-sign">
                    <div className="title">Редактирование видео</div>
                    {this.state.errorMessage_update &&
                    <div className="alert alert-danger">{this.state.errorMessage_update}</div>}
                    <InputField label="Название" type="text" value={this.state.title}
                                id="title" onChange={this.handleChange}/>
                    <div className="form-group">
                        <label htmlFor="title">Превью видео</label>
                        <input type="file" onChange={this.handlePreviewChange}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Описание</label>
                        <textarea id="description" name="description" value={this.state.description}
                                  onChange={this.handleChange}/>
                    </div>
                    <div className="form-group">
                        <button>Сохранить</button>
                    </div>
                </form>
                <form onSubmit={this.handleDelete} className="form-sign remove">
                    {this.state.errorMessage_delete &&
                    <div className="alert alert-danger">{this.state.errorMessage_delete}</div>}
                    <div className="suggest">
                        Для удаления видео: <Button>Удалить</Button>
                    </div>
                </form>
            </div>
        )
    }
}

export default VideoUpdate