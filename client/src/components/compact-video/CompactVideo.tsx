import React from 'react'
import './CompactVideo.scss'
import {Video} from "../../../../server/src/common/entity/types"
import {Link} from "react-router-dom"

export default ({id, title, rating, urlPreview, user}: Video) => {
    return (
        <div className="compactvideo">
            <Link to={'/video/' + id}>
                <div className="compactvideo-img"><img src={urlPreview} alt=""/></div>
                <div className="compactvideo-info">
                    <div className="compactvideo-title" title={title}>{title}</div>
                    <div className="compactvideo-nickname">{user.nickname}</div>
                    <div className="compactvideo-rating">Просмотров: {rating}</div>
                </div>
            </Link>
        </div>
    )
}