
import redis from 'redis'
import 'babel-polyfill'
import { promisifyAll } from 'bluebird'
import { redis_conf } from '~/package.json'


class TimeGroup {
    
    constructor(_key) {
        let {port, host} = redis_conf 
        promisifyAll(redis.RedisClient.prototype)

        let _ = this
        _.client = redis.createClient(port, host)
        _.key = _key
        _.type = _key.split(':')[0]
        

        _.client.on('error', _err => {
            console.error(_err) 
        })
    }

    async list() {
        if (this.type === 'time_group') {
            return  await this._timeGroupList()
        }
        return []
    }

    async _timeGroupList() {
        let _ = this
        return await _.client.zrangeAsync(_.key, 0, -1)
            .then(_list => {
                return _list
            })
    }

}

export default TimeGroup
