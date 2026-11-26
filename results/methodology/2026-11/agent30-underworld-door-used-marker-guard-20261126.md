# Underworld Door source-use guard in the Hood candidate policy

**Status:** implemented on PR #69's draft candidate-policy branch; exact-head contract-only acceptance passed. Not integrated into main and not used by the registered V3 route.

## Question

Does the PR #69 candidate worker reliably avoid selecting a Shadow Rider Calyrex VMAX whose once-per-turn Underworld Door ability has already been used?

## Finding

The pre-fix `canUseUnderworldDoor(view, item)` gate checked the source's printing, actor ownership, Ability suppression, Psychic Energy in hand, and a printed-Psychic Bench target. It did not consume the existing actor-owned `publicEventReceipt`.

That omission mattered because the receipt already exposes the native per-source marker:

- `simulation/twinleaf/agent8-public-event-receipt.cjs` emits `knownAbilityUse: [{name: 'Underworld Door', usedThisTurn: ...}]` for each face-up Shadow Rider Calyrex VMAX.
- `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` validates the receipt's owner Active / Bench slots against the actor observation, including exact printing and known ability-use rows.
- The worker request already carries this validated receipt. No new protocol field, Twinleaf hook, or engine change was needed.

Without consuming that evidence, the worker could choose a source whose marker was already spent. It could also fail to distinguish that source from another VMAX whose ability remained unspent.

## Change

On PR #69 branch `agent46/candidate-policy-competence-20261124`, commit `ac62fa2b0df3946ccaa018d552dff13b9ff3b1b5`:

1. `canUseUnderworldDoor` now receives the existing public event receipt.
2. A new source-bound check selects `ownerActive` or the indexed `ownerBench` entry from the action metadata.
3. The receipt printing must match the exact actor-observed source.
4. Exactly one `Underworld Door` use row must exist and report `usedThisTurn === false`.
5. Missing, unknown, already-used, mismatched, or unsupported receipts fail closed.

The worker remains a pure actor-only policy. The fixed 60-card list and main branch were not changed.

## Regression coverage

The candidate policy tests now cover:

- both physical seats;
- a used source;
- unknown marker state;
- a missing receipt;
- a used Active VMAX alongside a separate unspent Bench VMAX, verifying that the Bench source remains selectable;
- existing positive root cases supplying the receipt contract.

The first contract-only attempt at predecessor SHA `69162f583d0faaf9693827f8e55f6c190ec3280e` failed one existing positive fixture because that fixture had not been updated to supply the newly required receipt. The fixture was corrected. The exact-head run at `ac62fa2b0df3946ccaa018d552dff13b9ff3b1b5`, [workflow run 45899200572](https://github.com/FlareZ123/experiment-01/actions/runs/45899200572), **passed**. The pure policy/prompt/worker/action-frontier suite, Docker launcher contract, digest-pinned Docker preflight, and both-seat worker-isolation canary passed. Exact-SHA acceptance artifact: [15153889687](https://github.com/FlareZ123/experiment-01/actions/runs/45899200572/artifacts/15153889687).

## Evidence boundary and disposition

This was a contract-only run. It skipped Twinleaf checkout/compilation, the native no-game witness, all fixture/game execution, matchup evaluation, and win-rate estimation. It does not establish policy competence, paper matchup strength, or any 99.5% result.

PR #69 remains draft. Its branch is separate from main; the current-main V3 runner does not load this branch head. Do not merge or port this change into main before the unchanged V3 diagnostic pair receives the separately required owner authorization and execution. The registered pair remains unrun.

## Next useful action

Obtain an independent source-level review of the source-slot binding and receipt fail-closed behavior. If accepted within PR #69's scope, retain it for later candidate-policy integration; do not broaden this into a new policy framework or infer competitive strength from the contract pass.
