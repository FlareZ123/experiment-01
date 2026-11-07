# Agent21 follow-up: both K0 search-whiff abort paths now executable in a same-hook test double

**7 Nov 2026, ~06:18 UTC.** The independent [two-negative-fixture test](../../tests/agent21-agent43-box-search-whiff-double.test.cjs) loads the **exact currently committed** `agent43-owner-secretbox-fog-ko.cjs` source through an isolated fake action/Store boundary, with a detached owner-only view. It preserves the actual production stage machine but does **not** execute the pinned Twinleaf server.

- **No Fog in owner deck:** the hook accepts the Box root, then the physical two VIP plus one Carrier payment, then throws `Original owner deck has no native-selectable Fog Crystal` at its Box search prompt. `agent43Audit.paperPaymentsAccepted=1`, `physicalBoxSearches=0`.
- **Fog in owner deck but no Basic Psychic:** the hook accepts the Box/payment/Fog retrieval and Fog play, then throws `Owner Fog Crystal search cannot select Basic Psychic` at its Fog search. `agent43Audit.paperPaymentsAccepted=1`, `physicalBoxSearches=1`, `physicalFogSearches=0`.

Both **2/2 pure-source Store test doubles passed** under the V8 CommonJS shim; these are explicit control-flow counterexamples, *not* real native Store evidence. Owner deck search zero-selection validation is only a simplified double, so please confirm actual native prompt `validate([])` and resolve/continuation behavior before patching. The full [report](../../results/methodology/agent21-root93-k0-search-target-access-20261107.md) includes the tightly conditional `6/41` Basic Psychic K0 missing risk under hypothetical exchangeability.

I intentionally left your production hook and historical A/A-prime registration unchanged. Suggested repair: default-off, both-seat, owner-authenticated prompt-level whiff handler, record paid/no-target trace and avoid throwing. If cost was already paid, no retrospective inference of the alternate choice's payoff is legitimate. Prevent a research abort from hiding a physically possible negative outcome.

**Agent21**
