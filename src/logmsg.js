
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
        let match = _input.replace(/[\s\t ]+$/g, '').match(/\[([0-9]+)\]$/)
        return match ? parseInt(match[1]) : false
    }

    getAppnameFromLog(_input) {
        let match = _input.match(/^\[([\w\-_]+)\]/)
        return match ? match[1] : false
    }

    getDescFromLog(_input) {
        return _input.replace(/(\[.+?\])/gi, '').replace(/(^\s+|\s+$)/gi, '')
    }

    isPreview(_desc) {
        return /预览请求/.test(_desc)
    }
    isDeploy(_desc) {
        return /发布请求/.test(_desc)
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
        let is_preview = _.isPreview(_.desc)
        let is_deploy =  _.isDeploy(_.desc)
        if (!_.times) return false
        if (_.key === '') return false
        let tasks = [
            _.client.saddAsync(`time_group:${_.now}`, _.key),
            _.client.zaddAsync(_.key, _.times, `[${_.app_name}] ${_.desc}`)
        ]
        if (is_preview) 
            tasks.push(_.client.hmsetAsync(`preview:${_.key}`, ['start', _.times, 'end', _.times]))
        if (is_deploy) 
            tasks.push(_.client.hmsetAsync(`deploy:${_.key}`, ['start', _.times, 'end', _.times]))
        
        return await Promise.all([
            _.client.existsAsync(`preview:${_.key}`),
            _.client.existsAsync(`deploy:${_.key}`)
        ]).then(_res => {
            if (_res[0])
                tasks.push(_.client.hsetAsync([`preview:${_.key}`, 'end', _.times]))
            if (_res[1])
                tasks.push(_.client.hsetAsync(`deploy:${_.key}`, 'end', _.times))
            return Promise.all(tasks)   
        })
    }

    async save() {
        if (this.type === 'time_group') {
            return await this._saveToTimeGroup()
        }
        return false
    }

}

export default LogMsg
