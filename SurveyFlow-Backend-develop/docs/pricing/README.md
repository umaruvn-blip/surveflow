# Pricing catalog

Flyway migration `V13__add_pricing_catalog.sql` introduces the catalog data supplied for SurveyFlow pricing. This change defines data only; it does not create checkout, subscription renewal, reward redemption, or withdrawal APIs.

| Table | Purpose |
| --- | --- |
| `credit_packages` | Starter (200 Credits, 19,000 VND), Standard (600, 49,000 VND), Pro (1,300, 99,000 VND). |
| `subscription_plans` | Existing plan table; V13 adds SurveyFlow Plus. |
| `subscription_prices` | Effective dated billing prices; Plus has a monthly price of 39,000 VND. |
| `plan_entitlements` | Plus benefits: 500 Credits/month, unlimited AI Matching and Quality Check, 2 Boosts/month, dashboard, insight/export, 20% Extra Credits discount. |
| `reward_catalog` | Five defined redemption offers plus a separate 10,000-Credit gift placeholder. The gift is inactive until its fulfillment is specified. |

The older `subscription_plans.price` and `duration_days` columns remain for compatibility with existing rows and subscriptions. New checkout code should read `subscription_prices` for the current price and snapshot the charged amount on the payment. The legacy seeded `FREE`, `STUDENT`, and `PRO` rows remain readable for historical `user_subscriptions`, but V13 marks them inactive. Only Plus is an active subscription offer. The entity stores legacy plan codes as strings; `SubscriptionPlanCode` lists only the current product, `PLUS`.

`plan_entitlements.value_type` distinguishes `ENABLED`, `UNLIMITED`, `QUOTA`, and `PERCENT`. `value_amount` holds the numeric quantity for quotas and percentages, while `reset_period` identifies monthly allowances. A checkout flow must check active Plus membership before applying the 20% package discount and must calculate the final amount on the server.

The current demo top-up still accepts arbitrary Credit amounts at 100 VND per Credit. Package-based purchase is a separate later change. Reward fulfillment and withdrawal eligibility also require separate transaction and ledger design before being enabled.

## Read API

The following `GET` endpoints are public and return the standard `ApiResponse<T>` envelope:

| Path | `data` | Visibility rule |
| --- | --- | --- |
| `/api/v1/pricing/credit-packages` | `CreditPackageResponse[]` | Active packages, ordered by `display_order`. |
| `/api/v1/pricing/subscription-plans` | `SubscriptionPlanResponse[]` with `prices` and `entitlements` | Active plans with an active price valid at request time. For each billing period, the newest valid price is returned. |
| `/api/v1/pricing/rewards` | `RewardCatalogItemResponse[]` | Active reward entries, ordered by `display_order`. |

These endpoints publish catalog data only. They do not calculate a user's Plus discount, reserve a price, create a payment, or grant a reward. A future checkout must re-read the server-side catalog and snapshot the final amount on the payment.
