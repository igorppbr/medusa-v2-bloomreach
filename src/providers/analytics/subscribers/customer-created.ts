import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { trackCustomerCreatedWorkflow } from "../../../workflows/track-customer-created"

export default async function customerCreatedAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
    console.log("customerCreatedAnalyticsHandler data:", data);

  await trackCustomerCreatedWorkflow(container).run({
    input: {
      customer_id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
