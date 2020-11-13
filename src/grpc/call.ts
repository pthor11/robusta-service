import { user_api_key_create } from "./user_api_key_create";
import { user_account_watch } from "./user_account_watch";

const methods = {
    user_api_key_create: 'user_api_key_create',
    user_account_watch: 'user_account_watch'
}

type CallReturn = {
    result?: string
    error?: string
}

const call = async ({ request, metadata }, callback) => {
    try {
        switch (request.method) {
            case methods.user_api_key_create: return callback(null, await user_api_key_create({ request }))
            case methods.user_account_watch: return callback(null, await user_account_watch({ request }))
            default:
                return callback({ code: 9999 })
        }
    } catch (e) {
        callback(e)
    }
}

export {
    CallReturn,
    call
}