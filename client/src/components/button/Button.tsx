import React from "react"
import './Button.scss'

export default (props: any) => {
    return (
        <button className="btn" {...props}>{props.children}</button>
    )
}