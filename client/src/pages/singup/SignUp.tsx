import React, {Component} from 'react'
import {Link} from "react-router-dom"
import history from "../../utils/history"
import UserApi from "../../api/userApi"
import UserContext from "../../utils/userContext"
import AlertDanger from "../../components/alert-danger/AlertDanger"
import Validator from "../../../../server/src/common/validator"
import {User} from "../../../../server/src/common/entity/types"
import InputField from "../../components/form/input-field/InputField";

type stateTypes = {
    login: string
    email: string
    password: string
    passwordRepeat: string
    errorMessage: string
}

class SignUp extends Component<{}, stateTypes> {
    static contextType = UserContext;
    validator = new Validator();
    userApi = new UserApi();

    constructor(props: any) {
        super(props)
        this.state = {
            login: '',
            email: '',
            password: '',
            passwordRepeat: '',
            errorMessage: '',
        }
    }

    handleSubmit = (e: any) => {
        e.preventDefault()
        let user = new User()
        user.login = this.state.login
        user.email = this.state.email
        user.password = this.state.password
        user.passwordRepeat = this.state.passwordRepeat
        const {ok, err} = this.validator.validateSignup(user)
        if (!ok) {
            this.setState({
                errorMessage: err
            })
            return
        }

        this.userApi.signup(user).then(r => {
            if (r.status !== 'OK') {
                this.setState({
                    errorMessage: r.errorMessage,
                })
                return
            }
            this.context.updateLogin()
            history.push('/setting')
        })
    };
    handleChange = (e: any) => {
        // @ts-ignore
        this.setState({
            errorMessage: '',
            [e.target.name]: e.target.value,
        })
    };

    render() {
        return (
            <form className="form-sign" onSubmit={this.handleSubmit}>
                <div className="title">Регистрация</div>
                {this.state.errorMessage && <AlertDanger>{this.state.errorMessage}</AlertDanger>}
                <InputField label="E-mail" type="text" value={this.state.email}
                            id="email" onChange={this.handleChange}/>
                <InputField label="Login" type="text" value={this.state.login}
                            id="login" onChange={this.handleChange}/>
                <InputField label="Пароль" type="password" value={this.state.password}
                            id="password" onChange={this.handleChange}/>
                <InputField label="Повторите пароль" type="password" value={this.state.passwordRepeat}
                            id="passwordRepeat" onChange={this.handleChange}/>
                <div className="form-group">
                    <button>Регистрация</button>
                </div>
                <div className="suggest">
                    Уже зарегистрированы? <Link to="/login">Войдите</Link>
                </div>
            </form>
        )
    }
}

export default SignUp