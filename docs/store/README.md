# Farket: store listing texts

Copy-paste source for App Store Connect and Google Play Console. Limits: name/title 30,
subtitle 30, Play short description 80, keywords 100, descriptions 4000 characters.
Rules: no diagnosis claims, no "detects autism", no fear. The word "autism" only appears in
the iOS keyword field (search), never in titles or descriptions.

- Privacy policy URL: https://farket.uclergnlts.com/app-privacy/
- Support / contact: uclergnlts_0101@hotmail.com
- Category: Health & Fitness (iOS: Medical is not needed, the app makes no clinical claims)
- Age rating: 4+ / Everyone (content); the app itself asks the user to confirm 18+.
- Bundle id / package: com.uclergnlts.farkettakip

Languages: [en](en.md) · [es](es.md) · [pt-BR](pt.md) · [fr](fr.md) · [tr](tr.md) · [ar](ar.md)

## Google Play: Data safety answers
- Data collected: Health info (diary notes), Personal info: none beyond a nickname (Name: optional nickname),
  App activity: none, Device ids: none, Purchase history: yes (via Google Play / RevenueCat).
- Shared with third parties: No (processors only: Supabase, OpenAI, RevenueCat).
- Encrypted in transit: Yes. Users can request deletion: Yes (in app, Settings > Delete all my notes).
- Collection is required for the app to work (notes); AI suggestion is optional and user-started.
- Health apps declaration: "Health research / diary" type, not a medical device; no diagnosis.
- Target audience: 18+ (parents). Not designed for children; not in the Families program.

## Apple: App Privacy answers
- Health & Fitness > Health: collected, linked to the (anonymous) user, used for App Functionality, not for tracking.
- Purchases: collected, linked, App Functionality.
- User ID: collected (anonymous id), linked, App Functionality.
- Tracking: No. No third-party advertising.

## Subscriptions (both stores)
- farket_premium_monthly: $5.99 / month, 7-day free trial
- farket_premium_yearly: $39.99 / year, 7-day free trial
- farket_doctor_report: $4.99, consumable (one PDF)
- RevenueCat entitlement: premium (attach both subscriptions)
- Subscription group name: "Farket Premium"
