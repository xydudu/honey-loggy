
import "babel-polyfill"
import SocketServer from './src/socket-server.js'
import webserver from './src/web-server.js'
import { web_server } from '~/package.json'

new SocketServer()
webserver.listen(web_server.port, () => {
    console.log(`Server listening ${web_server.port}`)
})
