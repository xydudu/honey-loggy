
import 'babel-polyfill'
import assert from 'assert'
import redis from 'redis'
import moment from 'moment'
import LogMsg from '~/src/logmsg.js'
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
        assert.equal(expect, 'A同学点击预览')
    })

})

describe('LogMsg', () => {
    
    let {port, host} = redis_conf 
    let c = redis.createClient(port, host)  
    let now = moment().format('YYYYMMDD')

    after(done => {
        c.del(`time_group:${now}`, () => {
            c.del('time_group:a1b2c3d4', () => {
                c.del('time_group:1111', () => {
                    done()
                })
            })
        })
    })

    it('save()', () => {
        let input = ' [dollargan] A同学点击预览 [time_group:a1b2c3d4] [1479280006392]'
        let msg = new LogMsg(input)
        assert.ok(msg.type === 'time_group')
        assert.ok(msg.save())

        let input2 = '[dollargan] honey-loggly To B [time_group:1111] [1234] '
        let msg2 = new LogMsg(input2)
        assert.ok(msg2.type === 'time_group')
        assert.ok(msg2.save())
    })
        
    it('check keys', done => {
        c.exists(`time_group:${now}`, (_err, _res) => {
            assert.ok(!_err)
            assert.ok(_res)
            c.smembers(`time_group:${now}`, (_err, _res) => {
                assert.ok(_res.length > 1)
                done()
            })
        })
    })


})

