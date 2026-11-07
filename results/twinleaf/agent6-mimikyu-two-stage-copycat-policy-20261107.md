# Agent 6: two-stage Mimikyu Copycat policy and natural-access audit

**Date:** 7 November 2026  
**Engine:** pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Policy fingerprint:** `MimikyuApexTwoStageCounterPolicy-v2`  
**Evidence classes:** card-text/rules interpretation, native Store execution, bounded selected-seed policy diagnostic

## Question

Can the rank-1 Aichi Open list's Mimikyu GRI 58 Copycat attack use Regidrago VSTAR's non-GX Apex Dragon to select two different attacks from the Mimikyu player's own discard across the Timeless-GX extra turn?

The two payloads under test are:

1. Dialga-GX UPR Timeless-GX on the first Copycat, when the candidate's GX allowance is unspent.
2. Radiant Eternatus CRZ Power Beam on the extra turn, after Timeless-GX has spent the GX allowance, with Lillie's Clefairy ex JTG Fairy Zone active.

## Rules basis

Mimikyu GRI 58 prints Copycat with a `[Psychic][Colorless]` cost and the effect: "If your opponent's Pokémon used an attack that isn't a GX attack during their last turn, use it as this attack."

Regidrago VSTAR SIT 136 prints Apex Dragon with a `[Grass][Grass][Fire]` cost and the effect: "Choose an attack from a Dragon Pokémon in your discard pile and use it as this attack."

When Mimikyu copies the opponent's Apex Dragon, Apex Dragon's own effect selects a Dragon attack from the Mimikyu player's discard. The tested payloads are therefore selected from the candidate's discard. The attack being announced is Mimikyu's Copycat, so the tested payment is Copycat's printed `[Psychic][Colorless]` cost. The copied payload's printed cost is not separately paid in this interaction. The distinct Ditto: Copy Anything example in the Advanced Player's Manual D-09 has its own explicit Energy clause and should not be generalized to Mimikyu's different printed text.

The native test uses two Psychic Energy on Mimikyu and validates both payload choices through the actual Twinleaf `ChooseAttackPrompt`. The ordinary Store/prompt validator remains responsible for Copycat's own cost and other attack legality.

## Policy v2

The opt-in policy is implemented in `simulation/twinleaf/mimikyu-counter-policy.cjs`.

- **Timeless branch:** active Mimikyu, opponent's last declared attack is non-GX Apex Dragon, Dialga-GX is in the candidate's discard, and the candidate's GX allowance is unspent. The prompt resolver selects Dialga-GX Timeless-GX.
- **Power Beam branch:** active Mimikyu, GX allowance already spent, opponent Active is Regidrago VSTAR, Radiant Eternatus is in the candidate's discard, and Lillie's Clefairy ex is in play with Fairy Zone effective. The prompt resolver selects Radiant Eternatus Power Beam.
- The Fairy Zone gate conservatively rejects visible Path to the Peak, Silent Lab, Power of Alchemy, Neutralizing Gas, active Mischievous Lock, active Initialization, and Garbotoxin with an attached Tool. This known-lock list is incomplete and is a heuristic rather than a full engine Ability-suppression evaluator.
- The tactic and resolver are inserted before the upstream attack tactic and attack-choice resolver. Reapplying the decorator is idempotent.
- The existing opt-in headless flag still requires the Copycat compatibility, Mimikyu declared-history, Regidrago declared-history, and pass-clears-last-attack corrections. The policy fingerprint was advanced to v2.

## Native Store execution

`tests/mimikyu-counter-policy.test.cjs` adds a staged two-KO execution test for both physical player seats.

The fixture has active Mimikyu with two Psychic Energy, Dialga-GX and Radiant Eternatus in the candidate's discard, Lillie's Clefairy ex on the candidate's Bench, and two opposing Regidrago VSTAR with a Dratini promotion target. The opponent's last declared attack is seeded as Apex Dragon.

For each seat, the research tactic selects Copycat and the research resolver selects the exact legal prompt payload:

1. Timeless-GX resolves through Copycat, Fairy Zone doubles damage to 300, the first Regidrago VSTAR is Knocked Out, and two Prizes are taken.
2. The opponent promotes the second Regidrago VSTAR. The opponent's Apex Dragon history remains available across the Timeless-GX extra turn.
3. The policy selects Copycat again. With the GX allowance spent, the resolver selects Power Beam. Fairy Zone doubles damage to 400, the second Regidrago VSTAR is Knocked Out, and two more Prizes are taken.

The test verifies the actual Store transitions, Prize prompts, promotion prompts, source identity, prompt validation, both physical seats, and the retained opponent attack history.

