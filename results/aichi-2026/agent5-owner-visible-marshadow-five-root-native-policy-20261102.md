# Source rank1 Marshadow forced-Active rescue: five independent owner-visible root choices reach native Resetting Hole

**Agent 5 | 2 November 2026 | four preregistered, original-Twinleaf-Store staged policy demonstrations**  
**Result: 4/4 owner-visible source-policy and genuine native Store successes; zero competitive games.**

## Motivation

Previously the rank1 source's [constructive forced Active Marshadow opening rescue](agent5-forced-active-marshadow-same-turn-rescue-20261031.md) was derived from paper rules and exact multivariate hypergeometric counting. The new [complete scripted four-arm native test](agent5-forced-active-marshadow-complete-native-20261102.md) proved that **Fog Crystal → Shadow Rider Basic Bench → active Float Stone/Psychic attachment → ordinary Retreat → Benched Resetting Hole** actually resolves on the pinned original Twinleaf Store in both physical seats. The remaining central question was **actor policy**: can an owner player see, select and execute the chain with repeated local decisions under native changing state and full prompt ownership, without directly telling the engine what five actions to take?

[Pure actor-root policy](../../simulation/twinleaf/agent5-owner-visible-marshadow-chain-policy.cjs), [pure unit tests](../../tests/agent5-owner-visible-marshadow-chain-policy.test.cjs) and [native actor runner](../../simulation/twinleaf/agent5-owner-visible-marshadow-autonomous-native.cjs) answer this narrow question. All are opt-in development modules. The complete Aichi source-rank1 original printed 60 and opposing Thorns source ranks6/24/29 are unchanged elsewhere; this is only a staged small physical Store, not naturally shuffled original-deck pairings.

## Preregistered design

[Registration](registrations/agent5-marshadow-owner-visible-native-policy-20261102.md) preceded the first native policy run and locked the exact **2 owner physical seats × 2 payment cards** as the prior mechanism test. The actor independently rebuilds a detached, frozen `actorObservation` before **every own root** and runs a pure `chooseMarshadowCounterRoot(view)`, whose inputs are the own hand, own/public board, opponent public Active/Stadium, and known turn resources. It cannot see opponent concealed hand/deck/Prizes or own hidden deck/Prizes. Any Fog search choice is made separately by `chooseMarshadowFogTarget(view,offered)` only when the authenticated owner-deck native `ChooseCardsPrompt` grants that access and the printed Shadow Rider is genuinely offered with native `prompt.validate`.

The policy has a limited source-specific trigger: its own Marshadow **UNB** initially Active, opponent Iron Thorns ex **TWM** Active and Thunder Mountain Prism Star **LOT** live, held Fog and Float Stone/Psychic in the own hand, open Bench, no blocking status, no already-used Retreat or relevant card-play lock. It deliberately declines the expensive chain if a replacement **Sky Field** or **Dimension Valley** is already in hand. That is a **provisional strategic heuristic** minimizing one obvious competing connector use. It is not an optimized comparison against all attacks, draws or match conditions. Fully observed printed target and acceptance are still adjudicated by the genuine Store.

## Physical five-root policy + native outcomes

At each of the four independent staged starting positions, the separate policy generated the following sequence from changing owner observations:

| Root | Pure policy intent | Native action and directly observed outcome |
| --- | --- | --- |
| 1 | `fog-search-shadow` | Played exact held Fog Crystal, selected legal owner-deck Shadow Rider V CRE in native search, revealed it to opponent and shuffled the synthetic deck |
| 2 | `bench-shadow` | Played the newly searched Basic from hand into own Bench |
| 3 | `attach-floatstone` or `attach-psychic` | Attached original physical held resource to Active Marshadow |
| 4 | `retreat-marshadow` | Actual native RetreatAction; promoted searched Shadow Rider, moved Marshadow to Bench, paid printed Retreat Cost |
| 5 | `marshadow-resetting-hole` | Actual native UseAbilityAction from now-Benched Marshadow; opposing Thunder Mountain Prism Star moved to opponent Lost Zone and Marshadow left play |

This table describes **native execution**, with the same preserved owner turn, proper Stadium destination and both payment-zone witnesses. It does not infer game-state action utility. Native automation is a five-choice source-policy fragment within a staged board, with no opponent bot selecting responses.

| Owner physical seat | Held payment | Pure rooted actions | All five actual native actions | End zone verified |
| ---: | --- | ---: | --- | --- |
| 0 | Float Stone BKT | 5 | **Accepted** | Thunder Mountain to opponent Lost Zone |
| 0 | Psychic Energy SVE | 5 | **Accepted** | Thunder Mountain to opponent Lost Zone |
| 1 | Float Stone BKT | 5 | **Accepted** | Thunder Mountain to opponent Lost Zone |
| 1 | Psychic Energy SVE | 5 | **Accepted** | Thunder Mountain to opponent Lost Zone |

**Run:** [GitHub Actions 41377087854](https://github.com/FlareZ123/experiment-01/actions/runs/41377087854), **success**, source head `485488db174bebc3b094a62487c7232f07fa3bc6`, engine pin **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. The pure unit step, actor-native staged run and full scripted native four-arm comparison all passed. Each native arm reported five intended actions exactly, four of four successes and zero native errors. Full per-step native owner-visible before/after roots, prompt types, chosen printing, discard and Lost Zone evidence are included in `agent5-owner-visible-marshadow-policy-native.json` within the run's `actor-only-root-native-retrospective-rank11` artifact.

The previous scripted test [run 41376207812](https://github.com/FlareZ123/experiment-01/actions/runs/41376207812) remains a useful matched mechanical control: the new policy produced the same five-stage correct physical result using independent root decisions. New fail-closed assertions were added to the existing manual GitHub Actions workflow after the first successful run, covering four arms, five policy roots, unchanged owner turn and correct Stadium Lost Zone. No additional push-triggered workflow was created.

## Boundaries and next step

This meets a stricter **source-player actor fidelity** milestone than the earlier prerecorded five-action script, because the decision process autonomously chooses the next action from its own exposed state at each original native Store root. It remains **staged**, **source-matchup-specific**, and **deliberately narrowed to four favorable reachable states**. It does not discover the sequence from a general card optimizer. The pilot paper opening resource fraction of **0.7194733328716315% of legal original sevens** is an independent exact combinatorial sufficient condition with no natural-deal simulator or policy selection frequency. The deterministic synthetic shuffle does not model paper randomness.

No opponent was allowed a turn, no 25-minute Swiss or elimination clock was resolved, and no complete original 60 was drawn or consumed in a full game. The exact opponent source lists for Aichi ranks 23,25,28 remain missing, and **zero games qualify for demonstrated matchup win rates**. The most valuable further test is to embed the opt-in actor-only choices in a predeclared bilateral native run with the exact rank1 and rank6/24/29 printed 60s, sample both seats from randomized opening hands, and test whether early counters are chosen appropriately against comparable live Stadium states while respecting discarded resources, Item locks, attacking alternatives and turn clocks. No claim of 99.5% competitive strength follows from this staged result.
