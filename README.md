<p align="center">
  <a href="https://www.bloomreach.com">
    <picture>
      <img alt="Bloomreach logo" src="https://res.cloudinary.com/dotcom-prod/images/ar_1:1,c_pad,f_auto,q_auto,w_250/v1/wt-cms-assets/2022/04/vcwquhbitj6vq13b24el/bloomreachlogo.png" width="260"/>
    </picture>
  </a>
</p>
<h1 align="center">
  Bloomreach Engagement Integration for Medusa v2
</h1>

<h4 align="center">
  <a href="https://documentation.bloomreach.com/engagement/reference">API Documentation</a> |
  <a href="https://www.bloomreach.com/">Bloomreach Website</a>
</h4>

<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
  <a href="https://www.linkedin.com/in/igor-ludgero-miura-26175263/">
    <img src="https://img.shields.io/badge/Follow%20on%20LinkedIn-blue?logo=linkedin" alt="Follow me on LinkedIn" />
  </a>
</p>

## Introduction

This module integrates Bloomreach (Exponea) as a notification and analytics provider for Medusa v2. It enables you to send transactional emails and SMS messages through the Bloomreach platform, as well as track customer events and behavior for powerful engagement and marketing automation.

With this plugin, you can:

- Send transactional emails using Bloomreach email templates or custom content.
- Send transactional SMS messages using Bloomreach SMS templates or raw text.
- Track customer events and behavior for analytics and personalization.
- Personalize notifications with dynamic data and customer information.
- Monitor notification delivery and engagement through Bloomreach analytics.
- Manage campaigns and templates directly in the Bloomreach dashboard.

## Compatibility

This module/plugin is compatible with versions >= 2.4.0 of `@medusajs/medusa`.

## Prerequisites

Before using this integration, you need:

