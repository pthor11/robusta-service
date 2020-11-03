import { config } from "dotenv";

config()

if (!process.env.MONGO_URI) throw new Error(`mongo uri must be provided`)
export const mongoUri = process.env.MONGO_URI

if (!process.env.PORT) throw new Error(`port must be provided`)
export const port = process.env.PORT

if (!process.env.BLOCK_INIT) throw new Error(`block init must be provided`)
export const blockInit = process.env.BLOCK_INIT

if (!process.env.BLOCK_CONFIRM) throw new Error(`block confirmations must be provided`)
export const blockConfirm = parseInt(process.env.BLOCK_CONFIRM)

if (!process.env.BLOCKBOOK) throw new Error(`blockbook api must be provided`)
export const blockbook = process.env.BLOCKBOOK

if (!process.env.KAFKA_CLIENT_ID) throw new Error(`Kafka client id must be provided`)
if (!process.env.KAFKA_GROUP_ID) throw new Error(`Kafka group id must be provided`)
if (!process.env.KAFKA_BROKERS) throw new Error(`Kafka brokers must be provided`)
if (process.env.KAFKA_MECHANISM && !process.env.KAFKA_USERNAME) throw new Error(`Kafka username must be provided with mechanism ${process.env.KAFKA_MECHANISM}`)
if (process.env.KAFKA_MECHANISM && !process.env.KAFKA_PASSWORD) throw new Error(`Kafka password must be provided with mechanism ${process.env.KAFKA_MECHANISM}`)

export const kafkaConfig = {
    clientId: process.env.KAFKA_CLIENT_ID,
    groupId: process.env.KAFKA_GROUP_ID,
    brokers: process.env.KAFKA_BROKERS,
    mechanism: process.env.KAFKA_MECHANISM,
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
    topic: {
        consume: { subscribe: 'subscribe' },
        produce: { change: 'change' }
    }
}

