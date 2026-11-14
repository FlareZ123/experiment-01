# Post-Timeless Mimikyu follow-up policy

**Date:** 13 November 2026  
**Status:** implemented as a default-off, candidate-seat-only Agent34 policy extension; unit tests added; no native workflow run or competitive game qualification. **Correction (13 November 2026):** the Active-Wobbuffet/Skyliner veto described below is incorrect. Latias ex SSP is Psychic, and Bide Barricade explicitly exempts Psychic Pokémon; see the correction section at the end.

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

### Public observation inputs

The actor observation already exposed `ownTurnResources.extraTurnActive = owner.usedTurnSkip === true && state.activePlayer === seat`; this policy reuses that existing owner-visible Timeless marker rather than adding a duplicate. This run adds detached `printed.subtypes` (for TAG TEAM / VMAX / V-UNION Prize classification) and `publicRestrictions.cannotRetreat` (for generic retreat-lock vetoes). The bench array is produced with `player.bench.map(...)`, preserving physical Store slot indices for the returned `benchIndex`. The contract tests verify the new public fields are detached/frozen and preserve both physical seats for the extra-turn marker; no hidden zones or raw `usedTurnSkip` field are exposed.

### Max Geist root intent

`simulation/twinleaf/2026-11/agent8-post-timeless-maxgeist-root-intent.cjs` proposes a Skyliner free Retreat only when all of the following are publicly established:

- The acting seat is the explicitly registered candidate seat.
- Mimikyu GRI is Active, has at least two Basic Psychic Energy, the owner's GX is spent, and the Timeless extra-turn marker is active.
- The owner's public discard contains Dialga-GX UPR. If Radiant Eternatus CRZ is also available, the current implementation abstains from the Max Geist helper and defers to the second-Copycat Power Beam prompt. This is a conservative branch priority, not a proof that Power Beam is always stronger.
- The turn-stamped public receipt says the immediately preceding opponent turn ended with Regidrago VSTAR's non-GX Apex Dragon.
- Latias ex SSP with Skyliner is on the Bench; no known true Skyliner suppressor or opponent Active retreat-blocking Ability is present; the owner has not already retreated this turn. Wobbuffet PHF 36 is in the rank-10 source list, but Latias ex SSP is Psychic (not Dragon), so Active Bide Barricade's explicit Psychic exception preserves Skyliner. Lillie's Clefairy ex / Fairy Zone, Mimikyu, and Shadow Rider are also Psychic and remain exempt.
- Shadow Rider Calyrex VMAX CRE is on the Bench, Max Geist's printed three-Colorless cost is payable (at least three Basic Energy are attached; the candidate list uses Psychic Energy), and the public attack/retreat restrictions (including generic `cannotRetreat`) do not block the line.
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

Under helper v4 this created a conservative PowerBeam-first split: when Radiant Eternatus was available, the root helper did not consider Skyliner → Max Geist, regardless of target HP or Max Geist projection; when absent, it considered Max Geist only for an immediate KO. Both attacks are Psychic-type and share the same Weakness multiplier. If N Basic Psychic Energy remain attached across the board after retreat, Max Geist is 10+30N (190 at N=6; 220 at N=7), versus Power Beam 200. At N≥7, Max Geist can exceed Power Beam and may uniquely cross a target-HP threshold; if both KO, the one-Prize Mimikyu route may still be preferable to exposing the three-Prize VMAX. This describes the v4 baseline and is superseded by the v5 terminal-only crossover below.

## Validation and limitations

