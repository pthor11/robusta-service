import { CallReturn } from "./call"
import { client, collectionNames, db } from "../mongo";
import { Currency } from "../models/Currency";

type UserAccountWatchParams = {
    apiKey: string
    address: string
    currency: Currency
}

const user_account_watch = async (params: { request: any }): Promise<CallReturn> => {
    const session = client.startSession()
    session.startTransaction()

    try {
        console.log({ params });

        const _params: UserAccountWatchParams = JSON.parse(params?.request?.params || '')

        console.log({ _params });

        const foundUser = await db.collection(collectionNames.users).findOne({ apiKey: _params.apiKey }, { session })

        console.log({ foundUser });

        if (!foundUser) throw { code: 'user not found' }

        // check address valid

        // check currency valid

        const foundAccount = await db.collection(collectionNames.accounts).findOne({}, { session })

        if (foundAccount) throw { code: 'account already watched' }

        await db.collection(collectionNames.accounts).insertOne({}, { session })

        await session.commitTransaction()
        session.endSession()

        return { result: 'success' }
    } catch (e) {
        await session.abortTransaction()
        session.endSession()

        if (e.code === 112) return user_account_watch(params)
        throw e
    }
}

export { user_account_watch }