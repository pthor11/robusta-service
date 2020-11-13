import { CallReturn } from "./call"
import { client, collectionNames, db } from "../mongo";
import { Currency, CurrencyType } from "../models/Currency";
import { coinProducer } from "../kafka";
import { coinKafkaConfig } from "../config";
import { tronweb } from "../tronweb";

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
        switch (_params.currency.type) {
            case CurrencyType.trx:
            case CurrencyType.trc10:
            case CurrencyType.trc20:
                if (!tronweb.isAddress(_params.address)) throw new Error(`invalid account address`)
                break;
            default:
                break;
        }

        // check currency valid
        switch (_params.currency.type) {
            case CurrencyType.trc10:
                if (!Number.isNaN(parseInt(_params.currency.address))) throw new Error(`${_params.currency.address} is invalid contract type trc10 address`)
                break
            case CurrencyType.trc20:
                if (!tronweb.isAddress(_params.address)) throw new Error(`${_params.currency.address} is invalid contract type ${_params.currency.type} address`)
                break;
            default:
                break;
        }


        const foundAccount = await db.collection(collectionNames.accounts).findOne({}, { session })

        if (foundAccount) throw { code: 'account already watched' }

        await db.collection(collectionNames.accounts).insertOne({}, { session })

        await session.commitTransaction()
        session.endSession()

        const record = await coinProducer.send({
            topic: coinKafkaConfig.topic.produce.watch,
            messages: [{ value: JSON.stringify(_params) }]
        })

        console.log({ record });

        return { result: 'success' }
    } catch (e) {
        await session.abortTransaction()
        session.endSession()

        if (e.code === 112) return user_account_watch(params)
        throw e
    }
}

export { user_account_watch }