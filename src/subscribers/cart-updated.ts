import { Modules } from "@medusajs/framework/utils"
import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { trackCartUpdatedWorkflow } from "../workflows/track-cart-updated"

export default async function cartUpdatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("[Bloomreach] cart.updated triggered, cart_id:", data.id)
  
  // Notifications
  try {
    const notificationModuleService = container.resolve(
      Modules.NOTIFICATION
    )
    const query = container.resolve("query")

    const { data: [cart] } = await query.graph({
      entity: "cart",
      fields: ["*", "customer.*"],
      filters: {
        id: data.id,
      }
    })

    if (cart.customer?.email) {
      console.log("[Bloomreach] Sending cart-updated notification to:", cart.customer.email)
      await notificationModuleService.createNotifications({
        to: cart.customer.email,
        channel: "email",
        template: "cart-updated",
        data: {
          cart_id: cart.id,
          customer_name: `${cart.customer.first_name || ''} ${cart.customer.last_name || ''}`.trim(),
        }
      })
      console.log("[Bloomreach] Cart-updated notification sent")
    } else {
      console.log("[Bloomreach] Skipping notification - no customer email")
    }
  } catch (error) {
    console.error("[Bloomreach] Error sending cart-updated notification:", error)
  }

  // Track analytics
  try {
    console.log("[Bloomreach] Tracking cart-updated analytics")
    await trackCartUpdatedWorkflow(container).run({
      input: {
        cart_id: data.id,
      },
    })
    console.log("[Bloomreach] Cart-updated completed")
  } catch (error) {
    console.error("[Bloomreach] Error tracking cart-updated analytics:", error)
  }
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}
