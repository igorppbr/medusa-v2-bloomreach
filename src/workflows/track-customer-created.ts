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

const trackCustomerCreatedStep = createStep(
  "track-customer-created-step",
  async ({ customer }: StepInput, { container }) => {
    const analyticsModuleService = container.resolve(Modules.ANALYTICS)

    await analyticsModuleService.track({
      event: "customer_created",
      actor_id: customer.id,
      properties: {
        customer_id: customer.id,
        email: customer.email,
        customer_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
        first_name: customer.first_name,
        last_name: customer.last_name,
        has_account: customer.has_account,
        created_at: customer.created_at,
      }
    })
  }
)

export const trackCustomerCreatedWorkflow = createWorkflow(
  "track-customer-created-workflow",
  ({ customer_id }: WorkflowInput) => {
    const { data: customers } = useQueryGraphStep({
      entity: "customer",
      fields: ["*"],
      filters: { id: customer_id }
    })

    trackCustomerCreatedStep({
      customer: customers[0],
    })

    return new WorkflowResponse(void 0)
  }
)
