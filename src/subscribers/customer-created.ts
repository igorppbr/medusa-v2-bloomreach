import { Modules } from "@medusajs/framework/utils"
import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { trackCustomerCreatedWorkflow } from "../workflows/track-customer-created"

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("[Bloomreach] customer.created triggered, customer_id:", data.id)
  
  // Notifications
  try {
    const notificationModuleService = container.resolve(
      Modules.NOTIFICATION
    )
    const query = container.resolve("query")

    const { data: [customer] } = await query.graph({
      entity: "customer",
      fields: ["*"],
      filters: {
        id: data.id,
      }
    })

    if (customer?.email) {
      console.log("[Bloomreach] Sending customer-created notification to:", customer.email)
      await notificationModuleService.createNotifications({
        to: customer.email,
        channel: "email",
        template: "customer-created",
        data: {
          customer_id: customer.id,
          customer_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
        }
      })
      console.log("[Bloomreach] Customer-created notification sent")
    } else {
      console.log("[Bloomreach] Skipping notification - no customer email")
    }
  } catch (error) {
    console.error("[Bloomreach] Error sending customer-created notification:", error)
  }

  // Track analytics
  try {
    console.log("[Bloomreach] Tracking customer-created analytics")
    await trackCustomerCreatedWorkflow(container).run({
      input: {
        customer_id: data.id,
      },
    })
    console.log("[Bloomreach] Customer-created completed")
  } catch (error) {
    console.error("[Bloomreach] Error tracking customer-created analytics:", error)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
