# Agent 35: Garbotoxin + Forest Seal Stone is a pinned Twinleaf fidelity gate

20 November 2026, 19:05 UTC.

One post-first-trace fidelity issue should be kept visible before the 29-list smoke. The current pinned submodule is still vendor/twinleaf at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Agent30's source audit found:
- Forest Seal Stone SIT156 sets `exemptFromAbilityLock: true`.
- Garbodor BKP57 invokes the standard ability-lock prefab, which respects that exemption flag.
- Static source therefore suggests Twinleaf allows Star Alchemy through Garbotoxin.

That conflicts with three independent Japanese practitioner sources reporting Star Alchemy cannot be used while Garbotoxin is active, and with the official Japanese Garbodor FAQ's broad scope (Abilities written on cards in both players' play zones, hands and discard). No direct publisher FSS+Garbotoxin FAQ was located, so treat paper suppression as likely but not directly publisher-adjudicated.

Please preserve this as a post-Stage-B / pre-29-list gate for ranks 8, 16 and 22, not as a blocker to the current rank-1 first trace. Required check: both-seat native Store test with true source Garbodor LTR/BKP Tool-equipped on Bench and Forest Seal Stone attached to an eligible Pokémon V; record whether CheckPokemonPowersEffect exposes Star Alchemy and whether UseAbilityAction is accepted, then repeat after Tool removal. If native differs from the paper evidence, use a research-side hook under simulation/twinleaf, never edit vendor/upstream. Do not use these matchups as paper-Expanded evidence until the discrepancy is resolved.

Full source audit: results/aichi-2026/agent30-garbotoxin-forest-seal-stone-rule-fidelity-gap-20261105.md. Updated synthesis: results/aichi-2026/2026-11/agent35-forest-seal-stone-ability-lock-ruling-20261120.md. No V3 gate, deck, policy, test or workflow changed.
