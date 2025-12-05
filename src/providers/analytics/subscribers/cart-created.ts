import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { trackCartCreatedWorkflow } from "../../../workflows/track-cart-created"

export default async function cartCreatedAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
    console.log("cartCreatedAnalyticsHandler data:", data);

  await trackCartCreatedWorkflow(container).run({
    input: {
      cart_id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "cart.created",
}
