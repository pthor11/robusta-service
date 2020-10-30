import { EachMessagePayload, Kafka, SASLMechanism } from "kafkajs";
import { kafkaConfig } from "./config";
import { subscribe } from "./service/subscribe";

const kafka = new Kafka({
    clientId: kafkaConfig.clientId,
    brokers: kafkaConfig.brokers?.split(',') || [],
    ssl: kafkaConfig.mechanism ? true : false,
    sasl: kafkaConfig.mechanism && kafkaConfig.username && kafkaConfig.password ? {
        mechanism: kafkaConfig.mechanism as SASLMechanism,
        username: kafkaConfig.username,
        password: kafkaConfig.password,
    } : undefined,
    connectionTimeout: 5000,
    requestTimeout: 60000,
})

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: kafkaConfig.groupId })

const connectKafkaProducer = async () => {
    try {
        await producer.connect()

        console.log(`Kafka: producer connected`)
    } catch (e) {
        console.error(`Kafka: producer disconnected`)
        throw e
    }
}

const connectKafkaConsumer = async () => {
    try {
        await consumer.connect()

        console.log(`Kafka: consumer connected`)

        for (const key of Object.keys(kafkaConfig.topic.consume)) {
            const topic = kafkaConfig.topic.consume[key]

            await consumer.subscribe({ topic, fromBeginning: true })

            console.log(`Kafka: consumer subcribed topic ${topic}`)
        }

        await consumer.run({
            eachMessage: async (payload: EachMessagePayload) => {
                try {
                    const { topic, message } = payload
                    switch (topic) {
                        case kafkaConfig.topic.consume.subscribe:
                            await subscribe({ message })
                            break;
                        default:
                            throw new Error(`${topic} not supported`)
                    }
                } catch (e) {
                    console.error(e)
                }
            }
        })
    } catch (e) {
        console.error(`Kafka: consumer disconnected`)
        throw e
    }
}

export {
    producer,
    consumer,
    connectKafkaProducer,
    connectKafkaConsumer
}