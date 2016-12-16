
import redis from 'redis'
import moment from 'moment'
import { promisifyAll } from 'bluebird'
import { redis_conf } from '~/package.json'

promisifyAll(redis.RedisClient.prototype)
const {port, host} = redis_conf 
const redisClient = redis.createClient(port, host)
redisClient.on('error', _err => {
    console.error(_err) 
})

class Util {
    
    constructor() {
           
    }

    getKeyFromLog(_input) {
        let match = _input.match(/\[([a-z\_]+\:[a-zA-Z0-9]+)\]/)
        return match ? match[1] : false
    }

    getTimestampFromLog(_input) {
        let match = _input.match(/\[([0-9]+)\]$/)
        return match ? match[1] : false
    }

    getAppnameFromLog(_input) {
        let match = _input.match(/^\[([\w\-_]+)\]/)
        return match ? match[1] : false
    }

    getDescFromLog(_input) {
        return _input.replace(/(\[.+?\])/gi, '').replace(/(^\s+|\s+$)/gi, '')
    }

}

class LogMsg extends Util {
    
    constructor(_input) {
        super()

        let _ = this
        _.client = redisClient
        _.now = moment().format('YYYYMMDD')
        _.key = _.getKeyFromLog(_input)
        if (!_.key) {
            console.warn('日志类型为空')
            _.key = ''
        }
        _.times = _.getTimestampFromLog(_input)
        _.app_name = _.getAppnameFromLog(_input)
        _.desc = _.getDescFromLog(_input)
        _.type = _.key.split(':')[0]

    }

    async _saveToTimeGroup() {
        let _ = this
        await _.client.saddAsync(`time_group:${_.now}`, _.key)
        return await _.client.zaddAsync(_.key, _.times, `[${_.app_name}] ${_.desc}`)
    }

    save() {
        if (this.type === 'time_group') {
            return this._saveToTimeGroup()
        }
        return false
    }

}

export default LogMsg
