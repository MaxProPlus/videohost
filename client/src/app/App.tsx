import React from 'react'
import {Route, Router, Switch} from "react-router-dom"
import history from "utils/history"
import './App.scss'
import Header from "components/header/Header"
import Profile from "pages/profile/Profile"
import Video from "pages/video/Video"
import VideoUpload from "pages/video_upload/VideoUpload"
import Home from "pages/home/Home"
import Search from "pages/search/Search"
import Setting from "pages/setting/Setting"
import Login from "pages/login/Login"
import SignUp from "pages/singup/SignUp"
import UserApi from "api/userApi"
import UserContext from "utils/userContext"
import VideoUpdate from "pages/video_update/VideoUpdate"
import {User} from "../../../server/src/common/entity/types"
import Footer from "../components/footer/Footer"

let getCookie = (name: string) => {
    let matches = document.cookie.match(new RegExp(
        // eslint-disable-next-line no-useless-escape
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ))
    return matches ? decodeURIComponent(matches[1]) : undefined
}

interface IState {
    isLoaded: boolean
    user: User
}

class App extends React.Component<any, IState> {
    private userApi = new UserApi();

    constructor(props: any) {
        super(props)
        this.state = {
            isLoaded: false,
            user: new User(),
        }
    }

    updateLogin = () => {
        let token = getCookie('token')
        if (!token) {
            this.setState({
                user: new User()
            })
            return
        }
        this.userApi.getContext().then(r => {
            if (r.status !== 'OK') {
                return
            }
            this.setState((state) => {
                return {
                    user: {
                        ...state.user,
                        ...r.results[0],
                    }
                }
            })
        })
    };

    componentDidMount() {
        this.updateLogin()
    }

    render() {
        return (
            <Router history={history}>
                <UserContext.Provider value={{user: this.state.user, updateLogin: this.updateLogin}}>
                    <div className="app">
                        <Header/>
                        <div className="container">
                            <Switch>
                                <Route exact path="/" component={Home}/>
                                <Route path="/login" component={Login}/>
                                <Route path="/signup" component={SignUp}/>
                                <Route path="/profile/:id" component={Profile}/>
                                <Route path="/video/upload" component={VideoUpload}/>
                                <Route path="/video/update/:id" component={VideoUpdate}/>
                                <Route path="/video/:id" component={Video}/>
                                <Route path="/search" component={Search}/>
                                <Route path="/setting" component={Setting}/>
                                <Route path="/*">not found</Route>
                            </Switch>
                        </div>
                        <Footer/>
                    </div>
                </UserContext.Provider>
            </Router>
        )
    }
}

export default App
