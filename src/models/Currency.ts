import { IndexSpecification, ObjectID } from "mongodb";

const CurrencyType = {
    btc: 'btc',
    bch: 'bch',
    ltc: 'ltc',
    eth: 'eth',
    etc: 'etc',
    trx: 'trx',
    erc20: 'erc20',
    trc10: 'trc10',
    trc20: 'trc20'
}

const CurrencyTypes = Object.keys(CurrencyType)

type Currency = {
    _id?: ObjectID
    type: string
    address: string | null
    watch: boolean
    createdAt: Date
}

const CurrencyIndexes: IndexSpecification[] = [
    { key: { address: 1 }, unique: true },
    { key: { type: 1 } },
    { key: { watch: 1 } }
]

export {
    CurrencyType,
    CurrencyTypes,
    Currency,
    CurrencyIndexes
}