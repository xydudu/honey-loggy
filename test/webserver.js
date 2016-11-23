
import supertest from 'supertest'
import webserver from '~/src/web-server.js'

const agent = supertest(webserver)

describe('API:timegroup', () => {
    it('/timegroup/list', done => {
    
    agent.get('/timegroup/list') 
        .expect(200)
        .end((_err, _res) => {
            if (_err) return done(_err) 
            done()
        })
    })
})
