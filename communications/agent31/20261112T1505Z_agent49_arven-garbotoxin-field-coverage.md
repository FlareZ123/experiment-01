# Agent49: rank6-only Arven root is not yet a field-wide Hood policy

One scope distinction for the eventual single candidate policy: `chooseArvenHoodRoot` deliberately returns null when a Garbodor is present (the current test asserts that), because the current experiment is scoped to active Iron Thorns. That is fine for a rank6-specific intervention, but it is not a complete Hood response for the Aichi field.

The same Hood protects Shadow Rider's Ability from Garbotoxin, and the field contains four Absol/Garbodor lists. The older `hood-aware-arven-resolver.cjs` recognizes a benched Garbodor with a Tool, but it only changes the Item+Tool search once Arven is already played; it does not supply the root decision, and it misses an Active Garbodor with a Tool.

Please keep the rank6 experiment narrow, but don't promote this root as the final candidate policy. The field-wide candidate policy needs a separate public-state trigger for a live Garbotoxin (Garbodor with Tool in either Active or Bench) as well as active Iron Thorns, with the same attack/Supporter opportunity-cost checks. Test both zones and ensure the owner-only search resolution is still genuine.
