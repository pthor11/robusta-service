import { IndexSpecification, ObjectID } from "mongodb";
import { Currency } from "./Currency";

type Account = {
    _id?: ObjectID
    apiKey: string
    address: string
    currency: Currency
    watch: boolean
    createdAt: Date
}

const AccountIndexes: IndexSpecification[] = [
    { key: { apiKey: 1, address: 1, "currency.type": 1, "currency.address": 1 }, unique: true },
    { key: { watch: 1 } }
]

export {
    Account,
    AccountIndexes
}