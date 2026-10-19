# Source rank-6 Faba can remove the previously missed Benched Stealthy Hood

**Agent 7, 19 October 2026 UTC.** Evidence: compiled authentic source-deal opponent-policy counterfactual, on a **previously inspected** fixed frame. This validates one source-side prompt execution weakness and its downstream mechanical effect. **Zero competitively qualified games. No win-rate inference.**

## Frozen intervention and reproducibility

[Pre-result registration](agent7-rank6-faba-target-reply-registration.md) was committed at `1359f8e762d7987a612f54fda908ac240135662b` before any results. Both arms replayed the same sixteen original rank-6 Iron Thorns versus unchanged Hood Shield v1 source-seat/seed deals (repeat 1–8, source physical seats 0 and 1). The source original 60, candidate original 60, actual source draw-log first player, printed source Faba/Megaton Blower, full hand visibility of the acting owner, public opposing Board and protected Underworld Door candidate policy were held fixed.

The source played exactly the same real, held Faba/Megaton Blower action in both arms. The baseline `rank6-owner-public-hood-removal-v1` delegated follow-up Faba prompts to the pinned generic `SimpleTacticsAi`. The new optional `rank6-owner-public-hood-removal-faba-target-v2` selected the printed Faba **Tool** option by menu value, then a valid publicly Benched Shadow Rider VMAX holding Stealthy Hood (V fallback). If a chosen Pokémon has multiple Tools, the policy chooses the Hood itself. Unrelated prompts delegate unchanged. It does not inspect the opponent's hand, unseen Prizes or deck order and does not inject a removed Tool.

Files: [pure source prompt decision](../../simulation/twinleaf/rank6-faba-hood-target.cjs), [opt-in source wrapper](../../simulation/twinleaf/rank6-hood-removal-policy.cjs), [retrospective paired runner](../../simulation/twinleaf/rank6-hood-removal-replay.cjs), [CLI entry](../../simulation/twinleaf/rank6-faba-hood-replay.cjs), [pure prompt tests](../../tests/rank6-faba-hood-target.test.cjs), [source-count and destination tests](../../tests/rank6-hood-removal-replay.test.cjs). Upstream Twinleaf stayed pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and is not modified.

[First compiled manual workflow **39244739247**](https://github.com/FlareZ123/experiment-01/actions/runs/39244739247) passed, demonstrating the new target mechanic. A source-starter summary defect then surfaced: the opt-in comparison omitted an arm named `control`, while the old top-level census still counted only that name and misleadingly returned zero. This was corrected with a named-baseline unit regression, and public owner discard/Lost Zone destinations were added to the real root-action observer. **Final canonical compiled manual workflow [39245638962](https://github.com/FlareZ123/experiment-01/actions/runs/39245638962)** at head `cdc030e791ab839741899879d839a6e1333b550d` passed with no exceptions. Its ZIP artifact [**12183692574**](https://github.com/FlareZ123/experiment-01/actions/runs/39245638962/artifacts/12183692574), named `source-rank6-faba-hood-target-replay`, has GitHub digest `sha256:20e82ad474e7cac863d6b88b52c2886b0f3096137482d872ab09c8a346899826`. Its raw JSON SHA256 is `3d4e1c60e23a905e88a60932d27b93ba5b15109bb0baffe2e61248cbde61faec`.

## Every source deal retained

| Exact physical source sample | Generic original Faba prompts | Hood-aware owner Faba prompts |
| --- | ---: | ---: |
| Source-dealt attempts | 16 | 16 |
| Verified source actually started first / second | 6 / 10 | 6 / 10 |
| Exceptions | 0 | 0 |
| Selected original source Faba/Megaton root cards | 4 | 4 |
| Source-selected Faba prompt sequences | 0 by new wrapper | **2** |
| Source-removal card physically removes Hood on its own turn | 3 | **4** |
| Any physical Hood count reduction across whole game, including unrelated removal | 6 | **7** |
| Verified Hood-protected Underworld Door effects with Active Thorns | 3 | **2** |
| Engine-terminal / 140-action-censored games | 2 / 14 | 2 / 14 |
| Competitively qualified games | **0** | **0** |

One selected Faba prompt sequence occurred at seed `2394734225`, global source turn 22, and both policies removed the attached Hood from a Benched Shadow Rider V. The other changed the prior missed response below. On **15/16 paired source deals**, all archived comparison fields other than arm label, optional Faba stage and prompt-selection audit were identical. This is **only a bounded ledger-level parity check**, with no full-Store graph or human-decision noninterference proof.

## The exact source-root change

**Original seed `1381374318`, repeat 8, source physical seat 0, source actually first, source global turn 19.**

- Both arms genuinely played **Faba LOT** from the source rank-6 player's own held hand, with its own Iron Thorns ex Active. The opponent had a **Benched Shadow Rider Calyrex VMAX CRE with Stealthy Hood UNB** attached, visibly at Bench index 1. The candidate's Active Pokémon was Girafarig LOT.
- Baseline original bot selected Faba, but its archived root Store log observed **zero removal of that Hood**. One genuine Hood-protected Underworld Door effect later completed for the candidate. The previous generic prompt's specific chosen target was *not recorded*, so we do not assert which alternate Tool, Special Energy or Stadium it picked.
- Hood-aware policy selected the actual `SelectPrompt` Tool option and `ChoosePokemonPrompt` for that Benched VMAX on source turn 19. A subsequent real original Store **`ResolvePromptAction`** removed the live Tool: Benched Hood count **1 → 0**, the owner's **Lost Zone Hood count 0 → 1**, and its discard Hood count stayed zero. The effect agrees with the pinned Faba LOST THUNDER implementation's owner-Lost-Zone path.
- The previously observed protected Door effect was **absent** from the enhanced branch. Both arms still logged eleven candidate attack declarations, zero source attack declarations and 140 root actions (censored); the diagnostic Prize counts remained source/candidate **6/2**. No winner was established from this branch.

Printed resolution is confirmed at the bounded root-store Tool-and-destination level in one previously recorded source deal. The contrast supports a narrower methodological conclusion: **a weak generic target policy can overstate the persistence of a protected Tool**, and an owner-visible actual prompt response can invalidate a later Ability-access claim in the same deal. It does not prove that playing Faba was the optimal source line, that alternate Faba choices could not be stronger, or that removal improves competitive winning strength. A Supporter used for Tool removal could forgo setup, search, gust or another more urgent choice.

## Research implication and remaining gates

An attacker-search optimizer treating this Benched Hood as permanent would mis-model both the source's printed Tool answers and their exact target-selection steps. Conversely, equating any named Faba in hand with a guaranteed successful response would also be unsound; the source must have a playable Supporter turn, appropriate valid public Tool and reach the relevant prompts. Future **candidate comparison** should run competent and symmetrical attacker / defender policies with genuine attacking timelines, legal clock, complete Japanese physical print qualification, engine source mutation safeguards and both first-player orders. This limited replay supplies one opponent tactical competence component to a future evaluation.

**Full benchmark still has only 29/32 published exact source lists (ranks 23, 25 and 28 unavailable), zero competitively qualified games and no established 99.5% game-win rate.** New opponent policy statistics from these reused deals remain exploratory and cannot be promoted to an independent retrospective success-rate estimate.
