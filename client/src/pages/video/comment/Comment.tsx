import React, {useContext} from "react"
import './Comment.scss'
import removeImg from './img/remove.svg'
import AvatarImg from "../../../components/avatar-img/AvatarImg"
import {Link} from "react-router-dom"
import {Comment as CommentType} from "../../../../../server/src/common/entity/types"
import UserContext from "../../../utils/userContext"

type propsTypes = CommentType & {
    onClickRemove: any
}

export default function Comment(props: propsTypes) {
    const context = useContext(UserContext)
    return (
        <div className="comment-item">
            <Link to={'/profile/' + props.idUser}><AvatarImg url={props.authorUrlAvatar}/></Link>
            <div className="comment-block">
                <div className="comment-author"><Link to={'/profile/' + props.idUser}>{props.authorNickname}</Link>
                </div>
                <div className="comment-text">{props.text}</div>
            </div>
            {context.user.id === props.idUser &&
            <img onClick={props.onClickRemove} className="comment-remove" src={removeImg} alt="remove"/>}
        </div>
    )

}