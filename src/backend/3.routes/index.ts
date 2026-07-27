import { Hono,  } from 'hono'
export default new Hono()
  .get('/dunha', c => c.text('Hello Dunha!'))
  .route('/user', (await import('./user.ts')).default)
  .route('/auth', (await import('./auth.ts')).default)