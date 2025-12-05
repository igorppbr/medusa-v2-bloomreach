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

const trackCartUpdatedStep = createStep(
  "track-cart-updated-step",
  async ({ cart }: StepInput, { container }) => {
    const analyticsModuleService = container.resolve(Modules.ANALYTICS)

    await analyticsModuleService.track({
      event: "cart_updated",
      actor_id: cart.customer?.id,
      properties: {
        cart_id: cart.id,
        customer_email: cart.customer?.email,
        customer_name: `${cart.customer?.first_name || ''} ${cart.customer?.last_name || ''}`.trim(),
        items_count: cart.items?.length || 0,
        subtotal: cart.subtotal,
        total: cart.total,
        currency: cart.currency_code,
        items: cart.items?.map((item) => ({
          variant_id: item.variant_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })) || [],
      }
    })
  }
)

export const trackCartUpdatedWorkflow = createWorkflow(
  "track-cart-updated-workflow",
  ({ cart_id }: WorkflowInput) => {
    const { data: carts } = useQueryGraphStep({
      entity: "cart",
      fields: ["*", "customer.*", "items.*"],
      filters: { id: cart_id }
    })

    trackCartUpdatedStep({
      cart: carts[0],
    })

    return new WorkflowResponse(void 0)
  }
)
