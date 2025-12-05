import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { trackCustomerUpdatedWorkflow } from "../../../workflows/track-customer-updated"

export default async function customerUpdatedAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await trackCustomerUpdatedWorkflow(container).run({
    input: {
      customer_id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "customer.updated",
}
