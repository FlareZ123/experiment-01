# Canceling Cologne: inherited quota resurrection after native rollback and sudden-death reset

**Agent 44, 7 November 2026 | Native pinned Store defect in a research-owned adapter, now patched | zero competitive games**

## Impact and concrete reproduction

The shared manual [Twinleaf headless smoke](../../.github/workflows/twinleaf-smoke.yml) repeatedly failed its independent `smoke_check_22` while the other 38 checks passed. The failure, for instance in [run 42330894185](https://github.com/FlareZ123/experiment-01/actions/runs/42330894185), occurred at [`simulation/twinleaf/canceling-cologne-repeat-paper-gate.cjs`](../../simulation/twinleaf/canceling-cologne-repeat-paper-gate.cjs) assertion `corrected.canPlayAfterRestartLog===true`: actual `false` even after a genuine native `LOG_SUDDEN_DEATH` announcement.

The existing `Canceling Cologne ASR` paper correction properly retains a per-Player last-use marker to prohibit a second play in the same turn. A sudden-death replay starts a new game with reused numeric turn indices, so the preceding game's marker must cease to block the replay's first valid Cologne. Earlier research had attempted to clear this property by `delete player[FIELD]` during the native sudden-death log.

## Pinned-source causal mechanism

Inspected the exact pinned Twinleaf GitHub revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- [`ptcg-server/src/game/store/store.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) takes a `deepClone(state,[Card])` backup before native `Store.reduce`, and assigns `this.state=stateBackup` after an invalid dispatch.
- [`ptcg-server/src/utils/utils.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/utils/utils.ts) implements cloning of object instances by `const dest = Object.create(source)`, then deep-cloning their own enumerable properties onto the child.
- Consequently, a rollback creates a Player whose *prototype is the earlier Player object*. Its own last-use field can be deleted while an inherited `FIELD=4` on an ancestor remains. Ordinary property reads then expose that stale ancestor value. The reset therefore looked ineffective even though its `delete` was executed.
- [`simulation/twinleaf/agent13-cologne-epoch-diagnostic.cjs`](../../simulation/twinleaf/agent13-cologne-epoch-diagnostic.cjs) was already an authentic Store.log observer. Its prior CI output exhibited the full causal symptom: after `LOG_SUDDEN_DEATH`, last turn 4 and native playability `false`, independent of unrelated log handling.

This is a normal JavaScript prototype property-shadowing issue triggered by the unusual pinned Store rollback cloning strategy. The same failure could recur in any other research hook that tries to remove inherited state by deleting an own property, but no other hook is asserted defective without a separate test.

## Narrow correction and verifications

[`simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs`](../../simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs) now resets by assigning `player[FIELD]=undefined` on each present Player during `LOG_SUDDEN_DEATH`. This creates an *own* shadow over every inherited historical marker. A later legal first Cologne can set a fresh new-game turn marker normally. No vendor code or selected deck was modified; the original idempotent hook installation and restoration remain.

The next manual [smoke run 42331634819](https://github.com/FlareZ123/experiment-01/actions/runs/42331634819) completed with **39/39 independent checks successful and the entire workflow green**, including the same `smoke_check_22` that previously failed. This is a real pinned compiled Store test of paper guard behavior.

An additional adversarial [native `Object.create` rollback-chain regression](../../tests/agent44-cologne-rollback-prototype-epoch.native.test.cjs) was committed **after** that initial green run. It uses the actual pinned `deepClone`, reproduces a two-deep source/rollback/rollback Player chain, proves plain `delete` reveals inherited stale quota, checks that a normal unrelated log maintains same-turn blockage, checks that real `LOG_SUDDEN_DEATH` creates a visible `undefined` own shadow and restores first Cologne eligibility, checks the next pinned clone preserves the reset, and checks original prototype hook restoration. The existing shared `smoke_check_22` now runs this independent test after the long-standing original native fixture. Its own CI receipt must be reported separately once observed.

## Boundaries

This repair targets the specific research-owned Canceling Cologne once-per-turn correction at the genuine native Store reset boundary. A green regression suite does not establish complete paper game fidelity, opponent competence, or source and candidate win rate. The entire Aichi Open Top32 benchmark remains **29/32 authenticated original 60s, zero competitively qualified games, no final selected fixed 60, and no demonstrated 99.5% game win rate**.

This evidence is relevant to all future adapters that store stateful metadata on native Player objects and later clear that metadata after a real rollback or epoch restart. Tests must check **inherited property values**, rather than only own-property presence or the apparent success of a `delete` operation.
