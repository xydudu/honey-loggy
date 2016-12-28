
import net from 'net'
import dotenv from 'dotenv'
import LogMsg from '~/src/logmsg.js'

dotenv.load({path: `${process.cwd()}/.env`})

export default class {
    
    constructor() {
        let _ = this
        _.server = net.createServer(_socket => {
            _socket.on('data', _msg => {
                _._receive(_msg, _socket) 
            })
        })
        /*
        setInterval(() => {
            _.server.getConnections((_err, _count) => {
                if (_err) console.log(_err)
                console.log(_count)
            }) 
        }, 2000)
        */
        _.server.listen(process.env.SOCKET_SERVER_PORT, process.env.SOCKET_SERVER_HOST)
    }

    _receive(_msg, _socket) {
        //let socket = this.socket
        console.log(`[msg] ${_msg}`)
        new LogMsg(_msg.toString()).save()
        
    } 

}
