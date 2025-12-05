/**
 * Generates a Basic Authentication header value from a key ID and secret.
 * 
 * This function creates a Base64-encoded authentication token by combining
 * the key ID and secret with a colon separator, then prefixes it with "Basic "
 * to form a valid HTTP Basic Authentication header value.
 * 
 * @param key_id - The API key identifier used for authentication
 * @param secret - The secret key associated with the key_id
 * @returns A formatted Basic Authentication string in the format "Basic <base64_token>"
 * 
 * @example
 * ```typescript
 * const authHeader = getPrivateApiKey("myKeyId", "mySecret");
 * // Returns: "Basic bXlLZXlJZDpteVNlY3JldA=="
 * ```
 */
export const getPrivateApiKey = (
    key_id: string,
    secret: string
): string => {
    const token = Buffer.from(`${key_id}:${secret}`).toString("base64")
    return `Basic ${token}`
}

/**
 * Sends a transactional email through the Bloomreach (Exponea) API.
 * 
 * This function sends a single transactional email using Bloomreach's email sync endpoint.
 * It handles authentication, payload construction, and API communication for sending
 * personalized emails to individual recipients.
 * 
 * @param key_id - The API key identifier used for authentication
 * @param secret - The secret key associated with the key_id
 * @param project_id - The Bloomreach project identifier
 * @param integration_id - The integration identifier for email sending
 * @param template_id - The email template identifier to use
 * @param campaign_name - The name of the campaign for tracking purposes
 * @param recipient - The recipient information object
 * @param recipient.email - The recipient's email address
 * @param recipient.customer_ids - A record of customer identifiers (e.g., { registered: "user123" })
 * @param recipient.language - Optional language code for the email (e.g., "en", "es")
 * @param params - Optional template parameters for email personalization
 * @param sender_address - Optional sender email address (overrides template default)
 * @param sender_name - Optional sender display name (overrides template default)
 * @param transfer_identity - Optional setting for identity transfer behavior ('enabled', 'disabled', or 'first_click')
 * @param settings - Optional additional settings for the email
 * 
 * @throws {Error} Throws an error if the API request fails
 * 
 * @returns A promise that resolves with the message ID assigned by Bloomreach
 * 
 * @example
 * ```typescript
 * const messageId = await sendTransactionalEmail(
 *   "myKeyId",
 *   "mySecret",
 *   "project123",
 *   "integration456",
 *   "template789",
 *   "Welcome Campaign",
 *   {
 *     email: "user@example.com",
 *     customer_ids: { registered: "user123" },
 *     language: "en"
 *   },
 *   { firstName: "John", orderTotal: "99.99" },
 *   "noreply@example.com",
 *   "My Company",
 *   "enabled"
 * );
 * // Returns: "1234567890abcdef"
 * ```
 */
export const sendTransactionalEmail = async (
    key_id: string,
    secret: string,
    project_id: string,
    integration_id: string,
    template_id: string,
    campaign_name: string,
    recipient: {
        email: string;
        customer_ids: Record<string, string>;
        language?: string;
    },
    params?: Record<string, unknown>,
    sender_address?: string,
    sender_name?: string,
    transfer_identity?: 'enabled' | 'disabled' | 'first_click',
    settings?: Record<string, unknown>
): Promise<string> => {
    const authHeader = getPrivateApiKey(key_id, secret)

    const response = await fetch(`https://api.exponea.com/email/v2/projects/${project_id}/sync`, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "authorization": authHeader,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            integration_id,
            email_content: {
                template_id,
                ...(sender_address && { sender_address }),
                ...(sender_name && { sender_name }),
                ...(params && { params })
            },
            campaign_name,
            recipient,
            ...(transfer_identity && { transfer_identity }),
            ...(settings && { settings })
        })
    })

    const data = await response.json() as { message_id: string }
    return data.message_id
}

/**
 * Sends a transactional SMS through the Bloomreach (Exponea) API.
 * 
 * This function sends a single transactional SMS using Bloomreach's SMS sync endpoint.
 * It handles authentication, payload construction, and API communication for sending
 * personalized SMS messages to individual recipients. The SMS content can be defined
 * either by using an existing Bloomreach template or through raw text.
 * 
 * @param key_id - The API key identifier used for authentication
 * @param secret - The secret key associated with the key_id
 * @param project_id - The Bloomreach project identifier
 * @param campaign_name - The name of the campaign for tracking purposes
 * @param content - The SMS content object (either template-based or raw message)
 * @param content.template_id - Optional template ID to use an existing Bloomreach template
 * @param content.params - Optional template parameters for SMS personalization (when using template)
 * @param content.message - Optional raw text message (when not using template)
 * @param content.sender - Optional sender phone number (required when using raw message)
 * @param content.max_message_parts - Optional maximum allowed message parts (1-8, default: 8)
 * @param recipient - The recipient information object
 * @param recipient.phone - Optional recipient's phone number (if not provided, taken from customer profile)
 * @param recipient.customer_ids - A record of customer identifiers (e.g., { registered: "user123" })
 * @param recipient.language - Optional language code for the SMS (e.g., "en", "es")
 * @param integration_id - Optional SMS service provider integration ID
 * @param settings - Optional additional settings for the SMS
 * 
 * @throws {Error} Throws an error if the API request fails
 * 
 * @returns A promise that resolves with the message ID assigned by Bloomreach
 * 
 * @example
 * ```typescript
 * // Using a Bloomreach template
 * const messageId = await sendTransactionalSms(
 *   "myKeyId",
 *   "mySecret",
 *   "project123",
 *   "Order Notification",
 *   {
 *     template_id: "template789",
 *     params: { order_number: "12345", status: "shipped" }
 *   },
 *   {
 *     phone: "+1234567890",
 *     customer_ids: { registered: "user123" },
 *     language: "en"
 *   },
 *   "integration456"
 * );
 * 
 * // Using raw message
 * const messageId = await sendTransactionalSms(
 *   "myKeyId",
 *   "mySecret",
 *   "project123",
 *   "Order Notification",
 *   {
 *     message: "Your order #12345 has shipped!",
 *     sender: "+9876543210",
 *     max_message_parts: 2
 *   },
 *   {
 *     phone: "+1234567890",
 *     customer_ids: { registered: "user123" }
 *   }
 * );
 * ```
 */
