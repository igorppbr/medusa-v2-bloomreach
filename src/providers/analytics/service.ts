import { AbstractAnalyticsProviderService } from "@medusajs/framework/utils"
import { addEvent } from "../../bloomreach-sdk/index"
import { Logger } from "@medusajs/framework/types"
import { ProviderTrackAnalyticsEventDTO } from "@medusajs/framework/types"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
    notifications: {
        key_id: string
        secret: string
        project_id: string
    }
}

class BloomreachAnalyticsProviderService extends AbstractAnalyticsProviderService {
    protected logger_: Logger
    protected options_: Options
    static identifier = "bloomreach-analytics"

    constructor (
        { logger }: InjectedDependencies,
        options: Options
    ) {
        super()

        this.logger_ = logger
        this.options_ = options
    }

    /**
     * Tracks an analytics event by sending it to Bloomreach (Exponea).
     * 
     * This method processes analytics events from Medusa and forwards them to Bloomreach
     * for customer behavior tracking and analytics. It handles event identification using
     * either actor_id or group identifiers and enriches the event with properties and timestamps.
     * 
     * @param data - The analytics event data to track
     * @param data.event - The name/type of the event being tracked (e.g., "product_viewed", "order_placed")
     * @param data.actor_id - Optional identifier for the user/entity performing the action
     * @param data.group - Optional group identifier as fallback if actor_id is not provided
     * @param data.properties - Optional key-value pairs with additional event details
     * 
     * @returns A promise that resolves when the event is successfully queued to Bloomreach
     * 
     * @remarks
     * - Either actor_id or group must be provided to identify the customer
     * - If both are missing, a warning is logged and the event is not tracked
     * - The event is automatically timestamped with the current UTC time
     * - Events are sent asynchronously to Bloomreach's tracking API
     * 
     * @example
     * ```typescript
     * await track({
     *   event: "product_viewed",
     *   actor_id: "customer123",
     *   properties: {
     *     product_id: "prod_abc",
     *     price: 99.99,
     *     category: "electronics"
     *   }
     * });
     * ```
     */
    async track(
        data: ProviderTrackAnalyticsEventDTO
    ): Promise<void> {
        const identifier = data.actor_id || data.group
        if (!identifier) {
            this.logger_.warn(
                `Bloomreach Analytics Provider: Missing actor_id or group in track event ${data.event}`
            )
            this.logger_.warn(`Event data: ${JSON.stringify(data)}`)
            return
        }

        const identifierRecord: Record<string, string> = typeof identifier === 'string' 
            ? { id: identifier } 
            : { type: identifier.type || '', id: identifier.id || '' }

        await addEvent(
            this.options_.notifications.key_id,
            this.options_.notifications.secret,
            this.options_.notifications.project_id,
            identifierRecord,
            data.event,
            data.properties || {},
            new Date().toUTCString()
        )
    }
}

export default BloomreachAnalyticsProviderService
