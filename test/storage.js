
import assert from 'assert'
import redis from 'redis'
import LogMsg from '~/src/logmsg.js'
import TimeGroup from '~/src/timegroup.js'
import { redis_conf } from '~/package.json'


describe('Util', () => {
    
    let input = '[dollargan] A同学点击预览 [time_group:a1b2c3d4] [1479280006392]'
    let msg = new LogMsg(input)
    it('getKeyFromLog()', () => {
        let expect = msg.getKeyFromLog(input)
        assert.ok(expect === 'time_group:a1b2c3d4')
    })

    it('getTimestampFromLog()', () => {
        let expect = msg.getTimestampFromLog(input)
        assert.ok(expect === '1479280006392')
    })

    it('getAppnameFromLog()', () => {
        let expect = msg.getAppnameFromLog('[honey-loggly] test [time_group:1111] [1341237131213]')
        assert.ok(expect === 'honey-loggly')
    })

    it('getDescFromLog()', () => {
        let expect = msg.getDescFromLog(input)
        assert.ok(expect === 'A同学点击预览')
    })

})

describe('LogMsg', () => {
    
    it('save()', () => {
        let input = '[dollargan] A同学点击预览 [time_group:a1b2c3d4] [1479280006392]'
        let msg = new LogMsg(input)
        assert.ok(msg.type === 'time_group')
        assert.ok(msg.save())
    })

})

describe('TimeGroup', () => { 
    let key = 'time_group:a1b2c3d5'
    before(() => {
        new LogMsg('[dollargan] step1 [time_group:a1b2c3d5] [1479280006392]').save()
        new LogMsg('[maid] step2 [time_group:a1b2c3d5] [1479280016392]').save()
        new LogMsg('[hoobot] step3 [time_group:a1b2c3d5] [1479280026392]').save()
        new LogMsg('[dollargan] step4 [time_group:a1b2c3d5] [1479280106392]').save()
        new LogMsg('[hoobot] step5 [time_group:a1b2c3d5] [1479281006392]').save()
    }) 
    after(done => {
        let {port, host} = redis_conf 
        let c = redis.createClient(port, host)  
        c.flushall(done)
    })
    it('list()', async () => {
        let timeGroup = new TimeGroup(key)
        let list = await timeGroup.list()
        assert.equal(list.length, 5)
        assert.equal(list[2].timestamp, 1479280026392)
    })

})
