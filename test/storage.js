
import 'babel-polyfill'
import assert from 'assert'
import redis from 'redis'
import moment from 'moment'
import LogMsg from '~/src/logmsg.js'

require('dotenv').load({path: `${process.cwd()}/.env`})

describe('Util', () => {
    
    let input = '[dollargan] A同学点击预览 [time_group:a1b2c3d4] [1479280006392]'
    let msg = new LogMsg(input)
    it('getKeyFromLog()', () => {
        let expect = msg.getKeyFromLog(input)
        assert.ok(expect === 'time_group:a1b2c3d4')
    })

    it('getTimestampFromLog()', () => {
        let expect = msg.getTimestampFromLog(input)
        let input2 = '[dollargan] honey-loggly To B [time_group:1111] [1234] '
        let expect2 = msg.getTimestampFromLog(input2)
        assert.ok(expect === 1479280006392)
        assert.ok(expect2 === 1234)
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
    
    let c = redis.createClient(process.env.REDIS_SERVER_PORT, process.env.REDIS_SERVER_HOST)  
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

    it('save()', async () => {
        let input = ' [dollargan] A同学点击预览 [time_group:a1b2c3d4] [1479280006392]'
        let msg = new LogMsg(input)
        assert.ok(msg.type === 'time_group')
        assert.ok(await msg.save())

        let input2 = '[dollargan] honey-loggly To B [time_group:1111] [1234] '
        let msg2 = new LogMsg(input2)
        assert.ok(msg2.type === 'time_group')
        assert.ok(await msg2.save())
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

    describe('preview & deploy', () => {
        //after(done => {
        //    c.del('preview:time_group:8207078test', done)
        //})

        before(async () => {
            let msg = new LogMsg('[dollargan] 收到预览请求 [time_group:8207078test][1481875920667]')
            let msg2 = new LogMsg('[dollargan] step2 [time_group:8207078test][1481875920668]')
            await msg.save()
            await msg2.save()
        })
        
        it('preview', done => {
            
            c.exists(`preview:time_group:8207078test`, async (_err, _res) => {
                assert.ok(_res) 
                c.hget('preview:time_group:8207078test', 'end', (_err, _res) => {
                    assert.equal(parseInt(_res), 1481875920668)
                    done(_err)
                })
            })
        })
    })


})

