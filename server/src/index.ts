import './LoadEnv'
import app from './Server'
import logger from './services/logger'

// Start the server
const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
    logger.info('Express server started on port: ' + port)
})
