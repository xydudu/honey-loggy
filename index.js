
import "babel-polyfill"
import dotenv from 'dotenv'
import SocketServer from './src/socket-server.js'
import webserver from './src/web-server.js'

// Load environment variables from .env file
dotenv.load({path: '.env'})

new SocketServer()

const server = webserver.listen(process.env.WEB_SERVER_PORT, process.env.WEB_SERVER_HOST, () => {
    const host = server.address().address
    const port = server.address().port
    console.log(`Server listening at http://${host}:${port}`)
})
