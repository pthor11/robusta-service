import { user_api_key_create } from "./user_api_key_create";

const methods = {
    user_api_key_create: 'user_api_key_create'
}

type CallReturn = {
    result: string
}

const call = async ({ request, metadata }, callback) => {
    try {
        switch (request.method) {
            case methods.user_api_key_create:
                const { result } = await user_api_key_create({ request })
                return callback(null, { result })
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