import React from "react"
import {Link} from "react-router-dom"
import './Video.scss'
import CompactVideo from "components/compact-video/CompactVideo"
import ModelVideo from "api/videoApi"
import CommentC from "./comment/Comment"
import CommentApi from "api/commentApi"
import Spinner from "components/spinner/Spinner"
import CommentForm from "pages/video/comment-from/CommentForm"
import Profile from "components/profile/Profile"
import Button from "components/button/Button"
import userContext from "utils/userContext"
import {Comment, Estimate, Video} from "../../../../server/src/common/entity/types"
import history from "../../utils/history"

type IState = {
    isLoaded: boolean
    id: string
    video: Video
    comments: Comment[]
    suggest: Video[]
}

export default class VideoPage extends React.Component<any, IState> {
    static contextType = userContext;

    private videoApi = new ModelVideo();
    private commentApi = new CommentApi();
    private styleSelect = {
        color: 'rgb(62, 166, 255)',
    };

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            id: this.props.match.params.id,
            video: new Video(),
            comments: [],
            suggest: [],
        }
    }

    static getDerivedStateFromProps(nextProps: any, prevState: IState) {
        if (nextProps.match.params.id !== prevState.id) {
            return {
                id: nextProps.match.params.id
            }
        }
        return null
    }

    componentDidMount() {
        this.updateData()
    }

    componentDidUpdate(prevProps: any, prevState: IState) {
        if (prevProps.match.params.id !== this.state.id) {
            this.setState({
                isLoaded: false,
            })
            this.updateData()
        }
    }

    updateData() {
        let listPromise = []
        listPromise.push(this.videoApi.getById(this.state.id).then(r => {
            if (r.status !== 'OK') {
                history.push('/')
                console.error(r.errorMessage)
                return
            }
            this.setState({
                video: r.results[0],
            })
        }))
        listPromise.push(this.videoApi.getRating().then(r => {
            if (r.status !== 'OK') {
                console.error(r.errorMessage)
                return
            }
            this.setState({
                suggest: r.results,
            })
        }))
        listPromise.push(this.commentApi.getComments(this.state.id).then(r => {
            if (r.status !== 'OK') {
                console.error(r.errorMessage)
                return
            }
            this.setState({
                comments: r.results,
            })
        }))
        Promise.all(listPromise).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    updateComment = () => {
        this.setState({
            isLoaded: false,
        })
        this.commentApi.getComments(this.state.id).then(r => {
            if (r.status !== 'OK') {
                console.error(r.errorMessage)
                return
            }
            this.setState({
                comments: r.results,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    };

    handleEstimate = (star: number) => {
        let estimate = new Estimate()
        estimate.idVideo = this.state.video.id
        estimate.star = star
        this.videoApi.setEstimate(estimate).then(r => {
            if (r.status !== 'OK') {
                return
            }
            this.setState((state: any) => {
                return {
                    video: {
                        ...state.video,
                        ...r.results[0]
                    }
                }
            })
        })
    };
    handleCommentSend = (comment: Comment) => {
        console.log(comment)
        this.setState({
            isLoaded: false,
        })
        this.commentApi.create(comment).then(r => {
            console.log(r)
            this.updateComment()
        }, err => {
            console.error(err)
            this.setState({
                isLoaded: true,
            })
        })
    };
    handleCommentRemove = (id_comment: number) => {
        this.setState({isLoaded: false})
        this.commentApi.remove(id_comment).then(r => {
            this.updateComment()
        }, err => {
            console.error(err)
        }).finally(() => {
            this.setState({isLoaded: true})
        })
    };

    render() {
        let $comments
        if (this.state.comments.length > 0) {
            $comments = this.state.comments.map((c: any) => <CommentC key={c.id} id_user={this.context.user.id}
                                                                      onClickRemove={() => {
                                                                          this.handleCommentRemove(c.id)
                                                                      }} {...c}/>)
        } else {
            $comments = (<div className="first-comment">Напишите первый комментарий!</div>)
        }
        return (
            <div className="video-page">
                {!this.state.isLoaded && <Spinner/>}
                <div className="primary">
                    <div className="player">
                        <video preload="metadata" controls src={this.state.video.urlVideo}
                               poster={this.state.video.urlPreview}/>
                    </div>
                    <div className="video-title">{this.state.video.title}</div>
                    <div className="video-info">
                        <div className="rating">Просмотров: {this.state.video.rating}</div>
                        <div className="video-buttons">
                            <Button
                                style={(this.state.video.star === 1) ? this.styleSelect : {}}
                                onClick={() => this.handleEstimate(1)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                     fill={(this.state.video.star === 1) ? this.styleSelect.color : "white"}
                                     width="18px"
                                     height="18px">
                                    <path d="M0 0h24v24H0V0z" fill="none"/>
                                    <path
                                        d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                                </svg>
                                <div>{"Нравится:"}</div>
                                {this.state.video.like}
                            </Button>
                            <Button
                                style={(this.state.video.star === 2) ? this.styleSelect : {}}
                                onClick={() => this.handleEstimate(2)}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                                     fill={(this.state.video.star === 2) ? this.styleSelect.color : "white"}
                                     width="18px"
                                     height="18px">
                                    <path d="M0 0h24v24H0z" fill="none"/>
                                    <path
                                        d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                                </svg>
                                <div>{"Не нравится:"}</div>
                                {this.state.video.dislike}
                            </Button>
                        </div>
                    </div>
                    <div className="video-header">
                        <Profile
                            {...this.state.video.user}
                        />
                        {this.state.video.user.id === this.context.user.id &&
                        <Link to={'/video/update/' + this.state.id}><Button>Редактирование</Button></Link>}
                    </div>

                    <div className="description">{this.state.video.description}</div>
                    {Boolean(this.context.user.id) &&
                    <CommentForm onCommentSend={this.handleCommentSend}
                                 onCommentUpdate={this.updateComment}
                                 idVideo={this.state.video.id}/>}
                    <div className="comments">
                        {$comments}
                    </div>
                </div>
                <div className="suggest-video">
                    {this.state.suggest.map((v: any) => <CompactVideo key={v.id} {...v}/>)}
                </div>
            </div>
        )
    }
}