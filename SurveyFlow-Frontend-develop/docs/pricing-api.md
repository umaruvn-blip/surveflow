# Pricing catalog client

`app/apis/pricing.api.ts` reads the three public backend catalog endpoints:

| Function                 | Backend path                  | Result type           |
| ------------------------ | ----------------------------- | --------------------- |
| `getCreditPackages()`    | `/pricing/credit-packages`    | `CreditPackage[]`     |
| `getSubscriptionPlans()` | `/pricing/subscription-plans` | `SubscriptionPlan[]`  |
| `getRewards()`           | `/pricing/rewards`            | `RewardCatalogItem[]` |

The types are defined in `app/types/pricing.type.ts`. Pages can use `useCreditPackagesQuery`, `useSubscriptionPlansQuery`, and `useRewardCatalogQuery` from `app/hooks/queries/pricing/use-pricing-queries.ts`. In mock mode, these calls return the matching catalog fixtures without contacting the backend.

The endpoints return catalog prices and benefits. They do not quote a user-specific Plus discount or start a purchase or redemption. Checkout must use a later server-side quote/payment API before presenting a final charge.

The public `/pricing` page reads subscription plans and Credit packages through these query hooks. It shows catalog prices and benefit definitions, with purchase controls disabled until checkout is available. The page can be opened without signing in; it does not read a user's active subscription.
