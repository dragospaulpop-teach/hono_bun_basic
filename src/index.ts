import { Hono } from 'hono'
import { jwt, sign } from 'hono/jwt'
import { logger } from 'hono/logger'
import { timing, setMetric, startTime, endTime } from 'hono/timing'

const app = new Hono()

app.use('*', logger())
app.use('*', timing())

app.use(
  '/api/*',
  jwt({
    secret: 'it-is-very-secret',
  })
)

app.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  startTime(c, 'db')
  // simulate database delay
  await wait(5000)
  if (username !== 'dragos' || password !== '1234') {
    return c.json({ message: 'Invalid credentials' }, 401)
  }
  const token = await sign({ sub: 'dragos', role: 'admin' }, 'it-is-very-secret') // sign the token
  endTime(c, 'db')
  return c.json({ token })
})
app.get('/api/page', (c) => {
  startTime(c, 'auth')
  const decoded = c.get('jwtPayload')
  endTime(c, 'auth')
  return c.json({ message: 'You are authorized', decoded } )
})

export default {
  port: 3000,
  fetch: app.fetch,
}

async function wait(howLong: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, howLong)
  })
}

