import { createWorkflow, createStep, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CustomerDTO } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
  customer_id: string
}

type StepInput = {
  customer: CustomerDTO
}

const trackCustomerUpdatedStep = createStep(
  "track-customer-updated-step",
  async ({ customer }: StepInput, { container }) => {
    const analyticsModuleService = container.resolve(Modules.ANALYTICS)

    await analyticsModuleService.track({
      event: "customer_updated",
      actor_id: customer.id,
      properties: {
        customer_id: customer.id,
        email: customer.email,
        customer_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
        first_name: customer.first_name,
        last_name: customer.last_name,
        has_account: customer.has_account,
        updated_at: customer.updated_at,
      }
    })
  }
)

export const trackCustomerUpdatedWorkflow = createWorkflow(
  "track-customer-updated-workflow",
  ({ customer_id }: WorkflowInput) => {
    const { data: customers } = useQueryGraphStep({
      entity: "customer",
      fields: ["*"],
      filters: { id: customer_id }
    })

    trackCustomerUpdatedStep({
      customer: customers[0],
    })

    return new WorkflowResponse(void 0)
  }
)
