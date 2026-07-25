import index from './src/index2.html'

const srv = Bun.serve({
  routes: {
    '/*': index,
  },
})

console.log(`Server running at ${srv.protocol}://${srv.hostname}:${srv.port}`)