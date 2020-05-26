import React, {Component} from 'react'
import './CommentForm.scss'
import userContext from "../../../utils/userContext"
import AvatarImg from "../../../components/avatar-img/AvatarImg"
import Button from "../../../components/button/Button"
import Input from "../../../components/input/Input"
import Spinner from "../../../components/spinner/Spinner"
import CommentApi from "../../../api/commentApi"
import AlertDanger from "../../../components/alert-danger/AlertDanger"
import Validator from "../../../../../server/src/common/validator"
import {Comment} from "../../../../../server/src/common/entity/types"

type propsTypes = {
    idVideo: number
    onCommentSend: any
    onCommentUpdate: any
}

type stateTypes = {
    isLoaded: boolean
    comment: string
    errorMessage: string,
}

class CommentForm extends Component<propsTypes, stateTypes> {
    static contextType = userContext;
    private commentApi = new CommentApi();
    private validator = new Validator();

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: true,
            comment: '',
            errorMessage: '',
        }
    }

    handleSubmit = (e: any) => {
        e.preventDefault()
        let comment = new Comment()
        comment.text = this.state.comment
        comment.idVideo = this.props.idVideo
        const {ok, err} = this.validator.validateComment(comment)
        if (!ok) {
            this.setState({
                errorMessage: err,
            })
            return
        }
        this.setState({
            isLoaded: false,
            errorMessage: '',
        })
        this.commentApi.create(comment).then(r => {
            if (r.status !== 'OK') {
                this.setState({
                    errorMessage: r.errorMessage
                })
                return
            }
            this.props.onCommentUpdate()
        }).finally(() => {
            this.setState({
                isLoaded: true,
                comment: '',
            })
        })
    };

    handleChange = (e: any) => {
        this.setState({
            errorMessage: '',
            comment: e.target.value,
        })
    };

    render() {
        return (
            <>
                {this.state.errorMessage && <AlertDanger>{this.state.errorMessage}</AlertDanger>}
                <form className="comment-form" onSubmit={this.handleSubmit}>
                    {!this.state.isLoaded && <Spinner/>}
                    <AvatarImg url={this.context.user.urlAvatar}/>
                    <Input value={this.state.comment} onChange={this.handleChange}/>
                    <Button onClick={this.handleSubmit}>Отправить</Button>
                </form>
            </>
        )
    }
}

export default CommentForm