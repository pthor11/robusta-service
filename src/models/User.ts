import { IndexSpecification, ObjectID } from "mongodb";

type User = {
    _id?: ObjectID
    slug: string
    uuid: string
    apiKey: string
    expiredAt: Date
    updatedAt: Date
    createdAt: Date
}

const UserIndexes: IndexSpecification[] = [
    { key: { uuid: 1 }, unique: true },
    { key: { apiKey: 1 }, unique: true },
]

export {
    User,
    UserIndexes
}