
import net from 'net'
import express from 'express'
import moment from 'moment'

import TimeGroup from '~/src/timegroup.js'

const app = express()
//const router = app.Router()

app.use(express.static(`${process.cwd()}/public`))

app.get('/', (req, res) => {
    res.send('hello world')
})

app.get('/timegroup/list', async (_req, _res, _next) => {
    _req.params.day = 'today'
    return await list(_req, _res, _next)
})
app.get('/timegroup/list/:day', list)


async function list(_req, _res, _next) {
    let day = _req.params.day
    if (day === 'today') day = moment().format('YYYYMMDD')
    else if (day === 'yesterday') day = moment().add(-1, 'days').format('YYYYMMDD')
    else day = false
    let result = await new TimeGroup().listActionsByStep(day)
    //let keys = await new TimeGroup().getKeys(day)
    //let result = []
    //while(keys.length) {
    //    let list = new TimeGroup(keys.shift())
    //    list = await list.list()
    //    result.push(list)
    //}
    _res.json(result) 
}

app.get('/timegroup/actions/:days', async (_req, _res, _next) => {
    let days = parseInt(_req.params.days) || 30
    let callback = _req.query.callback
    let result = {
        days: [],
        actions: []
    }
    while (days --) {
        let day = moment().add(-days, 'days').format('YYYYMMDD')
        let keys = await  new TimeGroup().getKeys(day)
        result.days.push(day)
        result.actions.push(keys.length)
    }
    _res.jsonp(result)
})

app.get('/timegroup/:action/totaltime/:day', async (_req, _res, _next) => {
    let action_name = _req.params.action
    let day = _req.params.day
    if (day === 'today') day = moment().format('YYYYMMDD')
    if (day === 'yesterday') day = moment().add(-1, 'days').format('YYYYMMDD')
    let result = await new TimeGroup().actionsByTotaltime(action_name, day)
    _res.jsonp(result)
})

export default app
