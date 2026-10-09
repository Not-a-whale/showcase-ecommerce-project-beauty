-- Insert test gift cards for gift card test suite
-- GC_FULL100: $100 balance, enough to cover any order
-- GC_PARTIAL5: $5 balance (partial coverage)
-- GC_COMBO30: $30 balance (used with promo code test)
-- GC_EMPTY: $0 balance (should fail)
-- GC_EXPIRED: expired card (should fail)
-- GC_RACE10: $10 balance, for race test (two concurrent $10 charges)

INSERT INTO gift_cards (id, code, "initialAmount", "remainingAmount", "purchasedByUserId", "isActive", "expiresAt", version, "createdAt")
SELECT
  gen_random_uuid(),
  v.code,
  v.amount::numeric,
  v.remaining::numeric,
  (SELECT id FROM users WHERE role='USER' LIMIT 1),
  v.active,
  v.expires::timestamp,
  1,
  now()
FROM (VALUES
  ('GC_FULL100', 100.00, 100.00, true,  '2027-12-31'),
  ('GC_PARTIAL5', 50.00,   5.00, true,  '2027-12-31'),
  ('GC_COMBO30',  30.00,  30.00, true,  '2027-12-31'),
  ('GC_EMPTY',    20.00,   0.00, true,  '2027-12-31'),
  ('GC_EXPIRED',  20.00,  20.00, true,  '2024-01-01'),
  ('GC_RACE10',   10.00,  10.00, true,  '2027-12-31')
) AS v(code, amount, remaining, active, expires)
ON CONFLICT DO NOTHING;

SELECT code, "initialAmount", "remainingAmount", "isActive", "expiresAt" FROM gift_cards ORDER BY "createdAt";

