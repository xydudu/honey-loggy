
import net from 'net'
import express from 'express'

import TimeGroup from '~/src/timegroup.js'

const app = express()

app.use(express.static(`${process.cwd()}/public`))

app.get('/', (req, res) => {
    res.send('hello world')
})

app.get('/timegroup/list', async (_req, _res) => {
    let keys = await new TimeGroup().getKeys()
    let result = []
    while(keys.length) {
        let list = new TimeGroup(keys.shift())
        list = await list.list()
        result.push(list)
    }
    _res.json(result) 
})

export default app
