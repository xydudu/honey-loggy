
import "babel-polyfill"
import { load } from 'dotenv'
import SocketServer from './src/socket-server.js'
import webserver from './src/web-server.js'

// Load environment variables from .env file
load({path: '.env'})

new SocketServer()

const server = webserver.listen(process.env.WEB_SERVER_PORT, process.env.WEB_SERVER_HOST, () => {
    const host = server.address().address
    const port = server.address().port
    console.log(`Server listening at http://${host}:${port}`)
})
