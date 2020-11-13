import { Account } from "./Account";
import { Currency } from "./Currency";

type WatchMessage = {
    apiKey: string,
    address: string,
    currency: Currency
    watch: boolean
}

export { WatchMessage }