
import net from 'net'
import express from 'express'
import moment from 'moment'
import logger from 'morgan'
import _ from 'underscore'

import TimeGroup from '~/src/timegroup.js'

const app = express()
//const router = app.Router()

app.use(express.static(`${process.cwd()}/public`))
app.use(logger('dev'))

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
    else day = undefined
    let result = await new TimeGroup().listActionsByStep(day)
    //result = result.map(_item => {
    //})
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
    let days = Math.abs(+ _req.params.days) || 30
    let callback = _req.query.callback
    let result = {
        days: [],
        actions: []
    }
    while (days --) {
        let day = moment().add(-days, 'days').format('YYYYMMDD')
        let keys = await new TimeGroup().getKeys(day)
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

app.get('/timegroup/:action/statistics/:day', async (req, res, next) => {
    let action_name = req.params.action
    let day = req.params.day
    if (day === 'today') day = moment().format('YYYYMMDD')
    if (day === 'yesterday') day = moment().add(-1, 'days').format('YYYYMMDD')
    let result = await new TimeGroup().calculateByDate(action_name, day)

    // add temporary properties for client use
    if (!_.isEmpty(result)) {
        result.action_name = action_name
        result.day = day
    }
    res.jsonp(result)
})

app.get('/timegroup/:action/statistics', async (req, res, next) => {
    let action_name = req.params.action
    let days = Math.abs(+ req.query.days) || 7
    let result = []

    while (days --) {
        let day = moment().add(-days, 'days').format('YYYYMMDD')
        let item = await new TimeGroup().calculateByDate(action_name, day)
        if (!_.isEmpty(item)) {
            item.action_name = action_name
            item.day = day
        }
        result.push(item)
    }
    res.jsonp(result)
})

export default app
