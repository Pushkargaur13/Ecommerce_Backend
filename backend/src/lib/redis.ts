import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST ?? '127.0.0.1',
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.on('error', (err) => {
  console.error('Redis error', err);
});

redis.on('ready', ()=>{
    console.log("Redis Client Started")
})

export default redis;
