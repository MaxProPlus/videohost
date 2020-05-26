import React, {Component} from 'react'
import {Link} from "react-router-dom"
import UserApi from "../../api/userApi"
import history from "../../utils/history"
import UserContext from "../../utils/userContext"
import Spinner from "../../components/spinner/Spinner"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import {User} from "../../../../server/src/common/entity/types"
import InputField from "../../components/form/input-field/InputField";

type stateTypes = {
    login: string,
    password: string,
    isLoaded: boolean,
    errorMessage: string,
}

class Login extends Component<{}, stateTypes> {
    static contextType = UserContext;
    userApi = new UserApi();

    constructor(props: any) {
        super(props)
        this.state = {
            login: '',
            password: '',
            isLoaded: true,
            errorMessage: '',
        }
    }

    handleSubmit = (e: any) => {
        e.preventDefault()

        this.setState({
            errorMessage: '',
            isLoaded: false,
        })
        let user = new User()
        user.login = this.state.login
        user.password = this.state.password
        this.userApi.login(user).then(r => {
            if (r.status !== 'OK') {
                this.setState({
                    errorMessage: r.errorMessage
                })
                return
            }
            this.context.updateLogin()
            history.push('/')
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    };
    handleChange = (e: any) => {
        this.setState({
            errorMessage: '',
            [e.target.name]: e.target.value,
        } as { [K in keyof stateTypes]: stateTypes[K] })
    };

    render() {
        return (
            <form className="form-sign" onSubmit={this.handleSubmit}>
                {!this.state.isLoaded && <Spinner/>}
                <div className="title">Вход</div>
                {this.state.errorMessage && <AlertDanger>{this.state.errorMessage}</AlertDanger>}
                <InputField label="Login" type="text" value={this.state.login}
                            id="login" onChange={this.handleChange}/>
                <InputField label="Пароль" type="password" value={this.state.password}
                            id="password" onChange={this.handleChange}/>
                <div className="form-group">
                    <button>Вход</button>
                </div>
                <div className="suggest">
                    Ещё нет аккаунта? <Link to="/signup">Зарегистрируйтесь</Link>
                </div>
            </form>
        )
    }
}

export default Login