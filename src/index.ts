import { initGrpcServer } from "./grpc"
import { connectKafkaConsumer, connectKafkaProducer } from "./kafka"
import { connectDb } from "./mongo"
import { syncBlock } from "./service/syncBlocks"

const start = async () => {
    try {
        await connectDb()
        // await initGrpcServer()
        // await connectKafkaProducer()
        // await connectKafkaConsumer()
        await syncBlock()
    } catch (e) {
        throw e
    }
}

start()