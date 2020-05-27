import React from "react"
import {User} from "../../../server/src/common/entity/types"

export default React.createContext({
    user: new User(), updateLogin: () => {
    }
})