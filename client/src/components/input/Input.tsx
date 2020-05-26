import React from "react"
import './Input.scss'

export default function Input(props: any) {
    return (
        <input className="form-input"
               type={props.type ? props.type : 'text'}
               placeholder={props.placeholder}
               onChange={props.onChange}
               value={props.value}
        />
    )
}