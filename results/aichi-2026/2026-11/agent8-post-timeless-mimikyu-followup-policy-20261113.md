# Post-Timeless Mimikyu follow-up policy

**Date:** 13 November 2026  
**Status:** implemented as a default-off, candidate-seat-only Agent34 policy extension; unit tests added; no native workflow run or competitive game qualification.

## Question

After the candidate's Mimikyu GRI copies Regidrago VSTAR's Apex Dragon and uses Dialga-GX's Timeless-GX, what should the candidate do on the granted extra turn? The staged native fixture already identifies two distinct follow-ups:

1. Latias ex / Skyliner free Retreat into Shadow Rider Calyrex VMAX, then Max Geist.
2. Keep Mimikyu active and use Copycat again, selecting Radiant Eternatus's Power Beam.

The policy must not silently assume that retreating to Max Geist is always superior.

## Implemented decision boundary

The new Agent34 option is deliberately opt-in and candidate-seat scoped:

```js
{
  mimikyuApexFundedPromotion: true,
  mimikyuTimelessMaxGeistRetreatRoot: true,
  mimikyuTimelessMaxGeistRetreatRootOwnerSeat: candidateSeat
}
```

The legacy `mimikyuApexFundedPromotion` option is required because it enables the public Copycat-history receipt used by the new root intent. Enabling the new option without the legacy option or an explicit physical seat is rejected.

### Public extra-turn observation

`simulation/twinleaf/actor-observation-contract.cjs` now exposes:

```js
ownTurnResources.extraTurnActive =
  owner.usedTurnSkip === true && state.activePlayer === seat
```

The same public printed snapshot now includes detached `printed.subtypes`, which preserves TAG TEAM / VMAX / V-UNION prize classification without exposing hidden zones. These are derived owner-visible card fields, not Store internals. The contract regression verifies the subtype array is frozen, verifies both physical seats for the extra-turn marker, and verifies that the raw `usedTurnSkip` field is not copied into the observation.

### Max Geist root intent

`simulation/twinleaf/2026-11/agent8-post-timeless-maxgeist-root-intent.cjs` proposes a Skyliner free Retreat only when all of the following are publicly established:

- The acting seat is the explicitly registered candidate seat.
- Mimikyu GRI is Active, has at least two Basic Psychic Energy, the owner's GX is spent, and the Timeless extra-turn marker is active.
- The owner's public discard contains Dialga-GX UPR and does **not** contain Radiant Eternatus CRZ. If Radiant Eternatus is available, Power Beam is a stronger competing Copycat payload and the Max Geist helper abstains.
- The turn-stamped public receipt says the immediately preceding opponent turn ended with Regidrago VSTAR's non-GX Apex Dragon.
- Latias ex SSP with Skyliner is on the Bench; no known Skyliner suppressor, opponent Active Block ability, or opponent Active Wobbuffet with Bide Barricade is present; the owner has not already retreated this turn. Wobbuffet PHF 36 is in the rank-10 source list: its Active-only Bide Barricade suppresses Latias ex (Dragon) but explicitly exempts Psychic Pokémon, so Lillie's Clefairy ex / Fairy Zone remains active under that lock.
- Shadow Rider Calyrex VMAX CRE is on the Bench, Max Geist's printed three-Colorless cost is payable (at least three Basic Energy are attached; the candidate list uses Psychic Energy), and the public attack/retreat restrictions do not block the line.
- The public target has no tool, resistance, or unmodelled damage/prize text that would invalidate the conservative projection.

The existing Agent42 Max Geist damage helper counts Basic Psychic Energy across the owner's board. If Lillie's Clefairy ex JTG with Fairy Zone is publicly present and the shared ability-suppression guard passes, the proposal doubles Max Geist against a Dragon Active. It uses the target's public HP and damage counters and reports the projected prize count (VMAX / TAG TEAM: three; other Rule Box: two; otherwise one). It proposes the retreat only for an immediate KO. The native Store remains authoritative for retreat legality, attack settlement, Weakness, and prize awards; the intent explicitly remains unverified until the Store accepts and settles it.

For example, two Psychic Energy on Mimikyu plus three on Shadow Rider yield 160 printed Max Geist damage. With an unsuppressed Fairy Zone against a Dragon Active, the projected damage is 320. This can cross a 280-HP TAG TEAM Dragon threshold, while retaining the three-prize value in the projection. This is a conditional board-state calculation, not a matchup result.

### Power Beam prompt choice

`simulation/twinleaf/2026-11/agent8-mimikyu-post-timeless-powerbeam-prompt.cjs` handles the alternative branch at the native `ChooseAttackPrompt` boundary. It requires:

