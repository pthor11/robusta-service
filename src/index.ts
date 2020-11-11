import { connectDb } from "./mongo"
import { initGrpcServer } from "./grpc"
// import { connectKafkaConsumer, connectKafkaProducer } from "./kafka"
// import { processTxs } from "./service/processTxs"
// import { syncBlock } from "./service/syncBlocks"

const start = async () => {
    try {
        // await connectKafkaProducer()
        await connectDb()
        await initGrpcServer()
        // await initCache()
        // await processTxs()
        
    
        // await connectKafkaConsumer()
        // await syncBlock()
    } catch (e) {
        throw e
    }
}

start()