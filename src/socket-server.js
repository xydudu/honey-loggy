
import net from 'net'
import { server } from '~/package.json'
import LogMsg from '~/src/logmsg.js'

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
        _.server.listen(server.port, server.host)
    }

    _receive(_msg, _socket) {
        //let socket = this.socket
        console.log(`[msg] ${_msg}`)
        new LogMsg(_msg.toString()).save()
        
    } 

}
