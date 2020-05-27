import React from "react"
import {Link} from "react-router-dom"
import './Profile.scss'
import CompactVideo from "../../components/compact-video/CompactVideo"
import UserContext from "../../utils/userContext"
import UserApi from "../../api/userApi"
import history from "../../utils/history"
import Spinner from "../../components/spinner/Spinner"
import Button from "../../components/button/Button"
import Profile from "../../components/profile/Profile"
import {User, Video} from "../../../../server/src/common/entity/types"

type stateTypes = {
    isLoaded: boolean
    user: User
    videos: Video[]
}

class ProfilePage extends React.Component<any, stateTypes> {
    static contextType = UserContext;
    private userApi = new UserApi();

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            user: new User(),
            videos: [],
        }
    }

    static getDerivedStateFromProps(nextProps: any, prevState: stateTypes) {
        if (Number(nextProps.match.params.id) !== prevState.user.id) {
            if (isNaN(Number(nextProps.match.params.id))) {
                history.push('/')
            }
            return {
                user: {
                    id: Number(nextProps.match.params.id)
                }
            }
        }

        return null
    }

    componentDidMount() {
        this.updateData()
    }

    updateData = () => {
        let id = Number(this.props.match.params.id)
        this.userApi.getUser(id).then(r => {
            if (r.status !== 'OK') {
                history.push('/')
                return
            }
            this.setState({
                ...r.results[0],
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    };

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<stateTypes>) {
        if (Number(prevProps.match.params.id) !== this.state.user.id) {
            this.setState({
                isLoaded: false,
            })
            this.updateData()
        }
    }

    render() {
        let videoRender
        if (this.state.videos.length > 0) {
            videoRender = this.state.videos.map(v => <CompactVideo key={v.id} {...v}/>)
        } else {
            videoRender = (<div>Пользователь еще не загрузил не одного видео</div>)
        }

        return (
            <div className="profile-page">
                {!this.state.isLoaded && <Spinner/>}
                <div className="fsb header-avatar">
                    <Profile
                        {...this.state.user}
                        onClick={() => {
                        }}
                    />
                    {this.context.user.id === Number(this.props.match.params.id) &&
                    <Link to="/video/upload"><Button>Загрузить видео</Button></Link>}
                </div>
                {videoRender}
            </div>
        )
    }
}

export default ProfilePage