import React from 'react'
import './AvatarImg.scss'

export default function AvatarImg(props: any) {
    return (
        <div className="avatar_img">
            <img src={props.url} alt=""/>
        </div>
    )
}