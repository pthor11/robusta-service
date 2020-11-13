import { connectDb } from "./mongo"
import { initGrpcServer } from "./grpc"
import { connectCoinProducer } from "./kafka"

const start = async () => {
    try {
        await connectDb()
        await initGrpcServer()
        await connectCoinProducer()
    } catch (e) {
        throw e
    }
}

start()