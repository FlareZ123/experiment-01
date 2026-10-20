# Original-source rank-15 Poffin: native Oddish selection causally establishes Stage2 positions

**Agent 30, 20 October 2026.** This is a **retrospectively selected, unqualified** authentic physical-source Store counterfactual, not a game-win experiment. One source-actor-owned prompt choice changes; the source and candidate registered 60s, original hands, Prizes, turn order, and initial random deal are identical. Pinned Twinleaf game code remains unchanged.

## Reproduction

- Frozen field: original Aichi rank15 Ryotaro Nozawa Vileplume/Bunnelby printed 60 versus New Moon Lockbreaker v1 English-mechanics proxy 60. Original candidate seat A first, source seat B, seed **3050400820**.
- Engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Existing gameplay corrections and initial physical deal inputs are unchanged.
- Script [`simulation/twinleaf/rank15-poffin-oddish-native-fork.cjs`](../../simulation/twinleaf/rank15-poffin-oddish-native-fork.cjs), reversible K1-only policy [`rank15-poffin-oddish-prompt-fork.cjs`](../../simulation/twinleaf/rank15-poffin-oddish-prompt-fork.cjs), unit tests [here](../../tests/rank15-poffin-oddish-prompt-fork.test.cjs). The `rank15_oddish_prompt_fork:true` parameter of **existing manual-only workflow** `.github/workflows/aichi-newmoon-source-coverage.yml` runs the full authentic Store comparison.
- **Compiled manual [CI 39346013444](https://github.com/FlareZ123/experiment-01/actions/runs/39346013444) passed**, run head `1b33015a5dbab7b28080a628cf5c765628fb2356`. [Raw artifact 12230719062](https://github.com/FlareZ123/experiment-01/actions/runs/39346013444/artifacts/12230719062), ZIP SHA256 `f74d1aa96fa69a67e5ab5cfe3a55b7092cc1e919d2599e497f038b98b80478e2`, inner JSON `rank15-poffin-oddish-native-fork.json` SHA256 `eb9ffeeb9aabc351866a0bd77f374191828882a9d2398c9a95034dae834f437a`; independently downloaded, hashed and examined after CI.
- Both arms required exact matching **prepolicy physical zone digests, original Prize prerequisites, full deck hashes, and every genuine source action before the Poffin owner-deck prompt**, including its native Item play at observer ordinal 127. The prompt action is chosen from two physically present Oddish UNB **only while an authenticated unresolved `ChooseCardsPrompt` belongs to the actor and references that actor's own deck**. There is no K0 hidden-deck read. Native `prompt.validate` accepted the selection; actual root Store response and Bench placement were checked after dispatch.

## Actual native result

| Genuine root state | Generic Poffin search | Poffin selects both available Oddish |
| --- | --- | --- |
| Global turn16 authentic K1 Poffin owner-deck search | Selects Budew ASC + Buneary M2 | Selects **Oddish UNB + Oddish UNB** |
| Immediately after search | No Oddish on Bench | **Both Oddish physically on Bench**, source observer ordinal128 |
| First printed TM `Evolution` attack | Buneary M2→Mega Lopunny ex M2 | **Both Oddish→Gloom UNB** through actual TM target and own-deck search prompts, ordinals **144–147** |
| Native `Evolution` declarations within the 260-root game | **1** | **1** |
| First printed Vileplume BUS in play (global turn) | Never before cap | **18** |
| Vileplume BUS in the Active Spot (global turn) | Never before cap | **21** |
| First Vileplume AOR in play (global turn) | Never before cap | **32** |
| AOR present while BUS Active (global turn) | Never before cap | **32** |
| Source evolutionary-chain board slots (maximum) | 0 | **2** |
| Censoring | **260-root cap, no finished game** | **260-root cap, no finished game** |

On the Oddish arm at turn16, after native Poffin the source Bench was precisely `Budew ASC; Eldegoss V RCL; Oddish UNB; Oddish UNB; Budew ASC` (the last Budew came from subsequent Artazon), and after one native TM `Evolution` it was `Budew ASC; Eldegoss V RCL; Gloom UNB; Gloom UNB; Budew ASC`. At turn18 the source board already had one **BUS Vileplume and one Gloom**; at turn21 BUS first entered Active; at turn32 it had **Active BUS and Benched AOR**. The board observer required both players still to have all six initial Prizes at these snapshots.

**Important distinction:** the actual test did **not** execute a second TM Evolution attack immediately after the first, despite Bunnelby's Omega Barrage text. The remaining Stage2 establishment took many genuine later turns. That unexplained **second-attack decision/prompt gate** is the next high-value native falsification. The observed existence of two Stage2 cards and the Active position does not by itself test suppression/counter-lock semantics or official match viability.

## Limits and next actions

Both unchanged 60s use unqualified automated play. The source physical deal was **selected after** observing an interesting powered-TM window. Neither arm reaches a finished game (both cap), and the resulting turn32 setup is far later than any plausible first-turn control objective. This confirms a **causal reachable setup sequence** in this one deal, with one owner-legal prompt change, while leaving competitive utility, optimality and frequency **unmeasured**. Do not count any of these as wins, statistical frequency or 99.5% evidence.

Next test: on this same unchanged legal physical prefix, identify the exact real `ConfirmPrompt` / `WaitPrompt` actions after first native `Evolution` at global turn16 (root149–151); record the actor-owned scalar response and whether an actual eligible second Omega Barrage attack was offered. If legal, compare the native second `Evolution` choice to the historical bot's actual response. Preserve any negative, missing-target, engine-rejection, and opponent-followup evidence. Test source first-turn setups prospectively only after common policy qualification.

See also [the original K1 physical availability proof](agent30-rank15-poffin-k1-physical-availability.md), [Agent36 source temporal analysis](agent36-rank15-powered-tm-temporal-source-gap.md) and [cross-archetype K1 replanning synthesis](../als/agent30-k1-owned-search-replanning-synthesis.md).

**Overall benchmark:** exact 29/32 source 60s, zero competitively qualified games; no demonstrated 99.5% fixed deck.
