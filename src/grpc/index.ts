import { load } from "@grpc/proto-loader";
import { Server, ServerCredentials } from "grpc";
import { join } from "path";
import { port } from "../config";
import { call } from "./call";

const initGrpcServer = async () => {
    try {
        const opts = {
            keepCase: true,
            longs: String,
            enums: String,
            arrays: true,
            objects: true
        }

        const host = `0.0.0.0:${port}`

        const { BrickService } = await load(join(__dirname, "../../BrickService.proto"), opts) as any

        const grpc = new Server()

        grpc.addService(BrickService, { call })

        grpc.bind(host, ServerCredentials.createInsecure())

        grpc.start()

        console.log(`Server running at ${host}`)
    } catch (e) {
        throw e
    }
}

export { initGrpcServer }