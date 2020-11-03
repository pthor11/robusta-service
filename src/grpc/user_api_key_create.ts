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

        const apiInfo = UUIDAPIKey.create({ noDashes: false })

        console.log({ apiInfo });

        const foundUser = await db.collection(collectionNames.users).findOne({ uuid: apiInfo.uuid }, { session })

        console.log({ foundUser });

        if (!foundUser) {
            const { insertedId } = await db.collection(collectionNames.users).insertOne({ slug, ...apiInfo, createAt: new Date() }, { session })

            console.log({insertedId});
            
            await session.commitTransaction()
            session.endSession()

            return { result: apiInfo.apiKey }
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