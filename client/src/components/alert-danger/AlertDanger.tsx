import React from "react"
import './AlertDanger.scss'

export default (props: any) => {
    return (
        <div className="alert-danger">{props.children}</div>
    )
}