1. **A Bloomreach (Exponea) account** - Sign up at [Bloomreach](https://www.bloomreach.com/)
2. **API credentials** - You'll need:
   - **API Key ID** - Found in your Bloomreach project settings
   - **API Secret** - Found in your Bloomreach project settings
   - **Project ID** - Your Bloomreach project identifier
   - **Integration ID** - The ID of your email/SMS service provider integration

### Getting Your Bloomreach Credentials

1. **Log in to Bloomreach** at [https://app.exponea.com/](https://app.exponea.com/)
2. **Navigate to Project Settings** → **Access Management** → **API**
3. **Create a new API key** (or use an existing one):
   - Assign permissions: **Campaigns > Transactional Email API**, **Campaigns > Transactional SMS API**, and **Events > Set**
   - Note down your **Key ID** and **Secret**
4. **Find your Project ID**:
   - Available in the URL when logged into your project
   - Format: `https://app.exponea.com/project/{project-id}/...`
5. **Get your Integration ID**:
   - Go to **Project Settings** → **Channels** → **Email/SMS**
   - Select your email or SMS integration
   - Copy the Integration ID from the URL or settings page

For more details, see the [Bloomreach Authentication Documentation](https://documentation.bloomreach.com/engagement/reference/authentication).

## Installation

1. **Install the package**

```bash
npm install @igorppbr/medusa-v2-bloomreach-notification
```

2. **Add the module to your `medusa-config.ts`**

```ts
import { Modules } from "@medusajs/framework/utils"

export default defineConfig({
  // ... other config
  modules: [
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          // default provider
          {
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              name: "Local Notification Provider",
              channels: ["feed"]
            }
          },
          {
            resolve: "@igorppbr/medusa-v2-bloomreach/providers/notifications",
            id: "bloomreach-notification",
            options: {
              channels: ["email", "sms"], // Specify the channels you want to support
              notifications: {
                key_id: process.env.BLOOMREACH_API_KEY_ID,
                secret: process.env.BLOOMREACH_API_SECRET,
                project_id: process.env.BLOOMREACH_PROJECT_ID,
                integration_id: process.env.BLOOMREACH_INTEGRATION_ID,
                from_email: "noreply@yourdomain.com",
                from_name: "Your Company Name",
                from_sms: "+1234567890", // Required if using SMS channel
                language: "en", // Optional: default language for templates
                transfer_identity: "enabled", // Optional: 'enabled', 'disabled', or 'first_click'
                template_mappings: { // Optional: map Medusa template names to Bloomreach template IDs
                  "order-confirmation": "60758e2d18883e1048b817a8",
                  "order-shipped": "60758e2d18883e1048b817a9"
                },
                campaign_mappings: { // Optional: map template names to campaign names
                  "order-confirmation": "Order Confirmation Campaign",
                  "order-shipped": "Order Shipped Campaign"
                }
              }
            }
          }
        ]
      }
    },
    {
      resolve: "@medusajs/medusa/analytics",
      options: {
        providers: [
          {
            resolve: "@igorppbr/medusa-v2-bloomreach/providers/analytics",
            id: "bloomreach-analytics",
            options: {
              notifications: {
                key_id: process.env.BLOOMREACH_API_KEY_ID,
                secret: process.env.BLOOMREACH_API_SECRET,
                project_id: process.env.BLOOMREACH_PROJECT_ID
              }
            }
          }
        ]
      }
    }
  ],
  plugins: [
    {
      resolve: "@igorppbr/medusa-v2-bloomreach",
      options: {},
    },
  ]
})
```

> **Note:** Adding the plugin is required for Medusa to load the event subscribers that handle notifications and analytics tracking.

3. **Add environment variables to your `.env` file**

```bash
BLOOMREACH_API_KEY_ID=your_api_key_id
BLOOMREACH_API_SECRET=your_api_secret
BLOOMREACH_PROJECT_ID=your_project_id
BLOOMREACH_INTEGRATION_ID=your_integration_id
```

> **Important:** Never commit your API credentials to version control. Always use environment variables.

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `key_id` | string | Yes | Your Bloomreach API Key ID |
| `secret` | string | Yes | Your Bloomreach API Secret |
| `project_id` | string | Yes | Your Bloomreach Project ID |
| `integration_id` | string | Yes | Your email/SMS integration ID |
| `from_email` | string | Yes | Default sender email address |
| `from_name` | string | Yes | Default sender name for emails |
| `from_sms` | string | Conditional | Required if using SMS channel - sender phone number |
| `language` | string | No | Default language code (e.g., "en", "es") |
| `transfer_identity` | string | No | Link tracking behavior: "enabled", "disabled", or "first_click" |
| `template_mappings` | object | No | Map Medusa template names to Bloomreach template IDs |
| `campaign_mappings` | object | No | Map template names to campaign names |

## Usage

### Tracking Customer Events (Analytics)

Track customer behavior and events for analytics and personalization:

```typescript
import { Modules } from "@medusajs/framework/utils"

// In a workflow, subscriber, or API route
const analyticsModuleService = container.resolve(Modules.ANALYTICS)

await analyticsModuleService.track({
  event: "product_viewed",
  userId: "customer123",
  properties: {
    product_id: "prod_abc",
    product_name: "Amazing Widget",
    price: 99.99,
    category: "electronics"
  }
})
```

### Example: Tracking Order Events

Create a workflow to track order events:

```typescript
// src/workflows/track-order-placed.ts
import { createWorkflow, createStep } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

const trackOrderPlacedStep = createStep(
  "track-order-placed-step",
  async ({ order }, { container }) => {
    const analyticsModuleService = container.resolve(Modules.ANALYTICS)

    await analyticsModuleService.track({
      event: "order_placed",
      userId: order.customer_id,
      properties: {
        order_id: order.id,
        order_number: order.display_id,
        total: order.total,
        currency: order.currency_code,
        items: order.items.map((item) => ({
          variant_id: item.variant_id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.unit_price
        }))
      }
    })
  }
)

export const trackOrderPlacedWorkflow = createWorkflow(
  "track-order-placed-workflow",
  ({ order_id }) => {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: ["*", "customer.*", "items.*"],
      filters: { id: order_id }
    })

    trackOrderPlacedStep({ order: orders[0] })
  }
)
```

Then create a subscriber to execute the workflow:

```typescript
// src/subscribers/order-placed-analytics.ts
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa"
import { trackOrderPlacedWorkflow } from "../workflows/track-order-placed"

export default async function orderPlacedAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await trackOrderPlacedWorkflow(container).run({
    input: { order_id: data.id }
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
```

### Sending Email Notifications

Once configured, you can send email notifications using the Notification Module:

```typescript
import { Modules } from "@medusajs/framework/utils"

// In a workflow, subscriber, or API route
const notificationModuleService = container.resolve(Modules.NOTIFICATION)

await notificationModuleService.createNotifications({
  to: "customer@example.com",
  channel: "email",
  template: "order-confirmation",
  data: {
    order_number: "12345",
    customer_name: "John Doe",
    order_total: "$99.99"
  }
})
```

### Sending SMS Notifications

```typescript
import { Modules } from "@medusajs/framework/utils"

const notificationModuleService = container.resolve(Modules.NOTIFICATION)

await notificationModuleService.createNotifications({
  to: "+1234567890",
  channel: "sms",
  template: "order-shipped",
  data: {
    order_number: "12345",
    tracking_number: "ABC123XYZ"
  }
})
```

### Example: Order Confirmation Subscriber

Create a subscriber to send order confirmation emails:

```typescript
// src/subscribers/order-placed.ts
import { Modules } from "@medusajs/framework/utils"
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/medusa"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const query = container.resolve("query")

  // Get order details
  const { data: [order] } = await query.graph({
    entity: "order",
    fields: ["*", "customer.*", "items.*"],
    filters: { id: data.id }
  })

  // Send email notification
  await notificationModuleService.createNotifications({
    to: order.customer.email,
    channel: "email",
    template: "order-confirmation",
    data: {
      customer_name: `${order.customer.first_name} ${order.customer.last_name}`,
      order_number: order.display_id,
      order_total: order.total,
      items: order.items
    }
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
```

## Template Setup in Bloomreach

1. **Log in to Bloomreach** and navigate to **Campaigns** → **Email/SMS Templates**
2. **Create a new template** or use an existing one
3. **Note the Template ID** from the URL or template settings
4. **Add personalization variables** in your template using Jinja syntax:
   ```html
   Hello {{ first_name }},
   
   Your order #{{ order_number }} has been confirmed!
   Total: {{ order_total }}
   ```
5. **Map the template** in your `medusa-config.ts` using `template_mappings`

## Features

### Analytics Features
- ✅ Track custom events and user behavior
- ✅ Customer journey tracking
- ✅ Event properties and metadata
- ✅ Real-time event processing
- ✅ Integration with Bloomreach Engagement

### Email Features
- ✅ Template-based emails with personalization
- ✅ Custom sender name and address
- ✅ Multi-language support
- ✅ Link tracking and analytics
- ✅ Campaign management

### SMS Features
- ✅ Template-based SMS with personalization
- ✅ Raw text SMS messages
- ✅ Multi-language support
- ✅ Configurable message parts (1-8)
- ✅ Campaign tracking

## Troubleshooting

### Common Issues

**Error: "API key is required in the provider's options"**
- Make sure all required environment variables are set in your `.env` file
- Verify that your `medusa-config.ts` correctly references the environment variables

**Error: "From SMS is required in the provider's options to send SMS notifications"**
- Add the `from_sms` option to your configuration if you're using the SMS channel

**Email/SMS not being sent**
- Check that your Bloomreach API credentials have the correct permissions
- Verify that your Integration ID is correct
- Check the Medusa logs for detailed error messages
- Ensure your templates exist in Bloomreach and template IDs are correct

**Template not found**
- Verify the template ID in your `template_mappings` configuration
- Check that the template exists and is published in Bloomreach

## API Reference

### Bloomreach SDK Functions

This package includes a Bloomreach SDK with the following functions:

#### `sendTransactionalEmail`
Sends a transactional email through Bloomreach.

```typescript
const messageId = await sendTransactionalEmail(
  key_id,
  secret,
  project_id,
  integration_id,
  template_id,
  campaign_name,
  {
    email: "customer@example.com",
    customer_ids: { registered: "user123" },
    language: "en"
  },
  { firstName: "John", orderTotal: "99.99" },
  sender_address,
  sender_name,
  transfer_identity
)
```

#### `sendTransactionalSms`
Sends a transactional SMS through Bloomreach.

```typescript
const messageId = await sendTransactionalSms(
  key_id,
  secret,
  project_id,
  campaign_name,
  {
    template_id: "template789",
    params: { order_number: "12345" }
  },
  {
    phone: "+1234567890",
    customer_ids: { registered: "user123" },
    language: "en"
  },
  integration_id
)
```

#### `addEvent`
Tracks a customer event in Bloomreach.

```typescript
await addEvent(
  key_id,
  secret,
  project_id,
  { registered: "user@example.com" },
  "purchase",
  {
    total_price: 149.99,
    voucher_code: "SAVE20",
    product_ids: ["prod1", "prod2"],
    currency: "USD"
  },
  Math.floor(Date.now() / 1000) // Optional timestamp in seconds
)
```

## Contributing

We welcome contributions to this project! If you have suggestions, improvements, or bug fixes, please follow these steps:

1. **Fork the Repository**  
   Create a personal copy of the repository by forking it on GitHub.

2. **Create a New Branch**  
   Create a new branch for your changes:
   ```bash
   git checkout -b my-feature-branch
   ```

3. **Make Your Changes**  
   Implement your changes in the codebase.

4. **Test Your Changes**  
   Ensure that your changes work as expected and do not break existing functionality.

5. **Submit a Pull Request**  
   Push your changes to your forked repository and submit a pull request to the main repository.

## Support / Contact

If you need help or have questions about the Bloomreach Engagement Integration, please reach out to us:

- **Email:** igorlmiura@gmail.com
- **GitHub Issues:** [Submit an issue](https://github.com/igorppbr/medusa-v2-bloomreach-notification/issues)

## License

This project is licensed under the MIT License.

---

## Additional Resources

- [Bloomreach Documentation](https://documentation.bloomreach.com/)
- [Bloomreach API Reference](https://documentation.bloomreach.com/engagement/reference)
- [Medusa Documentation](https://docs.medusajs.com/)
- [Medusa Notification Module Guide](https://docs.medusajs.com/resources/infrastructure-modules/notification)
- [Medusa Analytics Module Guide](https://docs.medusajs.com/resources/infrastructure-modules/analytics)