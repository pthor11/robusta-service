import { CallReturn } from "./call"
import UUIDAPIKey from "uuid-apikey";
import { client, collectionNames, db } from "../mongo";

const user_api_key_create = async (params: { request: any }): Promise<CallReturn> => {
    const session = client.startSession()
    session.startTransaction()

    try {
        console.log({ params });

        const slug = params.request.params ? JSON.parse(params.request.params).slug : undefined

        console.log({ slug });

        const { apiKey } = UUIDAPIKey.create({ noDashes: false })

        console.log({ apiKey });

        const foundUser = await db.collection(collectionNames.users).findOne({ apiKey }, { session })

        console.log({ foundUser });

        if (!foundUser) {
            const { insertedId } = await db.collection(collectionNames.users).insertOne({ slug, apiKey, createAt: new Date() }, { session })

            console.log({ insertedId });

            await session.commitTransaction()
            session.endSession()

            return { result: apiKey }
        } else {
            await session.abortTransaction()
            session.endSession()
            return user_api_key_create(params)
        }
    } catch (e) {
        throw e
    }
}

export { user_api_key_create }