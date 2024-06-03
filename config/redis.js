const redis =  require ("redis")

const redisClient = async ()=>{
    const client = redis.createClient()

    client.on("error", error => console.log("redis error ", error))
    const connect =  await client.connect()
    return connect
}

module.exports = {redisClient}