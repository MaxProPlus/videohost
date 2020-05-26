import React from "react"

export default ({label, type, value, id, onChange}: any) => {
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <input type={type} id={id} name={id}
                   value={value}
                   onChange={onChange}/>
        </div>
    )
} 