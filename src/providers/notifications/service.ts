import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO
} from "@medusajs/framework/types"
import { sendTransactionalEmail, sendTransactionalSms } from "../../bloomreach-sdk"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
    notifications: {
        key_id: string
        secret: string
        project_id: string
        integration_id: string
        from_email: string
        from_name: string
        from_sms: string
        transfer_identity?: 'enabled' | 'disabled' | 'first_click'
        template_mappings?: Record<string, string>
        campaign_mappings?: Record<string, string>
        language?: string
    }
}

class BloomreachNotificationProviderService extends AbstractNotificationProviderService {
    static identifier = "bloomreach-notification"

    protected logger_: Logger
    protected options_: Options

    constructor (
        { logger }: InjectedDependencies,
        options: Options
    ) {
        super()

        this.logger_ = logger
        this.options_ = options
    }

    /**
     * Validates the required configuration options for the Bloomreach notification provider.
     * 
     * This static method ensures all necessary credentials and settings are provided
     * before the service is initialized. It throws detailed errors for any missing
     * required configuration values.
     * 
     * @param options - The configuration options object to validate
     * @param options.notifications - The notifications configuration object
     * @param options.notifications.key_id - The API key identifier for authentication
     * @param options.notifications.secret - The secret key for authentication
     * @param options.notifications.project_id - The Bloomreach project identifier
     * @param options.notifications.integration_id - The integration identifier
     * @param options.notifications.from_email - The sender email address for email notifications
     * @param options.notifications.from_name - The sender name for email notifications
     * 
     * @throws {MedusaError} Throws INVALID_DATA error if any required option is missing
     * 
     * @example
     * ```typescript
     * BloomreachNotificationProviderService.validateOptions({
     *   notifications: {
     *     key_id: "myKeyId",
     *     secret: "mySecret",
     *     project_id: "project123",
     *     integration_id: "integration456",
     *     from_email: "noreply@example.com",
     *     from_name: "My Company"
     *   }
     * });
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static validateOptions(options: Record<any, any>) {
        if (!options.notifications?.key_id) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Key ID is required in the provider's options."
            )
        }

        if (!options.notifications?.secret) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Secret is required in the provider's options."
            )
        }

        if (!options.notifications?.project_id) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Project ID is required in the provider's options."
            )
        }

        if (!options.notifications?.integration_id) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "Integration ID is required in the provider's options."
            )
        }

        if (!options.notifications?.from_email) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "From email is required in the provider's options."
            )
        }

        if (!options.notifications?.from_name) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "From name is required in the provider's options."
            )
        }
    }

    /**
     * Sends a notification through the Bloomreach platform.
     * 
     * This method handles sending notifications via email or SMS channels using the Bloomreach API.
     * It supports template mapping, campaign naming, and personalization through the notification data.
     * The method automatically selects the appropriate Bloomreach API (email or SMS) based on the
     * notification channel.
     * 
     * @param notification - The notification details to send
     * @param notification.channel - The notification channel ("email" or "sms")
     * @param notification.to - The recipient's email address or phone number
     * @param notification.template - The template identifier to use for the notification
     * @param notification.data - Optional key-value pairs for template personalization
     * 
     * @returns A promise that resolves with the notification result containing the message ID
     * @returns result.id - The unique message identifier assigned by Bloomreach
     * 
     * @throws {MedusaError} Throws INVALID_DATA error if:
     * - The channel is not "email" or "sms"
     * - SMS channel is used but from_sms is not configured
     * - Any required Bloomreach API parameters are missing
     * 
     * @example
     * ```typescript
     * // Send an email notification
     * const result = await provider.send({
     *   channel: "email",
     *   to: "customer@example.com",
     *   template: "order-confirmation",
     *   data: { orderNumber: "12345", total: "99.99" }
     * });
     * console.log(result.id); // "message_id_from_bloomreach"
     * 
     * // Send an SMS notification
     * const result = await provider.send({
     *   channel: "sms",
     *   to: "+1234567890",
     *   template: "order-shipped",
     *   data: { trackingNumber: "ABC123" }
     * });
     * console.log(result.id); // "message_id_from_bloomreach"
     * ```
     */
    async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
        const mappedTemplate = this.options_.notifications.template_mappings?.[notification.template] || undefined
        const mappedCampaign = this.options_.notifications.campaign_mappings?.[notification.template] || undefined

        if (!mappedTemplate || !mappedCampaign) {
            console.log("Bloomreach Notification Provider: Missing template or campaign mapping for", notification.template)
            return {}
        }

        if (notification.channel === "email") {
            const messageId = await sendTransactionalEmail(
                this.options_.notifications.key_id,
                this.options_.notifications.secret,
                this.options_.notifications.project_id,
                this.options_.notifications.integration_id,
                mappedTemplate,
                mappedCampaign,
                {
                    email: notification.to,
                    customer_ids: notification.to ? { registered: notification.to } : {},
                    language: this.options_.notifications.language || undefined
                },
                notification.data || undefined,
                this.options_.notifications.from_email,
                this.options_.notifications.from_name,
                this.options_.notifications.transfer_identity,
            )

            return { id: messageId }
        } else if (notification.channel === "sms") {
            if (!this.options_.notifications.from_sms) {
                throw new MedusaError(
                    MedusaError.Types.INVALID_DATA,
                    "From SMS is required in the provider's options to send SMS notifications."
                )
            }

            const messageId = await sendTransactionalSms(
                this.options_.notifications.key_id,
                this.options_.notifications.secret,
                this.options_.notifications.project_id,
                mappedCampaign,
                {
                    template_id: mappedTemplate,
                    params: notification.data || undefined
                },
                {
                    phone: notification.to,
                    customer_ids: notification.to ? { registered: notification.to } : {},
                    language: this.options_.notifications.language || undefined
                },
                this.options_.notifications.integration_id
            )

            return { id: messageId }
        } else {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `Channel ${notification.channel} is not supported by Bloomreach provider.`
            )
        }
    }
}

export default BloomreachNotificationProviderService
