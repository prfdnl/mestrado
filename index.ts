import index from './src/index2.html'

const srv = Bun.serve({
  port: 3001,
  routes: {
    '/*': index,
  },
})

console.log(`Server running at ${srv.protocol}://${srv.hostname}:${srv.port}`)