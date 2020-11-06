import { IndexSpecification } from "mongodb";
import { TxBB } from "./Tx.BB";

type BlockBB = {
    "page": number,
    "totalPages": number,
    "itemsOnPage": number,
    "hash": string,
    "previousBlockHash": string,
    "nextBlockHash": string,
    "height": number,
    "confirmations": number,
    "size": number,
    "time": number,
    "version": number,
    "merkleRoot": string,
    "nonce": number,
    "bits": number,
    "difficulty": string,
    "txCount": number,
    "txs": TxBB[]
}

const BlockBBIndexes: IndexSpecification[] = [
    { key: { height: 1 }, unique: true },
    { key: { hash: 1 }, unique: true },
]

export { BlockBB, BlockBBIndexes }