**Validation:** manual workflow run [42374487360](https://github.com/FlareZ123/experiment-01/actions/runs/42374487360) completed successfully. It ran the pinned-engine Copycat regression suite, the five native counter-policy tests, and the exact Prize-cut enumerator tests. The run also produced the hand-diagnostic pilot artifact.

This is a staged mechanics and policy execution witness. It does not establish natural access or competitive win rate.

## Natural-game exposure diagnostics

The rank-1 list was kept unchanged. The opponent was the published rank-10 Regidrago list. Baseline and treatment used the same initial physical source deal within each seat orientation, verified by matching source-deal fingerprints.

### Default opponent policy

Workflow run `42373378218` completed four bounded games. The default Regidrago policy produced no Apex Dragon exposure in these games, so the Copycat policy had no eligible window. This run is an opponent-policy exposure failure and is not evidence about the line's natural setup rate.

### Exposure-selected Regidrago policy

A follow-up reused seed `20261016` in both physical seat orientations and enabled the existing DoubleDragonRecovery and SupporterDecisionCorrection policies for both seats. This seed was selected because the prior `regidrago-policy-factorial.json` recorded three and four Apex Dragon declarations with the same corrections and the Regidrago deck in the two respective physical seats. The follow-up is deliberately exposure-selected, not a representative random sample.

Workflow run `42373882810` completed four games:

| Candidate seat | Opponent Apex Dragon declarations | Candidate Copycat attacks | Eligible policy decisions |
|---:|---:|---:|---:|
| 0 | 4 | 0 | 0 |
| 1 | 3 | 0 | 0 |

Baseline and treatment source-deal fingerprints matched in both seat orientations. The treatment policy did not alter either game because its prerequisites were never assembled.

### State diagnosis

Workflow runs `42374198786` and `42374487360` repeated the same matched source deals and instrumented the candidate's public board, own hand, and own discard at each candidate turn where Apex Dragon remained the opponent's last attack.

The important states, deduplicated by candidate turn, were:

- **Candidate seat 0:** Apex windows occurred on candidate turns 16, 28, and 30. Mimikyu was never in play or hand; the hand diagnostic showed it in the candidate's discard. Dialga-GX remained on the Bench rather than in the discard. Radiant Eternatus was not in the discard. Clefairy ex and effective Fairy Zone appeared by turn 28. The candidate had already used its GX allowance. The turn-16 hand included Battle Compressor and Lillie's Clefairy ex.
- **Candidate seat 1:** Apex windows occurred on candidate turns 5 and 7. Mimikyu was absent from play, hand, and discard. Dialga-GX and Radiant Eternatus were on the Bench rather than in the discard. Clefairy ex and effective Fairy Zone were present by turn 7. The candidate's GX allowance was still unspent. The turn-7 hand contained Fog Crystal, Quick Ball, and two Psychic Energy, so a search path to Mimikyu may have existed if the card was in the deck.

The current attack policy is reactive. These games show the larger setup problem: the candidate bot did not preserve or establish Mimikyu, and it did not place the required Dragon payloads in its discard. The seat-0 game discarded Mimikyu; the seat-1 game had search cards and Energy while Mimikyu remained absent. The default decision policy also benched Dialga-GX and Radiant Eternatus, leaving them unavailable as Apex Dragon payload sources.

This is a diagnosis of two selected source deals under the stated bot policies. It is not a probability estimate for all Regidrago games or all human play.

## Interpretation and next work

The staged two-step Copycat line is executable through the pinned native Store in both seats. The original rank-1 bot did not reach the required state in the exposure-selected games. The final attack policy alone therefore has no demonstrated natural-game value yet.

The next useful experiment is a separate, opt-in setup policy that tests whether the deck can deliberately:

1. preserve or recover Mimikyu instead of discarding it;
2. bench Mimikyu early enough against a visible Regidrago threat;
3. use Battle Compressor or Mysterious Treasure to place Dialga-GX and Radiant Eternatus in the candidate's discard;
4. attach the two Energy required by Mimikyu's own Copycat attack;
5. establish Lillie's Clefairy ex and retain a route to promote or switch Mimikyu Active.

The setup policy must be evaluated against the opportunity cost to the rank-1 deck's primary plan. It must not use opponent hidden information or assume that the source cards can be copied while they remain on the Bench.

The separate Prize-only sensitivity in `results/aichi-2026/2026-11/agent6-copycat-four-basic-heavyball-multiplicity-20261107.md` shows that a second Heavy Ball sharply reduces one modeled Prize obstruction. That model does not address the setup failures observed here, so its result alone does not justify a deck change.

## Reproduction and related evidence

- Policy: `simulation/twinleaf/mimikyu-counter-policy.cjs`
- Native policy tests: `tests/mimikyu-counter-policy.test.cjs`
- Headless fingerprint and opt-in integration: `simulation/twinleaf/headless.cjs`
- Natural-game pilot and diagnostics: `simulation/twinleaf/mimikyu-counter-policy-pilot.cjs`
- Exact Heavy Ball sensitivity: `simulation/evaluation/agent6-copycat-four-basic-heavyball-multiplicity.cjs`
- Copycat audit synthesis: `results/twinleaf/mimikyu-apex-copycat-audit.md`
- Timeless extra-turn ruling: `results/aichi-2026/timeless-bonus-turn-copycat-ruling.md`
- Four-Basic Prize baseline: `results/methodology/agent46-champion-four-basic-heavyball-legal-opening-prize-frontier-20261107.md`
- Two-core multiplicity sensitivity: `results/aichi-2026/2026-11/agent21-copycat-prize-access-multiplicity-sensitivity-20261107.md`

No decklist nomination or competitive win-rate claim is changed by this result.
