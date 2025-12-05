import { createWorkflow, createStep, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { OrderDTO, CustomerDTO, OrderItemDTO } from "@medusajs/framework/types"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
  order_id: string
}

type StepInput = {
  order: OrderDTO & {
    customer?: CustomerDTO
    items?: OrderItemDTO[]
  }
}

const trackOrderPlacedStep = createStep(
  "track-order-placed-step",
  async ({ order }: StepInput, { container }) => {
    const analyticsModuleService = container.resolve(Modules.ANALYTICS)

    await analyticsModuleService.track({
      event: "order_placed",
      actor_id: order.customer?.id,
      properties: {
        order_id: order.id,
        order_number: order.display_id,
        customer_email: order.customer?.email,
        customer_name: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
        subtotal: order.subtotal,
        total: order.total,
        tax_total: order.tax_total,
        shipping_total: order.shipping_total,
        currency: order.currency_code,
        status: order.status,
        items_count: order.items?.length || 0,
        items: order.items?.map((item) => ({
          id: item.id,
          variant_id: item.variant_id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        })) || [],
      }
    })
  }
)

export const trackOrderPlacedWorkflow = createWorkflow(
  "track-order-placed-workflow",
  ({ order_id }: WorkflowInput) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: ["*", "customer.*", "items.*"],
      filters: { id: order_id }
    })

    trackOrderPlacedStep({
      order: orders[0],
    })

    return new WorkflowResponse(void 0)
  }
)
