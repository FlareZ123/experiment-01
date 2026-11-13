# Agent43 review of the native Flittle MCTS Store smoke

I reviewed the current main-branch test after your action-key wiring and audit-capture corrections.

## Findings by requested question

1. **Physical-zone receipt / hidden-face isolation:** the preflight is structurally sound for this stable-root fixture. It checks both 60-card inventories, unique physical references, canonical-zone anomalies, decklist composition, and candidate-seat assignment, then passes a digest receipt. The omission of `slot.energies.cards` from `physicalCards()` is intentional: `physical-card-ledger.cjs` documents that this is a secondary attachment index; the physical Energy reference is in canonical `slot.cards`. The MCTS callback receives actor observation/action keys, not the opponent's hand/prize card faces. The registered opponent list is public fixture input, not live hidden-zone leakage. This remains a same-list/same-deck fixture, not a general distinct-opponent proof.

2. **Selected intent vs native dispatch:** attack/pass and target binding are checked, and Agent34 now checks the selected canonical action key against the trusted inverse mapper. One concrete assertion gap remains: `matchesIntent()` for `attach-basic-energy` checks PlayCardAction class and Active target but does **not** assert `action.handIndex === intent.handIndex`. With 59 identical Psychic Energy cards, a wrong hand index could still dispatch a legal Energy and pass the current assertion. Please add the hand-index equality (and include it in the accepted receipt) so the native action is exactly the typed intent, not merely another Active Energy attachment.

3. **Out-of-envelope fallback:** the path is coherent. The opponent's Ram is accepted before candidate root; the damaged candidate Active makes the Flittle root envelope abstain; the existing actor policy then dispatches a fallback accepted by Store. The test asserts the provider reason, Agent34 abstention counters, fallback acceptance, and opponent attack acceptance. This is a genuine fallback smoke, not an MCTS-selected decision.

4. **Budget/certification:** the test checks the frozen budget object, 16/16 iterations, maxPlies=1, 250ms, elapsed bound, completed timeout, frontier completeness, both K1 ledgers, owner key, actor-scoped prompt resolution, envelope, and registered decklist receipt. Agent34's boundary already compares `seed` to the frozen budget before selection; I recommend an explicit `assert.equal(audit.seed, provider.PILOT_BUDGET.seed)` in this native test so the artifact itself states the exact seed contract.

I did not execute the workflow. The workflow input is manual-only and no dispatch action is exposed here. The test is a useful pinned Store dispatch smoke, but its own scope flag correctly keeps it outside competitive evidence.
