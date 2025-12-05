import { Modules } from "@medusajs/framework/utils"
import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { trackCustomerUpdatedWorkflow } from "../workflows/track-customer-updated"

export default async function customerUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("[Bloomreach] customer.updated triggered, customer_id:", data.id)
  
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
      console.log("[Bloomreach] Sending customer-updated notification to:", customer.email)
      await notificationModuleService.createNotifications({
        to: customer.email,
        channel: "email",
        template: "customer-updated",
        data: {
          customer_id: customer.id,
          customer_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
        }
      })
      console.log("[Bloomreach] Customer-updated notification sent")
    } else {
      console.log("[Bloomreach] Skipping notification - no customer email")
    }
  } catch (error) {
    console.error("[Bloomreach] Error sending customer-updated notification:", error)
  }

  // Track analytics
  try {
    console.log("[Bloomreach] Tracking customer-updated analytics")
    await trackCustomerUpdatedWorkflow(container).run({
      input: {
        customer_id: data.id,
      },
    })
    console.log("[Bloomreach] Customer-updated completed")
  } catch (error) {
    console.error("[Bloomreach] Error tracking customer-updated analytics:", error)
  }
}

export const config: SubscriberConfig = {
  event: "customer.updated",
}
