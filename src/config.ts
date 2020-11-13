import { config } from "dotenv";

config()

if (!process.env.MONGO_URI) throw new Error(`mongo uri must be provided`)
export const mongoUri = process.env.MONGO_URI

if (!process.env.PORT) throw new Error(`port must be provided`)
export const port = process.env.PORT

if (!process.env.COIN_KAFKA_CLIENT_ID) throw new Error(`Kafka client id must be provided`)
if (!process.env.COIN_KAFKA_BROKERS) throw new Error(`Kafka brokers must be provided`)

export const coinKafkaConfig = {
    clientId: process.env.COIN_KAFKA_CLIENT_ID,
    brokers: process.env.COIN_KAFKA_BROKERS,
    topic: {
        consume: {},
        produce: { watch: 'watch' }
    }
}

