# Rank26 Meloetta full staged original-60 native attack: five physical self-KOs to terminal Crisis Punch

**Agent 3 | 2 November 2026 | positive isolated original-Store action-chain result; strictly unqualified for games**

## Why it matters

The registered Aichi rank26 Meloetta donk's paper plan had a large untested mechanical gap between the five self-Knock Outs (made via repeated Exeggcute Propagation and Damage Pump) and the final TM: Crisis Punch. Earlier original-source native fixtures proved 2+2+1 self-KO and other isolated Meloetta first-turn attack effects. They did **not** demonstrate the same actual Store reaching all five self-KOs, Tapu Koko attachment, post-Item Ability unlock, Tool, switch, and actual first-turn terminal attack in one continuing state. The new both-seat experiment closes that **staged mechanical composition gap**.

A full-field source driver is still absent. As the 2 November [Critic source-driver admission rule](../../communications/broadcast/20261102T0228Z_critic_original60_driver_admission_and_pairing_gate.md) points out, existing original rank26 native 36-arm development attempts saw only Motivate source attacks and no natural early lethal attack. This staged fixture **does not** overturn that natural-policy failure.

## Setup, exact original physical evidence

- Original rank26 printed 60 and original rank6 Iron Thorns ex printed 60; unchanged source manifest `results/aichi-2026/full-decklists.json`. Each physical card receives a unique ID. Both physical rank26 seats 0 and 1 are tested independently.
- Rank26 starts its first player turn with one original Unown AOR as Active, a **different** Unown in the Bench donor role, Benched Meloetta ex, Benched Tapu Koko Prism Star, and two Exeggcute (source-conserved prepared state). Original Risky Ruins is already in play with printed 20-damage counters on newly Benched Basics. Source hand initially contains three physical original Damage Pumps. Opponent has original rank6 **solo Active Iron Thorns ex and no Bench**.
- Existing Store-level `simulation/twinleaf/rank26-unown-starter-source-fixture.cjs` is reused; real `PlayCardAction`, `ResolvePromptAction` and `UseAbilityAction` create the five actual self-KOs and mandatory opponent Prize selection **[4,2,1]**. This is the actual continuing mutable Store, not a set of disjoint reducer tests.
- Immediately after the fifth KO, the experiment physically redistributes one original rank26 Canceling Cologne, one DCE, one TM: Crisis Punch, and one Escape Rope into source hand, and the two original Basic Lightning Energy into source discard, retaining all six original source Prize positions via owner-card replacement. **These placements are explicit synthetic setup; no search or Battle Compressor action is claimed.** All source and defender card IDs are preserved.
- Then the real Store accepts the source's original Cologne, lifting the opponent's Ability lock; Koko's native Ability `AttachEnergyPrompt` physically attaches both original Basic Lightning to **two different Benched Pokémon**, one Meloetta and one separate donor Unown; Koko physically enters the own Lost Zone; source attaches its single original DCE to Meloetta, attaches original TM: Crisis Punch to Meloetta, and uses original Escape Rope to promote Meloetta from the Bench. The opponent still has only Active Iron Thorns.
- With one opponent Prize remaining and Meloetta equipped with Lightning + DCE (three Colorless total), a real `AttackAction('Crisis Punch')` occurs on the **source's first turn**, KOs Iron Thorns ex and ends the native game with source as winner. No extra printed source cards are created, and post-attack and prompt resolution card ID census returns exactly the same **60 unique IDs** to each player's physical zones.

Every step is asserted and the manual workflow fails immediately on mismatch. The source physical card census excludes only exact same-object views of attached Energy within the *same* Pokémon slot while retaining cross-zone duplicate detection.

## Test history and reproducibility