export const sendTransactionalSms = async (
    key_id: string,
    secret: string,
    project_id: string,
    campaign_name: string,
    content: {
        template_id?: string;
        params?: Record<string, unknown>;
        message?: string;
        sender?: string;
        max_message_parts?: number;
    },
    recipient: {
        phone?: string;
        customer_ids: Record<string, string>;
        language?: string;
    },
    integration_id?: string,
    settings?: Record<string, unknown>
): Promise<string> => {
    const authHeader = getPrivateApiKey(key_id, secret)

    const response = await fetch(`https://api.exponea.com/sms/v1/projects/${project_id}/sync`, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "authorization": authHeader,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            ...(integration_id && { integration_id }),
            content: {
                ...(content.template_id && { template_id: content.template_id }),
                ...(content.params && { params: content.params }),
                ...(content.message && { message: content.message }),
                ...(content.sender && { sender: content.sender }),
                ...(content.max_message_parts !== undefined && { max_message_parts: content.max_message_parts })
            },
            campaign_name,
            recipient,
            ...(settings && { settings })
        })
    })

    const data = await response.json() as { message_id: string }
    return data.message_id
}

/**
 * Adds an event to a customer profile in Bloomreach (Exponea).
 * 
 * This function tracks customer events through the Bloomreach Tracking API, allowing you to
 * record customer interactions, purchases, page views, and custom events. Events are
 * fundamental to customer behavior tracking and personalization in Bloomreach.
 * 
 * @param key_id - The API key identifier used for authentication (can use public or private access)
 * @param secret - The secret key associated with the key_id
 * @param project_id - The Bloomreach project identifier
 * @param customer_ids - A record of customer identifiers (e.g., { registered: "user123", cookie: "abc" })
 * @param event_type - The type of event being tracked (e.g., "purchase", "page_view", "cart_update")
 * @param properties - Optional event properties/attributes (e.g., { price: 99.99, product_id: "123" })
 * @param timestamp - Optional UNIX timestamp (in seconds) or ISO8601 date-time string when the event occurred
 * 
 * @throws {Error} Throws an error if the API request fails or returns success: false
 * 
 * @returns A promise that resolves with the success status from Bloomreach
 * 
 * @example
 * ```typescript
 * // Track a purchase event
 * await addEvent(
 *   "myKeyId",
 *   "mySecret",
 *   "project123",
 *   { registered: "user@example.com" },
 *   "purchase",
 *   {
 *     total_price: 149.99,
 *     voucher_code: "SAVE20",
 *     product_ids: ["prod1", "prod2"],
 *     currency: "USD"
 *   },
 *   1614941503
 * );
 * 
 * // Track a page view event
 * await addEvent(
 *   "myKeyId",
 *   "mySecret",
 *   "project123",
 *   { cookie: "visitor123" },
 *   "page_view",
 *   {
 *     url: "/products/widget",
 *     title: "Amazing Widget Product Page"
 *   }
 * );
 * 
 * // Track a custom event without properties
 * await addEvent(
 *   "myKeyId",
 *   "mySecret",
 *   "project123",
 *   { registered: "user@example.com" },
 *   "newsletter_signup"
 * );
 * ```
 * 
 * @remarks
 * - Events are processed asynchronously, so a success response means the event is queued
 * - Event messages must be less than 800 KB
 * - Each event property value must be less than 16 KB
 * - For large volumes, use Batch commands or Import API instead
 * - Timestamp should be in seconds (not milliseconds)
 * - Both hard IDs (e.g., registered, email) and soft IDs (e.g., cookie) are supported
 */
export const addEvent = async (
    key_id: string,
    secret: string,
    project_id: string,
    customer_ids: Record<string, string>,
    event_type: string,
    properties?: Record<string, unknown>,
    timestamp?: number | string
): Promise<boolean> => {
    const authHeader = getPrivateApiKey(key_id, secret)

    const response = await fetch(`https://api.exponea.com/track/v2/projects/${project_id}/customers/events`, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "authorization": authHeader,
            "content-type": "application/json"
        },
        body: JSON.stringify({
            customer_ids,
            event_type,
            ...(properties && { properties }),
            ...(timestamp && { timestamp })
        })
    })

    const data = await response.json() as { success: boolean; errors?: string }
    
    if (!data.success) {
        throw new Error(`Failed to add event: ${JSON.stringify(data)}`)
    }
    
    return data.success
}
