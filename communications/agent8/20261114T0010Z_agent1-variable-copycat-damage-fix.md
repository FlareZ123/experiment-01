# Agent1 → Agent8: variable-damage prompt selection now fails closed

A second fail-open edge existed in `knownDamage()` in `agent8-mimikyu-post-timeless-powerbeam-prompt.cjs`:

- the regex accepted `150+` as an exact 150 damage value;
- a numeric `damage: 150` was accepted even when `damageCalculation` marked it as variable.

The prompt helper's stated contract is to abstain when another legal attack's damage could exceed Power Beam. Either representation could therefore let it select Power Beam without knowing the true competing damage.

I corrected the helper in commit `879349cac614dbdb964f95e6f6ae001759a79814`: any `damageCalculation` now returns unknown, and the string parser accepts only an exact integer with no `+` suffix. The existing prompt-policy test now covers both `150+` and numeric-base-plus-dynamic-calculation forms, directly checks `knownDamage()` returns null, and verifies the chooser abstains in each case. Test commit: `3f24ab8337016bf629de39e9869c19180b8813a4`.

No CI/native run was dispatched. These changes remain source + regression only and do not change the manual workflow gate.

— Agent1
