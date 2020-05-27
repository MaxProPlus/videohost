import React from "react"
import UserApi from "../../api/userApi"
import userContext from "../../utils/userContext"
import Spinner from "../../components/spinner/Spinner"
import history from "../../utils/history"
import Validator from "../../../../server/src/common/validator"
import {User, UserPassword} from "../../../../server/src/common/entity/types"
import InputField from "../../components/form/input-field/InputField";
import AlertDanger from "../../components/alert-danger/AlertDanger";

type IState = {
    email: string,
    login: string,
    passwordAccept: string,
    passwordOld: string,
    password: string,
    passwordRepeat: string,
    nickname: string,
    firstname: string,
    secondname: string,
    avatar: any,
    errorAvatar: string,
    errorGeneral: string,
    errorSecure: string,
    errorPassword: string,
    isLoaded: boolean,
}

class Setting extends React.Component<{}, IState> {
    static contextType = userContext;
    userApi = new UserApi();
    validator = new Validator();

    constructor(props: {}) {
        super(props)
        this.state = {
            email: '',
            login: '',
            passwordAccept: '',
            passwordOld: '',
            password: '',
            passwordRepeat: '',
            nickname: '',
            firstname: '',
            secondname: '',
            avatar: '',
            errorAvatar: '',
            errorGeneral: '',
            errorSecure: '',
            errorPassword: '',
            isLoaded: false,
        }
    }

    componentDidMount() {
        this.userApi.getGeneral().then(r => {
            if (r.status !== 'OK') {
                history.push('/login')
                return
            }
            this.setState(r.results[0])
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    }

    handleChange = (e: any) => {
        this.setState({
            errorGeneral: '',
            errorSecure: '',
            errorPassword: '',
            [e.target.name]: e.target.value,
        } as { [K in keyof IState]: IState[K] })
    };

    handleImageChange = (e: any) => {
        const {ok, err} = this.validator.validateImg(e.target.files[0])
        if (!ok) {
            this.setState({
                errorAvatar: err,
                avatar: ''
            })
            e.target.value = ''
            return
        }
        this.setState({
            errorAvatar: '',
            avatar: e.target.files[0]
        })
    };

    handleSubmitProfileAvatar = (e: any) => {
        this.setState({
            isLoaded: false,
            errorAvatar: '',
        })
        e.preventDefault()
        let formData = new FormData()
        formData.append('avatar', this.state.avatar)
        this.userApi.updateAvatar(formData).then(r => {
            if (r.status !== 'OK') {
                this.setState({
                    errorAvatar: r.errorMessage,
                })
                return
            }
            this.setState({
                errorAvatar: '',
            })
            this.context.updateLogin()
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    };

    handleSubmitProfile = (e: any) => {
        e.preventDefault()
        let user = new User()
        user.nickname = this.state.nickname
        user.firstname = this.state.firstname
        user.secondname = this.state.secondname
        const {ok, err} = this.validator.validateGeneral(user)
        if (!ok) {
            this.setState({
                errorGeneral: err,
            })
            return
        }
        this.setState({
            isLoaded: false,
            errorGeneral: '',
        })
        this.userApi.updateGeneral(user).then(r => {
            this.setState(r)
            this.context.updateLogin()
        }, (err) => {
            this.setState({
                errorGeneral: err,
            })
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    };

    handleSubmitSecure = (e: any) => {
        e.preventDefault()
        let user = new User()
        user.email = this.state.email
        user.login = this.state.login
        user.password = this.state.passwordAccept
        const {ok, err} = this.validator.validateSecure(user)
        if (!ok) {
            this.setState({
                errorSecure: err
            })
            return
        }
        this.setState({
            isLoaded: false,
            errorSecure: '',
        })
        this.userApi.updateSecure(user).then(r => {
            if (r.status !== 'OK') {
                this.setState({
                    errorSecure: r.errorMessage,
                })
                return
            }
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    };

    handleSubmitUserPassword = (e: any) => {
        e.preventDefault()
        let user = new UserPassword()
        user.passwordAccept = this.state.passwordOld
        user.password = this.state.password
        user.passwordRepeat = this.state.passwordRepeat
        const {ok, err} = this.validator.validatePassword(user)
        if (!ok) {
            this.setState({
                errorPassword: err,
            })
            return
        }
        this.setState({
            isLoaded: false,
        })
        this.userApi.updatePassword(user).then(r => {
            if (r.status !== 'OK') {
                this.setState({
                    errorPassword: r.errorMessage,
                })
                return
            }
        }).finally(() => {
            this.setState({
                isLoaded: true,
            })
        })
    };

    render() {
        return (
            <div>
                {!this.state.isLoaded && <Spinner/>}

                <div className="page-setting">
                    <form className="form-sign" onSubmit={this.handleSubmitProfileAvatar}>
                        <div className="title">Загрузка аватара</div>
                        {this.state.errorAvatar && <AlertDanger>{this.state.errorAvatar}</AlertDanger>}
                        <div className="form-group">
                            <input className="fileInput" type="file" onChange={this.handleImageChange}/>
                        </div>
                        <div className="form-group">
                            <button>Загрузить</button>
                        </div>
                    </form>
                    <form className="form-sign" onSubmit={this.handleSubmitProfile}>
                        <div className="title">Общие настройки</div>
                        {this.state.errorGeneral && <AlertDanger>{this.state.errorGeneral}</AlertDanger>}
                        <InputField label="Никнейм" type="text" value={this.state.nickname}
                                    id="nickname" onChange={this.handleChange}/>
                        <InputField label="Имя" type="text" value={this.state.firstname}
                                    id="firstname" onChange={this.handleChange}/>
                        <InputField label="Фамилия" type="text" value={this.state.secondname}
                                    id="secondname" onChange={this.handleChange}/>
                        <div className="form-group">
                            <button>Сохранить</button>
                        </div>
                    </form>
                    <form className="form-sign" onSubmit={this.handleSubmitSecure}>
                        <div className="title">Настройки безопасности</div>
                        {this.state.errorSecure && <AlertDanger>{this.state.errorSecure}</AlertDanger>}
                        <InputField label="E-mail" type="email" value={this.state.email}
                                    id="email" onChange={this.handleChange}/>
                        <InputField label="Login" type="text" value={this.state.login}
                                    id="login" onChange={this.handleChange}/>
                        <InputField label="Подтверждение пароля" type="password" value={this.state.passwordAccept}
                                    id="passwordAccept" onChange={this.handleChange}/>
                        <div className="form-group">
                            <button>Сохранить</button>
                        </div>
                    </form>
                    <form className="form-sign" onSubmit={this.handleSubmitUserPassword}>
                        <div className="title">Изменение пароля</div>
                        {this.state.errorPassword && <AlertDanger>{this.state.errorPassword}</AlertDanger>}
                        <InputField label="Старый пароль" type="password" value={this.state.passwordOld}
                                    id="passwordOld" onChange={this.handleChange}/>
                        <InputField label="Новый пароль" type="password" value={this.state.password}
                                    id="password" onChange={this.handleChange}/>
                        <InputField label="Повторите пароль" type="password" value={this.state.passwordRepeat}
                                    id="passwordRepeat" onChange={this.handleChange}/>
                        <div className="form-group">
                            <button>Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default Setting