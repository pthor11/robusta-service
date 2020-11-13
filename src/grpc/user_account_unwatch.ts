import { CallReturn } from "./call"
import { client, collectionNames, db } from "../mongo";
import { Currency, CurrencyType } from "../models/Currency";
import { Account } from "../models/Account";
import { coinProducer } from "../kafka";
import { coinKafkaConfig } from "../config";
import { tronweb } from "../tronweb";
import { WatchMessage } from "../models/WatchMessage";

type UserAccountWatchParams = {
    apiKey: string
    address: string
    currency: Currency
}

const user_account_unwatch = async (params: { request: any }): Promise<CallReturn> => {
    const session = client.startSession()
    session.startTransaction()

    try {
        console.log({ params });

        const _params: UserAccountWatchParams = JSON.parse(params?.request?.params || '')

        console.log({ _params });

        const foundUser = await db.collection(collectionNames.users).findOne({ apiKey: _params.apiKey }, { session })

        console.log({ foundUser });

        if (!foundUser) throw { error: 'user not found' }

        const foundAccount = await db.collection(collectionNames.accounts).findOneAndUpdate({ apiKey: _params.apiKey, address: _params.address, "currency.type": _params.currency.type, "currency.address": _params.currency.address }, { $set: { watch: false, updatedAt: new Date() } }, { session, returnOriginal: true })

        console.log({ foundAccount: foundAccount.value });

        if (!foundAccount.value) throw { error: 'account not found' }

        if (!(foundAccount.value as Account).watch) throw { error: 'account already unwatched' }

        const message: WatchMessage = {
            ..._params,
            watch: false
        }

        const stringifiedMessage = JSON.stringify(message)

        let topic: string

        switch (_params.currency.type) {
            case CurrencyType.trx:
            case CurrencyType.trc10:
            case CurrencyType.trc20:
                topic = coinKafkaConfig.topic.produce.trx
                break;

            default:
                break;
        }

        console.log({ topic: topic! });

        const record = await coinProducer.send({
            topic: topic!,
            messages: [{ value: stringifiedMessage }]
        })

        console.log({ record });

        await session.commitTransaction()
        session.endSession()

        return { result: 'success' }
    } catch (e) {
        await session.abortTransaction()
        session.endSession()

        if (e.code === 112) return user_account_unwatch(params)
        if (e.error) return e
        throw e
    }
}

export { user_account_unwatch }