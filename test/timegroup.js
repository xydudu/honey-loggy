import 'babel-polyfill'
import assert from 'assert'
import redis from 'redis'
import moment from 'moment'
import TimeGroup from '~/src/timegroup.js'
import LogMsg from '~/src/logmsg.js'

require('dotenv').load({path: `${process.cwd()}/.env`})

describe('TimeGroup', () => { 
    let key = 'time_group:3688853'
    let now = moment().format('YYYYMMDD')
    before(() => {
        new LogMsg('[dollargan] 收到预览请求 [time_group:3688853][1484042135838]').save()
        new LogMsg('[dollargan] 开始刷新缓存 [time_group:3688853][1484042136404]').save()
        new LogMsg('[maid]info:Accept $gan time is Tue Jan 10 2017 17:55:36 GMT+0800 (CST)[time_group:3688853][1484042136406]').save()
        new LogMsg('[maid]info:Deal finish $gan DATA time is Tue Jan 10 2017 17:55:37 GMT+0800 (CST)[time_group:3688853][1484042137602]').save()
        new LogMsg('[maid]info:Total time: 1484042137602ms[time_group:3688853][1484042137602]').save()
        new LogMsg('[dollargan] 成功刷新缓存 [time_group:3688853][1484042137603]').save()
        new LogMsg('[dollargan] 成功返回预览地址【http://10.200.8.234:15031/page/channel/comic-index.html】 [time_group:3688853][1484042137605]').save()
        new LogMsg('[dollargan] 收到预览请求 [time_group:3763970][1484042174602]').save()
        new LogMsg('[dollargan] 开始刷新缓存 [time_group:3763970][1484042175471]').save()
        new LogMsg('[maid]info:Accept $gan time is Tue Jan 10 2017 17:56:15 GMT+0800 (CST)[time_group:3763970][1484042175473]').save()
        new LogMsg('[maid]info:Deal finish $gan DATA time is Tue Jan 10 2017 17:56:15 GMT+0800 (CST)[time_group:3763970][1484042175892]').save()
        new LogMsg('[maid]info:Total time: 1484042175892ms[time_group:3763970][1484042175892]').save()
        new LogMsg('[dollargan] 成功刷新缓存 [time_group:3763970][1484042175893]').save()
        new LogMsg('[dollargan] 成功返回预览地址【http://10.200.8.234:15031/page/channel/comic-index.html】 [time_group:3763970][1484042175895]').save()
    }) 
    after(done => {
        let c = redis.createClient(process.env.REDIS_SERVER_PORT, process.env.REDIS_SERVER_HOST)  
        c.del(`time_group:${now}`, 'time_group:3688853','time_group:3763970', 'preview:time_group:3688853', 'preview:time_group:3763970', () => {
            c.del(`statistics:preview:time_group:${now}`, () => {
                done()
            })
        })
    })
    it('list()', async () => {
        let timeGroup = new TimeGroup(key)
        let list = await timeGroup.list()
        assert.equal(list[1].start, 1484042135838)
        assert.equal(list.length, 7)
        assert.equal(list[6].end, 1484042137605)
    })

    it('getKeys()', async () => {
        let timegroup = new TimeGroup()
        let keys = await timegroup.getKeys() 
        assert.equal(keys.length, 2)
        assert.equal(keys[0], 'time_group:3688853')
    })

    it('calculateByDate()', async () => {
        let timegroup = new TimeGroup()
        let result =  await timegroup.calculateByDate('preview', now)
        assert.equal(result.average_time, 1530)
        assert.equal(result.total_action, 2)
        assert.equal(result.total_time, 3060)
    })

})
