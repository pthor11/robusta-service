import { IndexSpecification } from "mongodb"

type UtxoBB = {
    "n": number,
    "isAddress": boolean,
    "addresses": string[],
    "value": number
}

type TxBB = {
    "txid": string,
    "vin": UtxoBB[],
    "vout": UtxoBB[],
    "blockHash": string,
    "blockHeight": number,
    "confirmations": number,
    "blockTime": number,
    "value": string,
    "valueIn": string,
    "fees": string
}

const TxBBIndexes: IndexSpecification[] = [
    { key: { txid: 1 }, unique: true },
    { key: { blockHeight: 1 } },
]

export { TxBBIndexes, UtxoBB, TxBB }