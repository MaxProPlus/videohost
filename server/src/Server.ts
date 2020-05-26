import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import morgan from 'morgan'
import path from 'path'
import helmet from 'helmet'

import express, {NextFunction, Request, Response} from 'express'
import 'express-async-errors'

import BaseRouter from './routes'
import logger from './shared/Logger'

// Init express
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(fileUpload())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

if (process.env.NODE_ENV === 'production') {
    app.use(helmet())
}

app.use('/api', BaseRouter)

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err)
    return res.status(400).json({
        error: err.message,
    })
})

app.use(express.static(path.join(__dirname, '../../client/build')))
app.use(express.static(path.join(__dirname, '../upload')))
app.get('/changelog', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../changelog.txt'))
})
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'))
})

export default app
