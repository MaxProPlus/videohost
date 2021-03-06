import React, {Component} from 'react'
import {Link} from "react-router-dom"
import history from "../../utils/history"
import UserContext from "../../utils/userContext"
import Dropdown from 'components/dropdown/Dropdown'
import searchIcon from './search.svg'
import Button from "../button/Button"
import './Header.scss'
import Input from "../input/Input"

type stateTypes = {
    query: string
}

class Header extends Component<{}, stateTypes> {
    static contextType = UserContext;

    constructor(props: any) {
        super(props)
        this.state = {
            query: ''
        }
    }

    handleChange = (e: any) => {
        this.setState({
            query: e.target.value
        })
    }

    handleSubmit = (e: any) => {
        e.preventDefault()
        if (!this.state.query) return
        history.push('/search?query=' + this.state.query)
    }

    render() {
        const $profile = (this.context.user.id === 0) ? (
            <div className="profile"><Link to="/login">Вход</Link></div>) : (<Dropdown/>)
        return (
            <header className="fc header">
                <div className="fsb header-inner">
                    <div className="logo"><Link to="/">Vh</Link></div>
                    <form action="" method="GET" className="fc search-form" onSubmit={this.handleSubmit}>
                        <Input type="search" placeholder="Поиск" value={this.state.query}
                               onChange={this.handleChange}/>
                        <Button><img src={searchIcon} alt=""/></Button>
                    </form>
                    {$profile}
                </div>
            </header>
        )
    }
}

export default Header