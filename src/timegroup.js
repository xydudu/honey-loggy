
import redis from 'redis'
import moment from 'moment'
import _ from 'underscore'
import { promisifyAll } from 'bluebird'
import { load } from 'dotenv'

promisifyAll(redis.RedisClient.prototype)
promisifyAll(redis.Multi.prototype)

load({path: `${process.cwd()}/.env`})

const redisClient = redis.createClient(process.env.REDIS_SERVER_PORT, process.env.REDIS_SERVER_HOST)

redisClient.on('error', err => {
    console.error(err)
})

class TimeGroup {
    
    constructor(_key) {

        let _ = this
        _.client = redisClient

        if (_key && _key.indexOf(':') > 0) {
            _.key = _key
            _.type = _key.split(':')[0]
        }
        
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
                .then(_list => {
                    return _list.map((_item, _i) => {
                        let arr = []
                        let i = {}
                        _item.forEach(_step => {
                            if (isNaN(_step)) {
                                i.desc = _step
                            } else {
                                i.timestamp = _step
                                arr.push(i)
                                i = {}
                            }
                        })
                        arr.reduce((_start, _end) => {
                            _start.key = keys[_i]
                            _end.start = _start.timestamp
                            _end.end = _end.timestamp
                            return _end
                        })
                        return arr
                    })
                })
                //.then(_res => {
                //    return _res
                //})
                .catch(_err => {
                   console.log(`[err] ${_err}`)
                   return []
                })
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

    async getKeys(_day=moment().format('YYYYMMDD')) {
        let key = `time_group:${_day}`
        return await this.client.smembersAsync(key)
    }

    async calculateByDate(action_name, day=moment().format('YYYYMMDD')) {
        let key = `statistics:${action_name}:time_group:${day}`
        let isExistKey = await this.client.existsAsync(key)
        let now = moment().format('YYYYMMDD')

        // always calculate the latest data for `today`
        if (isExistKey && day !== now) {
            return await this.client.hgetallAsync(key)
        } else {
            let totaltimes = await this.actionsByTotaltime(action_name, day)
            totaltimes = totaltimes.map(item => {
                return item.total
            })

            if (!totaltimes.length) return {}
            let min_time = _.min(totaltimes)
            let max_time = _.max(totaltimes)
            let total_time = totaltimes.reduce((start, end) => {
                return start + end
            })
            let total_action = totaltimes.length
            let average_time = Math.ceil(total_time / total_action)
            try {
                let res = await this.client.hmsetAsync(key, 'average_time', average_time, 'min_time', min_time, 'max_time', max_time, 'total_time', total_time, 'total_action', total_action)

                if (res === 'OK') {
                    return await this.client.hgetallAsync(key)
                }
            } catch (err) {
                console.log(err)
            }
            return {}
        }
    }

}

export default TimeGroup
