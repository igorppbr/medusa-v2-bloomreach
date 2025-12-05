import { CartDTO, CustomerDTO, CartLineItemDTO } from "@medusajs/framework/types"
import { createWorkflow, createStep, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
  cart_id: string
}

type StepInput = {
  cart: CartDTO & {
    customer?: CustomerDTO
    items?: CartLineItemDTO[]
  }
}

const trackCartCreatedStep = createStep(
  "track-cart-created-step",
  async ({ cart }: StepInput, { container }) => {
    const analyticsModuleService = container.resolve(Modules.ANALYTICS)

    await analyticsModuleService.track({
      event: "cart_created",
      actor_id: cart.customer?.id,
      properties: {
        cart_id: cart.id,
        customer_email: cart.customer?.email,
        customer_name: `${cart.customer?.first_name || ''} ${cart.customer?.last_name || ''}`.trim(),
        items_count: cart.items?.length || 0,
        currency: cart.currency_code,
      }
    })
  }
)

export const trackCartCreatedWorkflow = createWorkflow(
  "track-cart-created-workflow",
  ({ cart_id }: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["*", "customer.*", "items.*"],
      filters: { id: cart_id }
    })

    trackCartCreatedStep({
      cart: carts[0],
    })

    return new WorkflowResponse(void 0)
  }
)
