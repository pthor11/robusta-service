import { KafkaMessage } from "kafkajs"
import { Account } from "../models/Account";
import { Currency, CurrencyType, CurrencyTypes } from "../models/Currency";
import { client, collectionNames, db } from "../mongo";

type SubscribeData = {
    address: string
    currency: {
        address: string,
        type: string
    }
}

const subscribe = async (params: { message: KafkaMessage }) => {
    const session = client.startSession()
    session.startTransaction()

    try {
        // console.log({ subscribe: params });
        const { value } = params.message

        if (!value) throw new Error(`kafka message value null`)

        const subData: SubscribeData = JSON.parse(value.toString())

        console.log({ subData });

        if (!subData.address) throw new Error(`account address not found in message`)
        if (!subData.currency) throw new Error(`currency object not found in message`)

        const subCurrency = subData.currency
        if (!CurrencyTypes.includes(subCurrency.type)) throw new Error(`invalid currency type`)

        const foundCurrency: Currency | null = await db.collection(collectionNames.currencies).findOne({ type: subCurrency.type, address: subCurrency.address }, { session })

        if (!foundCurrency) {
            await db.collection(collectionNames.currencies).insertOne({ ...subCurrency, watch: true, createdAt: new Date() }, { session })
            console.log(`inserted currency type ${subCurrency.type} address ${subCurrency.address} to watch`)
        } else {
            if (!foundCurrency.watch) {
                await db.collection(collectionNames.currencies).updateOne({ _id: foundCurrency._id }, { watch: true, updatedAt: new Date() }, { session })
                console.log(`updated currency type ${subCurrency.type} address ${subCurrency.address} for watching`)
            } else {
                console.log(`watched currency type ${subCurrency.type} address ${subCurrency.address} already`);
            }
        }

        const foundAccount: Account | null = await db.collection(collectionNames.accounts).findOne({ address: subData.address, "currency.type": subCurrency.type, "currency.address": subCurrency.address }, { session })

        if (!foundAccount) {
            await db.collection(collectionNames.accounts).insertOne({ ...subData, watch: true, createdAt: new Date() }, { session })
            console.log(`inserted account ${subData.address} with currency type ${subCurrency.type} address ${subCurrency.address} to watch`)
        } else {
            if (!foundAccount.watch) {
                await db.collection(collectionNames.accounts).updateOne({ _id: foundAccount._id }, { watch: true, updatedAt: new Date() }, { session })
                console.log(`updated account ${subData.address} with currency type ${subCurrency.type} address ${subCurrency.address} for watching`)
            } else {
                console.log(`watched account ${subData.address} with currency type ${subCurrency.type} address ${subCurrency.address} already`)
            }
        }

        await session.commitTransaction()
        session.endSession()
    } catch (e) {
        await session.abortTransaction()
        session.endSession()

        if (e.code === 112) return subscribe(params)

        throw e
    }
}

export { subscribe }