- Added printed-subtype and generic `cannotRetreat` contract regressions in `tests/actor-observation-contract.test.cjs`; the extra-turn marker was already present. Added Active/bench Wobbuffet regressions in `tests/agent34-actor-only-root-policy.test.cjs`. **Correction:** the Active-Wobbuffet veto and its test expectation are wrong; the pinned engine exempts Psychic Latias ex from Bide Barricade. The previous isolated V8 smoke test only confirmed the helper's incorrect abstention, not the paper rule or correct engine behavior. Change the Active-Wobbuffet assertion to expect a valid proposal, just as the Benched-Wobbuffet case does. The Wobbuffet and generic-retreat tests remain unrun in CI.
- Added Agent34 root-policy regressions in `tests/agent34-actor-only-root-policy.test.cjs` for candidate-seat scoping, the extra-turn/Apex receipt, Fairy Zone damage, Rule Box prize projection, Radiant Eternatus abstention, and Power Beam prompt selection.
- Added those tests to the existing manual `.github/workflows/mimikyu-copycat-regression.yml` workflow. Temporary path-filtered pushes launched runs `43399409555`, `43400634039`, and `43401024755`; the push trigger has since been removed and the workflow restored to manual-only. In [run 43401024755](https://github.com/FlareZ123/experiment-01/actions/runs/43401024755), the actor-observation / Agent34 policy test step passed, as did native fixture steps 7–15, including the 280-HP Fairy Zone Copycat KO / Prize characterization. Step 16 failed only at the Agent1 fixture's prompt-count assertion: the Power Beam branch produced two prompt resolutions while its call site explicitly passed `limit=1` to `resolvePending` at line 202. Agent1 changed the helper's default to 40, but the explicit `1` still overrides it; I sent the exact call-site correction. This is not a failed damage/Prize assertion.
- Helper and root-policy source syntax was parsed. An isolated V8 smoke test with mocked dependency functions exercised the Max Geist proposal (160 base / 320 Fairy Zone / one prize against a 70-HP Dragon) and exact Power Beam prompt selection. This is not a substitute for running the Node test suite or the pinned Store.
- The existing native staged runner `simulation/twinleaf/agent1-mimikyu-timeless-skyliner-maxgeist-native.cjs` compares the two native follow-up mechanics, but it does not yet call this new Agent34 policy. Its Power Beam comparison currently needs a two-prompt allowance; Agent1 has been asked to correct that fixture assertion.
- No complete source-dealt game, both-seat paired run, full rank-10 matchup, or paper-qualified Expanded game was produced. The Aichi benchmark remains at zero verified Expanded-legal opponent lists in the current decision board. No win-rate estimate is supported, and there is no 99.5% claim.

## Next useful experiment

Do not start the rank-10 pairing yet: Agent36 has deferred it behind PR47 native-root integration and the Agent5 Node 22 policy-contract lane. The current Agent36 V3 runner also lacks the turn-stamped `publicEventReceipt` transport required by this helper. Once those gates close, run the candidate in both physical seats and both first-player assignments; include Active/benched Wobbuffet strata, with neither position vetoing Skyliner solely because of Bide Barricade; preserve native actions/prompts/Prize traces and abstentions, and keep the policy candidate-only. Agent5's v6 130-printed-damage threshold is for the separate charge-preserving Max Geist pivot; do not conflate it with this post-Timeless immediate-KO branch.

## Code and tests

- Agent34 policy version: `agent34-actor-only-root-slice-v14-post-timeless-retreat-guards`; Max Geist helper version: `agent8-post-timeless-maxgeist-root-intent-v4-generic-cannot-retreat`; Power Beam prompt helper version: `agent8-mimikyu-post-timeless-powerbeam-prompt-v1`.

- `simulation/twinleaf/actor-observation-contract.cjs`
- `simulation/twinleaf/2026-11/agent8-post-timeless-maxgeist-root-intent.cjs`
- `simulation/twinleaf/2026-11/agent8-mimikyu-post-timeless-powerbeam-prompt.cjs`
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs`
- `tests/actor-observation-contract.test.cjs`
- `tests/agent34-actor-only-root-policy.test.cjs`
- `.github/workflows/mimikyu-copycat-regression.yml`
- Native mechanics fixture: `simulation/twinleaf/agent1-mimikyu-timeless-skyliner-maxgeist-native.cjs`


## Correction: Latias ex SSP is Psychic; Active Wobbuffet does not suppress Skyliner

**Supersedes the earlier Active-Wobbuffet veto and the test expectation that depended on it.**

The English card-pool record `sv8-76` identifies Latias ex SSP as a Psychic Pokémon with the Skyliner Ability. The exact pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` confirms this in `ptcg-server/src/sets/10-scarlet-and-violet/set-surging-sparks/latias-ex.ts`: `Latiasex.cardType = [P]`, `set = 'SSP'`, `setNumber = '76'`. Its `CheckRetreatCostEffect` reducer sets the Active Basic Pokémon's retreat cost to an empty array when `IS_ABILITY_BLOCKED(..., this)` is false.

The same pinned revision's `ptcg-server/src/sets/07-x-and-y/set-phantom-forces/wobbuffet.ts` defines Wobbuffet PHF 36 as Psychic and its Bide Barricade reducer explicitly returns without applying the lock when the target's `CheckPokemonTypeEffect` includes `CardType.PSYCHIC`. Therefore an opponent's Active Wobbuffet does not disable Latias ex SSP's Skyliner. The candidate's Mimikyu GRI, Shadow Rider Calyrex VMAX CRE, and Lillie's Clefairy ex JTG are also Psychic; the latter's Fairy Zone remains active under Bide Barricade.

The incorrect `opponentActiveSuppressesLatiasSkyliner(view)` helper was removed in commit `9e31a17a58ae8af09b9f725255d46a9e62a288be`, and the test around lines 1379–1385 of `tests/agent34-actor-only-root-policy.test.cjs` was corrected in commit `10abedce220481b79dc780e13c8efceab31c56b9` to expect a valid proposal with Active Wobbuffet. Do not add Bide Barricade to the shared Skyliner suppression guard for this printing. In the existing test fixture, Active Wobbuffet is a 110-HP non-Dragon target; a 160-printed-damage Max Geist is an immediate KO without a Fairy Zone multiplier. Against a promoted Dragon target, Fairy Zone can still apply Psychic Weakness ×2 when no other Ability lock suppresses Clefairy. These edits are not yet run through the manual Node 22 policy-contract or Twinleaf native workflow.

This is card-text and pinned-engine-source evidence only. It does not establish a natural game, matchup win, or competitive performance. Keep the helper default-off and candidate-seat-only; the real Store action/attack sequence still needs the deferred native and full-game gates.


## Prior implementation limitation (v4; superseded by v5 terminal-only crossover)

The policy spec requires a target-aware comparison of second Copycat → Power Beam against Skyliner → Max Geist, including target HP, Weakness, Prize outcome, retained resources and Active liability. At the time this section was first written, helper v4 did not implement that comparison: the Max Geist root helper returned `null` whenever Radiant Eternatus was in the discard, and the prompt helper then chose the strongest known non-GX attack (Power Beam when available). Helper v5 below adds a conservative terminal-only comparison. With (N) Basic Psychic Energy attached across the board after retreat, Max Geist is (10+30N): 190 at (N=6), 220 at (N=7), against Power Beam's 200. At (N≥7), Max Geist can uniquely cross a target-HP threshold; however, when the game continues, the three-Prize VMAX exposure is not priced without an opponent-response model. This remains a bounded policy improvement, not a complete DCI/AMR optimizer. No Node 22, native Store, natural-game or matchup result has yet been produced for the v5 crossover.

A concrete conditional field example makes the gap material: the rank-10 diagnostic reconstruction contains one `Latias ex SSP` (`sv8-76`, count 1; English Expanded-legal identity, physical source not verified). It is Basic Psychic, 210 HP, Darkness Weakness, with Skyliner ("Your Basic Pokémon in play have no Retreat Cost."). If promoted undamaged after Regidrago is KO'd, Power Beam 200 leaves it at 10 HP and it can retreat for free on its next turn. Max Geist at N=7 is 220 and KOs it before it escapes; Fairy Zone does not apply because Latias is Psychic, and Psychic is not its Weakness. The candidate's normalized 60 contains 11 Basic Psychic Energy and four Shadow Rider Calyrex VMAX, so N=7 is deck-legal and physically possible (for example, two Psychic Energy on Mimikyu and five across Shadow Rider/other Pokémon), though its game frequency is unknown. This is a conditional target-state counterexample, not evidence that the opponent will promote Latias or that the state occurs at any particular frequency.


## 13 November update: conservative target-aware route crossover (helper v5)

The Max Geist root helper now compares the two public post-Timeless routes when Radiant Eternatus is in the owner's discard and Mimikyu can still legally use Copycat:

- It computes Max Geist from all Basic Psychic Energy retained across the board after the free retreat, and Power Beam as 200 damage from the same state.
- Both routes use the same Psychic Weakness multiplier. The projection applies Fairy Zone to Dragon targets and recognizes an exact printed Psychic Weakness only when its ×2 value is explicit; unknown Weakness representations fail closed.
- If Power Beam also takes the immediate KO, the policy keeps the one-Prize Mimikyu Active rather than exposing the three-Prize Shadow Rider VMAX.
- If Max Geist uniquely KOs but does not end the game, the helper abstains. The current actor view does not contain a trustworthy model of the opponent's next-turn response, so the VMAX's three-Prize exposure cannot be priced honestly.
- Max Geist may replace Power Beam only when its unique KO immediately wins the game. If no legal public Power Beam route is established, the previous immediate-KO-only Max Geist branch remains available.

The new regression uses the concrete rank-10 diagnostic state: two Psychic on Mimikyu plus five on Shadow Rider yields 220 Max Geist versus 200 Power Beam against an undamaged 210-HP Latias ex. With six Prizes remaining, the helper deliberately abstains because the Max Geist route exposes a three-Prize VMAX without a response model. With two Prizes remaining, the same unique two-Prize KO is terminal and the helper selects Max Geist. At six total Psychic Energy, Max Geist is only 190 and does not cross the 200 Power Beam threshold.

Implementation: `simulation/twinleaf/2026-11/agent8-post-timeless-maxgeist-root-intent.cjs`, version `agent8-post-timeless-maxgeist-root-intent-v5-terminal-route-crossover`. Regression: the expanded `candidate-only post-Timeless Max Geist root` test in `tests/agent34-actor-only-root-policy.test.cjs`.

**Evidence boundary:** this is a source-level policy improvement plus unexecuted pure regressions. It has not yet run in Node 22 CI, the pinned Twinleaf Store, the V3 fixture, or a complete rank-10 game. It does not resolve the missing turn-stamped `publicEventReceipt` transport and does not authorize starting the deferred rank-10 pairing. The existing PR47 and Agent5 gates remain prerequisites.


## 2026-11-14 owner-view Stadium and Max Geist cost corrections

A source audit found a mismatch between the helper and its real input contract. `actorObservation.publicPlayer()` exposes `stadium` as an array of exact printing names, but the previous `hasWondrousLabyrinth()` implementation treated each Stadium field as a single string. The existing regression had also supplied a synthetic string, so it did not exercise the production observation shape. In a real actor view, Wondrous Labyrinth could therefore go undetected and the selector could incorrectly certify Max Geist's printed attack cost.

The selector is now version `agent8-post-timeless-maxgeist-root-intent-v7-dimension-valley-cost`. It validates both public Stadium arrays, fails closed if either is missing or malformed, rejects Wondrous Labyrinth, and recognizes Dimension Valley on either player's public Stadium field. The supplied card pool's Dimension Valley text is: “Each Psychic Pokémon's attacks (both yours and your opponent's) cost Colorless less.” Because Shadow Rider Calyrex VMAX is Psychic and Max Geist costs three Colorless, this reduces the attack's required attached Energy from three to two while Dimension Valley is in play. The helper remains conservative for other unmodeled cost modifiers and still requires the existing per-Pokémon/player attack restrictions to be clear.

The regression now uses production-shaped Stadium arrays on both sides, rejects a missing array, rejects two-Energy Max Geist without Dimension Valley, and accepts two Energy on the VMAX when Dimension Valley is present on either side. The fixture preserves five Basic Psychic Energy across the board after the free Skyliner pivot; the projected Max Geist is 160 base damage and 320 after Fairy Zone against the test Dragon target. This tests the cost/damage projection only, not a complete source game or a full-health Regidrago VSTAR direct route.

Validation: Node 22 run [43572665288](https://github.com/FlareZ123/experiment-01/actions/runs/43572665288) passed syntax checking and `tests/agent34-actor-only-root-policy.test.cjs`. No native fixture, game, matchup, or competitive result was run. The temporary targeted workflow used for the one-off run was removed after review: the existing manual `agent5-owner-root-native.yml` Node 22 suite already includes this regression, and the shared acceptance contract discourages another push-triggered workflow. No new workflow remains. The v6 production-shape-only regression also passed in run [43572227213](https://github.com/FlareZ123/experiment-01/actions/runs/43572227213).

This corrects a false-positive cost certificate and a conservative false-negative under Dimension Valley. It does not implement the separate normal-turn direct Max Geist route, establish attack-conversion competence, change any decklist, or establish competitive strength.