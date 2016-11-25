import 'babel-polyfill'
import assert from 'assert'
import redis from 'redis'
import moment from 'moment'
import TimeGroup from '~/src/timegroup.js'
import LogMsg from '~/src/logmsg.js'
import { redis_conf } from '~/package.json'


describe('TimeGroup', () => { 
    let key = 'time_group:a1b2c3d5'
    let now = moment().format('YYYYMMDD')
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
        c.del(`time_group:${now}`, () => {
            c.del('time_group:a1b2c3d5', () => {
                c.del('time_group:a1b2c3d4', () => {
                    done()
                })
            })
        })
    })
    it('list()', async () => {
        let timeGroup = new TimeGroup(key)
        let list = await timeGroup.list()
        assert.equal(list[0].start, undefined)
        assert.equal(list.length, 5)
        assert.equal(list[4].end, 1479281006392)
    })

    it('getKeys()', async () => {
        let timegroup = new TimeGroup()
        let keys = await timegroup.getKeys() 
        assert.equal(keys.length, 1)
        assert.equal(keys[0], 'time_group:a1b2c3d5')
    })

})
