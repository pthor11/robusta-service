import { Kafka} from "kafkajs";
import { coinKafkaConfig } from "./config";

const coinKafka = new Kafka({
    clientId: coinKafkaConfig.clientId,
    brokers: coinKafkaConfig.brokers?.split(',') || [],
    ssl: false,
    sasl: undefined,
    connectionTimeout: 5000,
    requestTimeout: 60000,
})

const coinProducer = coinKafka.producer({ allowAutoTopicCreation: true })

const connectCoinProducer = async () => {
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
    connectCoinProducer
}