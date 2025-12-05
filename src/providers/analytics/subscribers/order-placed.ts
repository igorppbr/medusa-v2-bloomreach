import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { trackOrderPlacedWorkflow } from "../../../workflows/track-order-placed"

export default async function orderPlacedAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await trackOrderPlacedWorkflow(container).run({
    input: {
      order_id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
