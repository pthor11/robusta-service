import { CallReturn } from "./call"
import { client, collectionNames, db } from "../mongo";
import { Currency, CurrencyType } from "../models/Currency";
import { coinProducer } from "../kafka";
import { coinKafkaConfig } from "../config";
import { tronweb } from "../tronweb";
import { WatchMessage } from "../models/WatchMessage";

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

        if (!foundUser) throw { error: 'user not found' }

        // check address valid
        switch (_params.currency.type) {
            case CurrencyType.trx:
            case CurrencyType.trc10:
            case CurrencyType.trc20:
                if (!tronweb.isAddress(_params.address)) throw { error: 'invalid account address' }
                break;
            default: throw { error: `currency type ${_params.currency.type} not support` }
        }

        // check currency valid
        switch (_params.currency.type) {
            case CurrencyType.trc10:
                if (Number.isNaN(parseInt(_params.currency.address))) throw new Error(`${_params.currency.address} is invalid contract type trc10 address`)
                break
            case CurrencyType.trc20:
                if (!tronweb.isAddress(_params.address)) throw new Error(`${_params.currency.address} is invalid contract type trc20 address`)
                break;
            default:
                break;
        }


        const foundAccount = await db.collection(collectionNames.accounts).findOne({ apiKey: _params.apiKey, address: _params.address, "currency.type": _params.currency.type, "currency.address": _params.currency.address }, { session })

        console.log({ foundAccount });

        if (foundAccount) throw { error: 'account already watched' }

        await db.collection(collectionNames.accounts).insertOne({ ..._params, watch: true, createdAt: new Date() }, { session })

        await session.commitTransaction()
        session.endSession()

        const message: WatchMessage = {
            ..._params,
            watch: true
        }

        const stringifiedMessage = JSON.stringify(message)

        const record = await coinProducer.send({
            topic: coinKafkaConfig.topic.produce.watch,
            messages: [{ value: stringifiedMessage }]
        })

        console.log({ record });

        return { result: stringifiedMessage }
    } catch (e) {
        await session.abortTransaction()
        session.endSession()

        if (e.code === 112) return user_account_watch(params)
        if (e.error) return e
        throw e
    }
}

export { user_account_watch }