import { Modules } from "@medusajs/framework/utils"
import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { trackCartCreatedWorkflow } from "../workflows/track-cart-created"

export default async function cartCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("[Bloomreach] cart.created event triggered, cart_id:", data.id)
  
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
      console.log("[Bloomreach] Sending cart-created notification to:", cart.customer.email)
      await notificationModuleService.createNotifications({
        to: cart.customer.email,
        channel: "email",
        template: "cart-created",
        data: {
          cart_id: cart.id,
          customer_name: `${cart.customer.first_name || ''} ${cart.customer.last_name || ''}`.trim(),
        }
      })
      console.log("[Bloomreach] Cart-created notification sent successfully")
    } else {
      console.log("[Bloomreach] Skipping notification - no customer email")
    }
  } catch (error) {
    console.error("[Bloomreach] Error sending cart-created notification:", error)
  }

  // Track analytics
  try {
    console.log("[Bloomreach] Tracking cart-created analytics event")
    await trackCartCreatedWorkflow(container).run({
      input: {
        cart_id: data.id,
      },
    })
    console.log("[Bloomreach] Cart-created handler completed successfully")
  } catch (error) {
    console.error("[Bloomreach] Error tracking cart-created analytics:", error)
  }
}

export const config: SubscriberConfig = {
  event: "cart.created",
}
