# Two-profile candidate policy: opening, target, Gate and terminal corrections (28 Nov 2026)

**Scope:** approved single successor worker `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs`, for the unchanged exact Hood Shield and Lockbridge Shadow Rider profiles. This report is an implementation handoff, **not** candidate nomination, policy qualification, native simulation, real-game evidence, CI authorization or win-rate evidence. The owner game gates remain closed.

## Integrated source changes

1. **First-player setup trigger preservation — `c487cad53f8598cbf9b12adca275a3408f2fe7ab`.** When the owner is known to start first, preserve entry-trigger Tapu Lele-GX and Radiant Eternatus in hand rather than Bench them solely as lone-board insurance. No opponent turn can intervene before that first turn, whereas putting either onto the setup Bench wastes its on-play-from-hand Ability opportunity. Keep the old backup policy when starting second (risk of opposing first turn) or when orientation is unknown; retain nontrigger backup Dialga. Existing positive Bench placements stay available. The prior independent source-worker decision matrix has 64/64 oriented setup expectations; 25,000 valid opening sevens per profile/orientation estimate altered first-player setup decisions in 5.472% Hood and 5.056% Lockbridge, *not* win rates. The branch adds both-seat, both-profile, both-orientation regression cases to the existing setup suite. [Independent handoff](../../../communications/agent46/2026-11/20261127T231250Z_agent27-go-first-setup-trigger-dominance-64cases.md).

2. **Unhooked Astral target pool — `b19adbead9b5123be943881ab1bad5883b38a2c0`.** With no `paperAstralBarrageTargets` hook, pinned CRE74 only selects opponent Bench targets; root scorer formerly valued an Active KO it cannot select. The new scoring pool matches the legal target pool; hooked mode still scores all opponent Pokémon. Regression includes a wounded Active with two Mist-protected Benched Pokémon and a positive control in which actual Bench protection is removed.

3. **Blocked Gate reserve — same commit `b19adbe`.** Previously, holding Radiant Eternatus with three or fewer Bench spaces vetoed a useful second Shadow Rider V even under Iron Thorns Initialization or Path to the Peak, where Gate cannot currently resolve. The reserve now requires `canPlayRadiantForGate(view)` or a currently actionable `gatePivotView(view)`. Regression covers Iron Thorns, Path, and the live-Gate control. Agent2's independent exact-worker matrix for items 2–3 found 12 expected decision changes and 16 preserved controls, across two profiles and seats. [Independent handoff](../../../communications/agent46/2026-11/20261127T2300Z_agent2-exact-worker-28case-receipt.md).

4. **Provably suppressed terminal Ability — `3018d47194d65c3b8434984e4f3fd2bc427bd67e`.** A final-Prize Max Geist now admits an opposing Ability only when currently active public lock sources independently prove it suppressed (or an effective live Stadium suppresses it). A stale `abilitySuppressions` row *alone* is not proof. This avoids both missing an immediate win through active Garbotoxin and accepting a phantom one after a projected source leaves play. Regression uses both positive suppression sources and no-source/live-Ability controls. Agent2's independent worker matrix found 8 expected changes and 12 preserved controls. [Independent handoff](../../../communications/agent46/2026-11/20261127T2305Z_agent2-proven-suppressed-terminal-ability.md).

## Test and execution status

The committed test additions are in `tests/2026-11/agent46-two-profile-setup.test.cjs` and `tests/2026-11/agent46-two-profile-root.test.cjs`. They are authored and committed, but **not yet executed with Node after these commits**. The GitHub connector can mutate and read source but the local shell has no repository checkout and direct GitHub DNS resolution fails. The earlier V8 source-worker receipts above are independent evidence for the narrow edits, **not a result from the updated branch's full test suite**.

Next owner action in a checkout-capable, approved *local-test* environment:

```bash
node --test tests/2026-11/agent46-owner-prize-facts.test.cjs \
  tests/2026-11/agent46-two-profile-root.test.cjs \
  tests/2026-11/agent46-two-profile-setup.test.cjs \
  tests/2026-11/agent46-native-candidate-prompt-projection.test.cjs
```

Obtain an independent exact-head review of changed decision semantics and fail closed if a test finds a conflicting actor-visible state. No native CI or full-game dispatch, main merge, PR69/71 edit, decklist modification, Stage-A/V3 progression or competitive evidence upgrade has been attempted.

**Decision affected:** usability of both existing fixed-60 candidate policies, especially first-turn on-play Abilities, correct tactical attack selection, timely evolution-base Bench plays, and immediate final-Prize attacks. No new fixed 60 is selected; the 29/32 authenticated field and 0/32 qualified matchup status are unchanged.


## Opponent-owned Tropical Beach fallback — `f9b4fbe71f01ed5b407b95346c97305e454efe8a`

Both profiles lack Tropical Beach but the original Aichi ranks 3, 6 and 29 contain the source BWP 50. An opponent-owned Stadium is usable by either player, so choosing Pass when the native actor frontier offers a legal source-certified Tropical Beach draw is an avoidable lost resource. The successor now considers the exact `use-stadium` action **after** all supported root plays, useful Abilities, attacks, mobility, and terminal Gate. The fallback requires visible exact `Tropical Beach BWP 50` source matching `item.actorPrinting`, `stadiumEffectLive:true`, current hand ≤5, and deck capacity to draw to seven while leaving ≥2. It never infers source BWP 50 from pinned Twinleaf native card set number 28. It does not invent a native action: only an enumerated frontier item can be selected.

The existing root test suite now has a 12-case paired regression (both profiles and seats): both Stadium ownership zones, attack and Bench-play priority, missing/ambiguous/mismatched source, inactive Stadium, hand-size/remaining-deck thresholds. In a source-executing V8 test/assert shim on exact committed head, **74 of 77 root groups passed, 1511 assertions**; the other three root groups require the additional native prompt-projection / owner-prize modules and were **not executed**. Prior to this Beach change, 73 of 76 such root groups passed, and eight of eight pure setup groups (177 assertions) passed with one host-only group skipped. These are genuine current-worker executions in a JS isolate with a lightweight assertion shim, **not** Node's native test runner, complete integration suite, pinned Store, full game, or performance evidence.

A further host prerequisite remains: source-certified mapping of native `Tropical Beach BWP` set 28 to authenticated BWP **50** only when the actual Aichi source permits it. Agent7's [handoff](../../../communications/agent46/2026-11/20261128T0336Z_agent7-candidate-beach-after-pass-competence-fix.md) and Agent32's source-printing bridge are distinct; this candidate policy fails closed without the source-certified projected identity. Do not declare the practical game path complete until the host bridge and full native source receipt have independently passed an authorized integration test.
