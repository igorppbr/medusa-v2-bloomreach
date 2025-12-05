import { Modules } from "@medusajs/framework/utils"
import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { trackOrderPlacedWorkflow } from "../workflows/track-order-placed"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("[Bloomreach] order.placed triggered, order_id:", data.id)
  
  // Notifications
  try {
    const notificationModuleService = container.resolve(
      Modules.NOTIFICATION
    )
    const query = container.resolve("query")

    const { data: [order] } = await query.graph({
      entity: "order",
      fields: ["*", "customer.*"],
      filters: {
        id: data.id,
      }
    })

    if (order.customer?.email) {
      console.log("[Bloomreach] Sending order-placed notification to:", order.customer.email)
      await notificationModuleService.createNotifications({
        to: order.customer.email,
        channel: "email",
        template: "order-placed",
        data: {
          order_id: order.id,
          order_number: order.display_id,
          customer_name: `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim(),
        }
      })
      console.log("[Bloomreach] Order-placed notification sent")
    } else {
      console.log("[Bloomreach] Skipping notification - no customer email")
    }
  } catch (error) {
    console.error("[Bloomreach] Error sending order-placed notification:", error)
  }

  // Track analytics
  try {
    console.log("[Bloomreach] Tracking order-placed analytics")
    await trackOrderPlacedWorkflow(container).run({
      input: {
        order_id: data.id,
      },
    })
    console.log("[Bloomreach] Order-placed completed")
  } catch (error) {
    console.error("[Bloomreach] Error tracking order-placed analytics:", error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
