
import redis from 'redis'
import moment from 'moment'
import { promisifyAll } from 'bluebird'
import { redis_conf } from '~/package.json'


class TimeGroup {
    
    constructor(_key) {
        let {port, host} = redis_conf 
        promisifyAll(redis.RedisClient.prototype)
        promisifyAll(redis.Multi.prototype);

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

    async listActionsByStep (_day) {
        let _ = this
        let keys = await _.getKeys(_day)
        let multi = _.client.multi()
        for(let i = 0, l = keys.length; i < l; i ++) {
            let key = keys[i] 
            multi.zrange(key, 0, -1, 'withscores')
        }

        return multi.execAsync()
            //.then(_res => {
            //    return _res 
            //})
            //.catch(_err => {
            //    console.log(`[err] ${_err}`)
            //    return []
            //}) 
    }

    async actions(_key) {
        let _ = this
        return _.client.hmgetAsync(_key, 'start', 'end')
    }

    async actionsByTotaltime(_action_name, _day) {
        let _ = this
        let keys = await _.getKeys(_day) 
        let multi = _.client.multi()
        for(let i = 0, l = keys.length; i < l; i ++) {
            let key = keys[i]
            multi.hmget(`${_action_name}:${key}`, 'start', 'end')
        }
        return multi.execAsync()
            .then(_res => {
                return _res.map((_item, _i) => {
                    let start = parseInt(_item[0]) || 0
                    let end = parseInt(_item[1]) || 0
                    return {
                        start: start,
                        total: end - start,
                        key: keys[_i]
                    } 
                }).filter(_item => {
                    return _item.start > 0
                }).sort((_a, _b) => {
                    return _a.start - _b.start
                })
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