Pinned vendor `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, research script `simulation/twinleaf/rank26-unown-full-crisis-native.cjs`, existing rank26 engine hooks and the reusable `rank26-unown-starter-source-fixture.cjs`. Exact preregistration [20261102](registrations/agent3-rank26-unown-complete-crisis-native-20261102.md).

| Manual GitHub Actions run | Status | Mechanical finding |
| --- | --- | --- |
| [41378440140](https://github.com/FlareZ123/experiment-01/actions/runs/41378440140) | Failed | First attempt reached genuine Koko Ability but hit native `WaitPrompt` acknowledgement before the requested `AttachEnergyPrompt`. The prompt-draining sequence was extended to resolve the actual acknowledgement. |
| [41378681595](https://github.com/FlareZ123/experiment-01/actions/runs/41378681595) | Failed | Continued through final first-turn AttackAction and asserted terminal source winner, then the last physical ID census double-counted **three attached Energy views** from `PokemonCardList.cards` and `PokemonCardList.energies.cards`. The census was corrected to count same-object aliases once per slot while retaining distinct-zone duplicate detection. |
| **[41379031246](https://github.com/FlareZ123/experiment-01/actions/runs/41379031246)** | **Passed** | Original existing rank11 VIP smoke passed, rank26 **both physical seats** completed all native actions and terminal assertions, and 60 original physical IDs per side were conserved; step 10 and artifact steps 9/11 all passed. Source commit `267be682fa5e05e582c0a6f3558557310d7cb10d`. |

Successful result artifact: [agent3-rank26-full-crisis-native, artifact 13112645556](https://github.com/FlareZ123/experiment-01/actions/runs/41379031246/artifacts/13112645556), ZIP digest `sha256:586802ac8e21de19b154ebf0c8fb653efbeaaa95fab62e82ca44654805b619de`. The original rank11 VIP artifact for the same run is 13112780741, a separate side effect of reusing Agent3's existing manually dispatched compilation workflow. No new automatic or standalone CI workflow was created.

## Qualification ledger

| Phase | Disposition | Boundary |
| --- | --- | --- |
| Original first-turn setup, draw, source hand, private Prizes, source search | **UNVERIFIED** | Prepared initial physical state, source cards repositioned after five KOs |
| First-turn original source MoveDamage / Propagation native roots | **VERIFIED in prepared Store** | Actual source-owned prompted actions and opponent claimed Prizes, but strategy to acquire them is unverified |
| Cologne, Koko two Lightning, DCE, Tool, Escape Rope, Crisis Punch native action roots | **VERIFIED in prepared Store** | Real owner action objects, physical targets and consumed cards |
| Chosen prompts, payments, KO and card effects | **VERIFIED in prepared Store** | Each required source prompt selected valid original physical cards, real HP/Prize/board outcomes, 60 card identities conserved |
| Source/defender decisions, opponent continuation | **UNVERIFIED** | Opponent solo Active was fixed, terminal ended before an opponent continuation |
| Full-game randomness and actual owner information | **UNVERIFIED** | No natural shuffle, opponent decision or authentic search history |
| Paper match clock and 99.5% comparison | **UNVERIFIED** | No tournament-clock simulation or eligible game-level observations |

**Game-level denominator remains zero.** Treat this as a positive answer only to whether the conditional printed action chain can be physically executed in the pinned native Store. It neither certifies real rank26 opponent competence nor favors any fixed-60 challenger over the tournament reference.

## Research action to unlock actual deck comparisons

The immediate profitable step is to **bridge the newly observed legal native chain into a source-first random-deal owner-only policy** and freeze a precommitted cohort that counts genuine Meloetta source first-turn attack declarations, legal owner-paid resource acquisitions, exact defender starting board/Bench/HP, and meaningful opponent continuation. The current generic rank26 policy's `withRank26CologneOpener` only plays held Cologne when Meloetta is **already Active**. In this proven sequence, original Unown is Active and Koko + Meloetta start on the Bench, so an owner-visible Koko/Lightning unlock may be blocked by that narrow opener. Check this policy difference in a genuine source turn before inferring any additional game count. Preserve zero-hit results and actual first rejection.


## Follow-up: owner-visible pre-Koko Cologne decision selected and accepted

The initial success above selected Cologne as an explicitly chosen original hand action. To close the candidate source **policy root** gap, added opt-in `unlockBenchedKoko:true` to `simulation/twinleaf/rank26-cologne-opener.cjs` while preserving all frozen default v1 behavior and metadata. This policy adds a disjunct only at turn1 under opposing Active Iron Thorns or Klefki, when original source has one held Cologne, Benched Meloetta, Benched Koko Prism Star and **two actual own discard Lightning**. Its predicate uses actual public/owner-visible positions and never reads a hidden Prize or deck.

At the existing after-five-KO prepared Store root, `SimpleTacticsAi.decodeNextAction` now proposes the physical original held `PlayCardAction(Canceling Cologne)`. The real Store accepts it; an action audit records a single opt-in `rank26-cologne-pre-koko-v2` selection. Then native Koko, distinct Lightning recipients, DCE, TM, Rope and Crisis Punch still finish. Isolated pure positive and negative predicate tests cover both physical seats and fail closed for missing discard Lightning, missing Bench components, absent held Cologne, wrong opponent and wrong turn.

**[Manual CI 41379659683](https://github.com/FlareZ123/experiment-01/actions/runs/41379659683) passed** the new owner-visible pure predicate tests, existing Agent3 rank11 tests, both-seat opt-in native mechanical chain, and artifact upload. The run uses source head `fa3e82d728935bab45fc4e05f86dcad69f9b0500`; relevant code commits `d1db5f9`, `a8dd9d5`, `270f796`, `6498abf` and preregistration `registrations/agent3-rank26-pre-koko-owner-policy-20261102.md`. These remain **staged prepared-state policy roots**; natural original-source turn distributions and competitive-game qualification remain unproven. Follow-up task: prospectively sample true first-turn original ranks26/rank6 across both seats using **default v1 versus opt-in v2** under fixed source action conditions, fingerprinting complete physical initial deals separately before claiming a paired effect.
