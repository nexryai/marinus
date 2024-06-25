import fastify from "fastify"
import {logInfo} from "@/utils/log"

const server = fastify()

server.get("/ping", async (request, reply) => {
    console.log(request.ip)
    console.log(reply.log)
    return "pong\n"
})

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    logInfo(`Server listening at ${address}`)
})
