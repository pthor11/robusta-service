import { IndexSpecification } from "mongodb"

const ChangeType = {
    send: 'send',
    received: 'received'
}

type Change = {
    type: string
    address: string
    txid: string
    n: number
    value: number
    blockTime: Date
    blockNumber: number
}

const ChangeIndexes: IndexSpecification[] = [
    { key: { address: 1 } },
    { key: { address: 1, txid: 1, n: 1 }, unique: true }
]

export { Change, ChangeType, ChangeIndexes }