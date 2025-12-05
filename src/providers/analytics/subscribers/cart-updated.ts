import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { trackCartUpdatedWorkflow } from "../../../workflows/track-cart-updated"

export default async function cartUpdatedAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await trackCartUpdatedWorkflow(container).run({
    input: {
      cart_id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "cart.updated",
}
