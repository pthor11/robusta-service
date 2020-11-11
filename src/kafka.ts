import { EachMessagePayload, Kafka, SASLMechanism, Transaction } from "kafkajs";
import { kafkaConfig } from "./config";

const coinKafka = new Kafka({
    clientId: kafkaConfig.clientId,
    brokers: kafkaConfig.brokers?.split(',') || [],
    ssl: false,
    sasl: undefined,
    connectionTimeout: 5000,
    requestTimeout: 60000,
})

const coinProducer = coinKafka.producer({ allowAutoTopicCreation: true })

const connectKafkaProducer = async () => {
    try {
        await coinProducer.connect()

        console.log(`coin producer connected`)
    } catch (e) {
        console.error(`coin producer disconnected`)
        throw e
    }
}

export {
    coinProducer,
    connectKafkaProducer
}