- the acting seat is the owner of the prompt;
- Mimikyu GRI is Active;
- `usedGX` and `usedTurnSkip` are both true;
- the public Copycat tracker records the previous opponent turn's Regidrago VSTAR Apex Dragon;
- Radiant Eternatus CRZ is in the owner's discard and in the exact prompt's card list;
- Power Beam is validated by the native prompt and no stronger known legal non-GX damage attack is offered.

It returns the exact physical Power Beam Attack object. GX attacks are excluded because the owner's GX has already been used. Unknown variable-damage alternatives cause an abstention rather than an unsupported ranking. The Agent34 prompt resolver invokes this helper only for the same explicitly opted-in candidate seat, after the existing Timeless prompt selector has had first refusal.

This creates a conservative split: when Radiant Eternatus is available, keep Mimikyu active and select the strongest known non-GX Copycat payload (Power Beam in the candidate list); when it is not available, consider Skyliner → Max Geist only if the projected attack immediately KOs. Neither branch is a universal game-policy optimum; both are narrowly gated.

## Validation and limitations

- Added public extra-turn and printed-subtype contract regressions in `tests/actor-observation-contract.test.cjs`. Added an Agent8-local Bide Barricade veto and regressions showing Active Wobbuffet blocks the Skyliner line while a benched Wobbuffet does not; Agent6 has been asked to extend the shared suppression guard. This Wobbuffet-specific regression was added after run 43401024755 and has not yet run in CI; an isolated V8 smoke test confirmed Active-Wobbuffet abstention and benched-Wobbuffet continuation.
- Added Agent34 root-policy regressions in `tests/agent34-actor-only-root-policy.test.cjs` for candidate-seat scoping, the extra-turn/Apex receipt, Fairy Zone damage, Rule Box prize projection, Radiant Eternatus abstention, and Power Beam prompt selection.
- Added those tests to the existing manual `.github/workflows/mimikyu-copycat-regression.yml` workflow. Temporary path-filtered pushes launched runs `43399409555`, `43400634039`, and `43401024755`; the push trigger has since been removed and the workflow restored to manual-only. In [run 43401024755](https://github.com/FlareZ123/experiment-01/actions/runs/43401024755), the actor-observation / Agent34 policy test step passed, as did native fixture steps 7–15, including the 280-HP Fairy Zone Copycat KO / Prize characterization. Step 16 failed only at the Agent1 fixture's prompt-count assertion: `resolvePending` allowed one prompt resolution but the Power Beam branch produced two. Agent1 has been notified; this is not a failed damage/Prize assertion.
- Helper and root-policy source syntax was parsed. An isolated V8 smoke test with mocked dependency functions exercised the Max Geist proposal (160 base / 320 Fairy Zone / one prize against a 70-HP Dragon) and exact Power Beam prompt selection. This is not a substitute for running the Node test suite or the pinned Store.
- The existing native staged runner `simulation/twinleaf/agent1-mimikyu-timeless-skyliner-maxgeist-native.cjs` compares the two native follow-up mechanics, but it does not yet call this new Agent34 policy. Its Power Beam comparison currently needs a two-prompt allowance; Agent1 has been asked to correct that fixture assertion.
- No complete source-dealt game, both-seat paired run, full rank-10 matchup, or paper-qualified Expanded game was produced. The Aichi benchmark remains at zero verified Expanded-legal opponent lists in the current decision board. No win-rate estimate is supported, and there is no 99.5% claim.

## Next useful experiment

Use a candidate-specific role identity with the options above against the authenticated rank-10 Regidrago source list, with the candidate in both physical seats and both first-player assignments. Keep the policy default-off for all other roles. Capture whether the root helper selected Max Geist, whether the prompt helper selected Power Beam, the native Store's accepted actions and prize settlement, and all abstentions. Only then consider a matched full-game policy A/B; do not treat the staged fixture or a successful single KO as competitive evidence.

## Code and tests

- Agent34 policy version: `agent34-actor-only-root-slice-v13-post-timeless-wobbuffet-guard`; Max Geist helper version: `agent8-post-timeless-maxgeist-root-intent-v3-wobbuffet-bide-barricade`; Power Beam prompt helper version: `agent8-mimikyu-post-timeless-powerbeam-prompt-v1`.

- `simulation/twinleaf/actor-observation-contract.cjs`
- `simulation/twinleaf/2026-11/agent8-post-timeless-maxgeist-root-intent.cjs`
- `simulation/twinleaf/2026-11/agent8-mimikyu-post-timeless-powerbeam-prompt.cjs`
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs`
- `tests/actor-observation-contract.test.cjs`
- `tests/agent34-actor-only-root-policy.test.cjs`
- `.github/workflows/mimikyu-copycat-regression.yml`
- Native mechanics fixture: `simulation/twinleaf/agent1-mimikyu-timeless-skyliner-maxgeist-native.cjs`
