import { connect, Db, MongoClient } from "mongodb";
import { mongoUri } from "./config";
import { AccountIndexes } from "./models/Account";
import { BlockBBIndexes } from "./models/Block.BB";
import { CurrencyIndexes } from "./models/Currency";
import { SyncIndexes } from "./models/Sync";
import { TxBBIndexes } from "./models/Tx.BB";
import { UserIndexes } from "./models/User";

let client: MongoClient
let db: Db

const collectionNames = {
    syncs: 'syncs',
    users: 'users',
    txs: 'txs',
    accounts: 'accounts',
    currencies: 'currencies',
    // changes: 'changes'
}

const connectDb = async () => {
    try {
        client = await connect(mongoUri, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            ignoreUndefined: true
        })

        client.on('error', async (e) => {
            try {
                await client.close()
                await connectDb()
            } catch (e) {
                setTimeout(connectDb, 1000)
                throw e
            }
        })

        client.on('timeout', async () => {
            try {
                await client.close()
                await connectDb()
            } catch (e) {
                setTimeout(connectDb, 1000)
                throw e
            }
        })

        client.on('close', async () => {
            try {
                await connectDb()
            } catch (e) {
                throw e
            }
        })

        db = client.db()

        await Promise.all([
            db.collection(collectionNames.syncs).createIndexes(SyncIndexes),
            db.collection(collectionNames.users).createIndexes(UserIndexes),
            db.collection(collectionNames.accounts).createIndexes(AccountIndexes),
            db.collection(collectionNames.currencies).createIndexes(CurrencyIndexes),
            db.collection(collectionNames.txs).createIndexes(TxBBIndexes)
        ])

        console.log(`Mongodb: connected`)
    } catch (e) {
        console.error(`Mongodb: disconnected`)
        await client?.close(true)
        setTimeout(connectDb, 1000)
        throw e
    }
}

export {
    client,
    db,
    connectDb,
    collectionNames
}