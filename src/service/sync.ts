import axios from "axios"
import { blockbook, blockInit } from "../config"
import { collectionNames, db } from "../mongo"

const sync = async () => {
    try {
        let sync = await db.collection('sync').findOne({})

        if (!sync) sync = { block: blockInit }

        const nextBlockData = await axios.get(`${blockbook}/api/v2/block/${sync.block + 1}`)
    } catch (e) {
        throw e
    }
}