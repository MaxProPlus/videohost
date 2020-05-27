import React, {Component} from "react"
import history from "../../utils/history"
import VideoApi from "../../api/videoApi"
import Spinner from "../../components/spinner/Spinner"
import Validator from "../../../../server/src/common/validator"
import InputField from "../../components/form/input-field/InputField";
import AlertDanger from "../../components/alert-danger/AlertDanger";

class VideoUpload extends Component<{}, any> {
    private videoApi = new VideoApi();
    private validator = new Validator();

    constructor(props: {}) {
        super(props)
        this.state = {
            isLoaded: true,
            title: '',
            description: '',
            fileVideo: null,
            filePreview: null,
            errorMessage: '',
        }
    }

    handleVideoChange = (e: any) => {
        let file = e.target.files[0]
        const {ok, err} = this.validator.validateVideoFile(file)
        if (!ok) {
            e.target.value = ''
            this.setState({
                errorMessage: err
            })
            return
        }
        this.setState({
            fileVideo: file,
            errorMessage: ''
        })
    };

    handlePreviewChange = (e: any) => {
        let file = e.target.files[0]
        const {ok, err} = this.validator.validateImg(file)
        if (!ok) {
            e.target.value = ''
            this.setState({
                errorMessage: err
            })
            return
        }
        this.setState({
            filePreview: file,
            errorMessage: ''
        })
    };

    handleChange = (e: any) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    };

    handleSubmit = (e: any) => {
        this.setState({
            errorMessage: '',
            isLoaded: false,
        })
        e.preventDefault()
        let formData = new FormData()
        formData.append('title', this.state.title)
        formData.append('description', this.state.description)
        formData.append('file_video', this.state.fileVideo)
        formData.append('file_preview', this.state.filePreview)
        this.videoApi.create(formData).then(r => {
            if (r.status !== 'OK') {
                this.setState({
                    errorMessage: r.errorMessage
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

    render() {
        return (
            <div className="video-upload">
                {!this.state.isLoaded && <Spinner/>}
                <form onSubmit={this.handleSubmit} className="form-sign">
                    <div className="title">Загрузка видео</div>
                    {this.state.errorMessage && <AlertDanger>{this.state.errorMessage}</AlertDanger>}
                    <InputField label="Название" type="text" value={this.state.title}
                                id="title" onChange={this.handleChange}/>
                    <div className="form-group">
                        <label htmlFor="title">Видео</label>
                        <input type="file" onChange={this.handleVideoChange}/>
                    </div>
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
                        <button>Загрузить</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default VideoUpload