import axios from "axios"
import { blockbook, blockInit, kafkaConfig } from "../config"
import { producer } from "../kafka"
import { Change, ChangeType } from "../models/Change"
import { UtxoBB, TxBB } from "../models/Tx.BB"
import { Sync } from "../models/Sync"
import * as https from 'https'
import { collectionNames, db } from "../mongo"


const downloadBlockData = async (_blockNumber: number, _page: number = 1, _txs: any[] = []): Promise<TxBB[]> => {
    try {
        console.log({ downloadBlockData: { _blockNumber, _page, _txs: _txs.length } });

        const { data } = await axios.get(`${blockbook}/api/v2/block/${_blockNumber}?page=${_page}`, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) })
        const { page, totalPages, txs } = data

        const total = [..._txs, ...txs]

        return page === totalPages ? total : downloadBlockData(_blockNumber, _page + 1, total)
    } catch (e) {
        if (!e.response?.data?.error?.includes('Block not found')) throw e
        return []
    }
}

const processUtxo = async (_utxo: UtxoBB, _type: string, _tx: TxBB): Promise<Change | null> => {
    try {
        if (!_utxo.isAddress) return null

        const address = _utxo.addresses[0]

        const found = await db.collection(collectionNames.accounts).findOne({ address })

        if (!found) return null

        const change: Change = {
            address,
            type: ChangeType.send,
            txid: _tx.blockHash,
            n: _utxo.n,
            value: Number(_utxo.value) * (_type === ChangeType.send ? - 1 : 1),
            blockTime: new Date(_tx.blockTime * 1000),
            blockNumber: _tx.blockHeight
        }

        console.log({ change });

        return change
    } catch (e) {
        throw e
    }
}

const processUtxos = async (_utxos: UtxoBB[], _type: string, _tx: TxBB): Promise<Change[]> => {
    try {
        const processedChanges = await Promise.all(_utxos.map(_utxo => processUtxo(_utxo, _type, _tx)))

        // console.log({ processedChanges: processedChanges.length });

        const changes = processedChanges.reduce((_total: Change[], _change: Change | null) => _change ? [..._total, _change] : _total, [])

        // console.log({ changes: changes.length });

        return changes
    } catch (e) {
        throw e
    }
}


const processTx = async (_tx: TxBB): Promise<Change[]> => {
    try {
        const [sendChanges, receivedChanges] = await Promise.all([
            processUtxos(_tx.vin, ChangeType.send, _tx),
            processUtxos(_tx.vout, ChangeType.received, _tx)
        ])

        console.log({ sendChanges, receivedChanges });


        const changes = [...sendChanges, ...receivedChanges]

        console.log({ _tx: _tx.txid, changes });

        return changes
    } catch (e) {
        throw e
    }
}


const processTxs = async (_txs: TxBB[]) => {

    try {

        const changes_arr = await Promise.all(_txs.map(_tx => processTx(_tx)))

        const changes = changes_arr.reduce((_total, _changes) => _changes.length > 0 ? [..._total, ..._changes] : _total, [])

        console.log({ changes });

        return changes
    } catch (e) {

        throw e
    }
}

const syncBlock = async () => {
    try {
        const sync = await db.collection(collectionNames.syncs).findOne({}) as Sync

        console.log({ sync });

        // let changes: Change[]

        let txs: TxBB[]

        if (!sync) {
            const initSync: Sync = {
                blockNumber: parseInt(blockInit),
                createdAt: new Date()
            }

            console.log({ initSync });

            const { insertedId } = await db.collection(collectionNames.syncs).insertOne(initSync)

            console.log({ insertedId });

            txs = await downloadBlockData(initSync.blockNumber)

            console.log({ txs: txs.length });

            // changes = await processTxs(txs)

        } else {

            if (sync.blockNumber === parseInt(blockInit) + 100) {
                console.log('DONE');
                process.exit(1)
            }

            txs = await downloadBlockData(sync.blockNumber + 1)

            console.log({ txs: txs.length });

            // changes = await processTxs(txs)
        }

        if (txs.length > 0) await db.collection('txs').insertMany(txs)

        // console.log({ changes });

        // for (const change of changes) {
        //     const record = await producer.send({ topic: change.address, messages: [{ value: JSON.stringify(change) }] })
        //     console.log({ record });
        // }

        if (sync) {
            const updatedSync = await db.collection(collectionNames.syncs).findOneAndUpdate({ _id: sync._id }, { $set: { blockNumber: sync.blockNumber + 1, updatedAt: new Date } }, { returnOriginal: false })

            console.log({ updatedSync: updatedSync.value });
        }

        setTimeout(syncBlock, 1000)

    } catch (e) {

        throw e
    }
}

export { syncBlock }

// https://bch1.trezor.io/api/v2/block/479469?page=39
// downloadBlockData(479469).then(data => console.log(data.length)).catch(console.error)