# Rank-10 Regidrago versus rank-6 Iron Thorns: last-Bench owner-choice negative control

**Agent 11, 29 October 2026. Evidence:** exact original Aichi 60-card printing inventory plus deterministic pure test of the shared first-return actor chooser. **Genuine native game dispatches:** none in this investigation. **Competitive-qualified games:** zero.

## Research question

Does the shared chooser have a source-printed, owner-visible last-Bench decision where a disabled entry-draw support Basic is played ahead of an attacker Basic solely because the support card appears first in hand?

The original [29-source manifest](full-decklists.json) identifies exact rank 10 as Regidrago with 4 `Regidrago V SIT` and 1 `Dedenne-GX UNB`. Exact rank 6 is Iron Thorns with 4 `Iron Thorns ex TWM`. Both 60-card counts are asserted independently. The [field manifest](field.csv) confirms the ranked archetypes. The existing [source fingerprint map](../../scripts/aichi-source-fingerprint-map.cjs) is the authoritative rank/name/printing provenance validator for future registered live games.

Previous Agent 11 [native entry-draw lock tests](../twinleaf/dedenne-crobat-entry-lock.md) established a **pinned raw Twinleaf pre-Bench Ability lock defect**, and a reversible opt-in correction: with opponent Active Iron Thorns ex, Dedenne's entry-draw Ability is suppressed under the guard. Therefore a new native case must run with the corrected lock semantics, or state explicitly that it is unguarded. This document does not imply the raw engine automatically provides correct ability suppression.

## Reproduced pure policy conflict

Synthetic detached owner-root, `globalTurn:2`, rank-10-compatible source printings:
- Public opponent Active: `Iron Thorns ex TWM`.
- Own Active: `Budew ASC`, with four occupied Bench spots and exactly one remaining.
- Owner's physical hand order: `[Dedenne-GX UNB, Regidrago V SIT]`.
- No general Basic-hand play prohibition. This distinguishes Iron Thorns' in-play Ability suppression from an effect actually forbidding the play of Ability-bearing Basic cards.
- Partial action catalog correctly identifies Dedenne-GX as a Basic with an Ability and Regidrago V as a Basic. Attack and search planning are intentionally outside this pure choice fixture.

**Actual shared first-return result:** `bench-basic`, hand index 0, Bench index 4, Dedenne-GX. With the two hand cards reversed while all public constraints remain unchanged, the same code selects Regidrago V. Both choices are source-printed and would consume the only available Bench spot. This is an *observed deterministic heuristic-ordering conflict*, not an observed missed native legal action nor an objective proof that Regidrago is always the better Bench choice.

The `abilityPokemonPlayLocked=true` control selects Regidrago V in the same synthetic state. Iron Thorns' Initialization should not be represented as that stronger hand-play prohibition. A sound plan should represent entry-trigger value under actual Ability suppression, future attacker requirements and Bench scarcity explicitly.

## Reproduction and release intake

- Pure test: [`tests/agent11-rank10-thorns-bench-hold.test.cjs`](../../tests/agent11-rank10-thorns-bench-hold.test.cjs), directly imports the actual [shared actor chooser](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs), checks both exact original deck inventories, hand-order reversal and separate play-prohibition control.
- Reused existing **manual-dispatch** [field evidence workflow](../../.github/workflows/aichi-global-field-gate.yml); no new workflow or automatic-per-commit CI.
- Run: [manual gate 40975156754](https://github.com/FlareZ123/experiment-01/actions/runs/40975156754). Record its final result before promoting this from uncompiled source inspection to a compiled regression.

## Necessary next level of qualification

In the canonical existing bilateral runner, capture a naturally dealt owner-visible rank-10 versus rank-6 decision with a genuine final Bench slot, legal Dedenne and Regidrago options, corrected Iron Thorns lock, and physical source-deal identity. If such a state is rare, preserve its denominator and avoid manufacturing prevalence. Native-settle each printed Basic with a same-deal controlled fork, authenticate ability suppression and Bench occupancy, follow the opponent's response, and report whether the intended Regidrago or other attacker line is genuinely constrained. A legitimate hold may preserve a support Basic when its immediate Ability cannot resolve; any general chooser change needs such native positive and negative cases.

**Boundaries:** This is a source-grounded policy negative control, not a real Aichi matchup result or a recommendation to always reserve Dedenne. It should be included as an option-cost/Bench-contention regression for Agent 41's integrated, owner-visible arbitration profile, without changing the shared first-return baseline.

**Global status:** 29/32 exact printed original 60s, missing ranks 23/25/28; zero competitively qualified games and no evidence for a fixed-60 99.5% deck.
