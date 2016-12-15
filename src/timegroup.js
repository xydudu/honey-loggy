
import redis from 'redis'
import moment from 'moment'
import { promisifyAll } from 'bluebird'
import { redis_conf } from '~/package.json'


class TimeGroup {
    
    constructor(_key) {
        let {port, host} = redis_conf 
        promisifyAll(redis.RedisClient.prototype)

        let _ = this
        _.client = redis.createClient(port, host)

        if (_key && _key.indexOf(':') > 0) {
            _.key = _key
            _.type = _key.split(':')[0]
        }
        

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
        return await _.client.zrangeAsync(_.key, 0, -1, 'withscores')
            .then(_list => {
                let arr = []
                let i = {}
                _list.forEach(_item => {
                    if (isNaN(_item)) {
                        i.desc = _item 
                    } else {
                        i.timestamp = _item
                        arr.push(i)
                        i = {}
                    }
                })
                
                arr.reduce((_start, _end) => {
                    _start.key = _.key
                    _end.start = _start.timestamp
                    _end.end = _end.timestamp
                    return _end
                })
                return arr
            })
            .catch(_err => {
                console.log(`[err] ${_err}`)
                return []
            })
    }

    async getKeys(_day) {
        let now = moment().format('YYYYMMDD')
        let day = _day || now
        let key = `time_group:${day}`
        return await this.client.smembersAsync(key)
    }

}

export default TimeGroup
