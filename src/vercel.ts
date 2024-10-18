import Elysia from "elysia";

export const config = { runtime: 'edge' };

export const app = new Elysia({
    aot: false
})

app.get('/api', () => 'Hello from Elysia')
