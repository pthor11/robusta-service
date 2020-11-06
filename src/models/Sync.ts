import { IndexSpecification, ObjectID } from "mongodb";

type Sync = {
    _id?: ObjectID,
    blockNumber: number
    updatedAt?: Date
    createdAt: Date
}

const SyncIndexes: IndexSpecification[] = [
    { key: { blockNumber: 1 }, unique: true }
]

export {
    Sync,
    SyncIndexes
}