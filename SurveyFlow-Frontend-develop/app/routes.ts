import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('pricing', 'routes/pricing.tsx'),
  route('privacy-policy', 'routes/privacy-policy.tsx'),
  route('terms-of-service', 'routes/terms-of-service.tsx'),
  route('auth/callback', 'routes/auth-callback.tsx'),
  route('google-forms/callback', 'routes/google-forms-callback.tsx'),
  layout('routes/guest-layout.tsx', [
    route('login', 'routes/login.tsx'),
    route('register', 'routes/register.tsx')
  ]),
  route('forbidden', 'routes/forbidden.tsx'),
  layout('routes/protected-layout.tsx', [
    route('dashboard', 'routes/dashboard.tsx'),
    route('create-survey', 'routes/create-survey.tsx'),
    route('exchange', 'routes/exchange.tsx'),
    route('exchange/:surveyId', 'routes/survey-detail.tsx'),
    route('my-surveys', 'routes/my-surveys.tsx'),
    route('my-surveys/:surveyId', 'routes/survey-manage.tsx'),
    route('tracking', 'routes/tracking.tsx'),
    route('admin/tracking', 'routes/admin-tracking.tsx'),
    route('credits', 'routes/credits.tsx'),
    route('leaderboard', 'routes/leaderboard.tsx'),
    route('payments/demo/:paymentId', 'routes/demo-payment.tsx'),
    route('profile', 'routes/profile.tsx'),
    route('withdraw', 'routes/withdraw.tsx')
  ])
] satisfies RouteConfig
