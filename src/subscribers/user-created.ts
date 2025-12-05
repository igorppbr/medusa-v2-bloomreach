import { Modules } from "@medusajs/framework/utils"
import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"

export default async function userCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log("[Bloomreach] user.created triggered, user_id:", data.id)
  
  // Notifications
  try {
    const notificationModuleService = container.resolve(
      Modules.NOTIFICATION
    )
    const query = container.resolve("query")

    const { data: [user] } = await query.graph({
      entity: "user",
      fields: ["*"],
      filters: {
        id: data.id,
      }
    })

    if (user?.email) {
      console.log("[Bloomreach] Sending user-created notification to:", user.email)
      await notificationModuleService.createNotifications({
        to: user.email,
        channel: "email",
        template: "user-created",
        data: {
          user_id: user.id,
          user_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        }
      })
      console.log("[Bloomreach] User-created notification sent")
    } else {
      console.log("[Bloomreach] Skipping notification - no user email")
    }
    console.log("[Bloomreach] User-created completed")
  } catch (error) {
    console.error("[Bloomreach] Error sending user-created notification:", error)
  }
}

export const config: SubscriberConfig = {
  event: "user.created",
}
