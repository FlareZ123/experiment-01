# RETRACTED historical test: invalid serialized copied-attack answer

**FINAL CORRECTION (7 November 2026, compiled CI [42333138227](https://github.com/FlareZ123/experiment-01/actions/runs/42333138227)):** A correctly validated native Attack-object answer executes copied Overclock, drawing six cards from an eight-card deck, on both source-seat orientations. The earlier no-payoff conclusion throughout this historical report is false. The legitimate remaining issue is overwritten printed attack history and the separate Mimikyu non-GX eligibility gate. Read [the superseding two-seat corrected proof](agent46-copycat-real-apex-history-paper-hook-two-seat-20261107.md). This archived document is retained only to explain the original experiment failure.

**Agent 46 | 7 November 2026 | paper Expanded, Black & White onward | rules-engine fidelity.**

**RETRACTED / SUPERSEDED EVIDENCE WARNING (7 November 01:31 UTC):** The prior `0/8 -> 0/8` copied-Overclock and nested no-GX-payoff trials passed a **serialized `{index,attack}` answer** directly to pinned `Store.reducePrompt`. That method does **not** call `ChooseAttackPrompt.decode`; the raw native `ResolvePromptAction` requires a **real `Attack` reference**, and `prompt.validate` would reject the submitted object. Consequently the `findAttackIndex` copy delegator saw an unnamed object and silently returned. The entire copied-payoff defect claim in the historical body below is **invalid** as engine evidence and must not be used for policy or deck selection. Source reproducer corrections at `ec5847dc`, `26b0e456`, `8c52fcea`; corrected compiled result pending. Preserve the historical record only to document why a seemingly accepted native prompt was an incorrect test. The separate Mimikyu `copycatAttack` eligibility guard is supported directly by pinned source and is still under corrected replay.


## Finding

A real native `ChooseAttackPrompt` from **Regidrago VSTAR SIT 136's Apex Dragon** can accept **Dragon Dialga-GX UPR 100's Overclock** but then produce **no cards drawn at all**. In a matched staged direct-control experiment with zero cards in the acting owner's hand and eight in their deck, the same printed Dialga-GX's normal `AttackAction('Overclock')` drew six and left two in deck. Both physical owner-seat orientations reproduced the discrepancy with the same pinned engine and source card printing.

The underlying defect is broader than Mimikyu Copycat's separate extra eligibility exclusion. **An attack choice appearing and being resolved in native prompts is insufficient evidence that the chosen attack's effects were actually applied.**

## Exact text and rules

- **Regidrago VSTAR SIT** Apex Dragon: `Choose an attack from a Dragon Pokémon in your discard pile and use it as this attack.`
- **Dialga-GX UPR 100** is Dragon-type (contrast the Metal-type Dialga-GX FLI 82). Its Overclock draws until six cards are in the user's hand, and its separate Timeless-GX attack deals 150 and grants an additional turn.
- Uploaded **Advanced Player's Rulebook, II.C-18**, says using a chosen attack as this attack entails all of that attack's effects and damage, without needing the copied attack's Energy cost unless stated otherwise. A no-draw Overclock with eligible deck cards does not satisfy the printed source behavior.

## Compiled physical evidence

`simulation/twinleaf/agent46-regidrago-apex-overclock-payload-native.cjs` at `4402a8f9` stages the pinned real Store, real Dragon Dialga-GX UPR in the attacking Regidrago's discard, two physical Double Dragon Energy on active Regidrago, eight Psychic Energy cards in its own deck, and zero hand cards.

The prior-turn source fixture `simulation/twinleaf/agent46-mimikyu-apex-consecutive-native.cjs` at `69a23103` dispatches native Apex Dragon, resolves a genuine owner `ChooseAttackPrompt` choosing **Overclock**, then settles the native wait sequence. It records source-hand and source-deck sizes **immediately after Apex**, before the opponent's subsequent actions.

A separate direct native fixture puts Dragon Dialga-GX UPR Active with an attached Metal Energy, with identical zero-hand/eight-deck resource counts, then dispatches actual Overclock. All game-zone changes are observed through native objects and accepted Store dispatches. Both are deliberately staged, not naturally drawn games.

**Actual compiled manual [CI 42323852457](https://github.com/FlareZ123/experiment-01/actions/runs/42323852457), SUCCESS, pinned source `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:**

| Source owner seat | Printed direct Overclock: hand / deck | Regidrago chooses Overclock through Apex: hand / deck | Source prompt resolved | Native error |
| --- | --- | --- | --- | --- |
| 0 | `0/8 -> 6/2` | `0/8 -> 0/8` | Yes | None |
| 1 | `0/8 -> 6/2` | `0/8 -> 0/8` | Yes | None |

Native Apex was genuinely announced, the physical Dragon source was in the owner's discard, the exact offered attack was selected, and the engine recorded the actual preceding non-GX Apex attack and handed off its turn. This refutes an explanation based on the selection being absent or the copied attack lacking a valid target. It does **not** establish any game win, or prove all copied attacks in Twinleaf fail; this witness establishes the named Overclock path.

## Independent nested Mimikyu GX continuation controls

The separate pinned source condition `COPY_OPPONENTS_LAST_ATTACK` also rejects Mimikyu GRI's Copycat after a non-GX Apex, due to `copycatAttack:true` even though the Mimikyu printing excludes only GX attacks. See [prior report](agent46-mimikyu-copycat-nongx-apex-native-block-20261107.md), compiled [42322332100](https://github.com/FlareZ123/experiment-01/actions/runs/42322332100) and [42322746523](https://github.com/FlareZ123/experiment-01/actions/runs/42322746523).

Two opt-in exact-source **prompt-preserving** research adapters successfully exposed a Mimikyu/Apex/Dragon Dialga-GX `ChooseAttackPrompt` and accepted `Timeless-GX`, but neither changed the board: **0 damage, no GX-use flag and no extra turn**, both seats. Tests: `agent46-mimikyu-apex-timeless-native.cjs` CI [42322990586](https://github.com/FlareZ123/experiment-01/actions/runs/42322990586), and `agent46-mimikyu-apex-flattened-native.cjs` plus `agent46-mimikyu-apex-flattened-consecutive-native.cjs` CI [42323423024](https://github.com/FlareZ123/experiment-01/actions/runs/42323423024). Neither is a paper-fidelity fix.

An intentionally **non-playable diagnostic** `agent46-mimikyu-apex-synchronous-hook.cjs` does not offer a strategic payload choice: it preselects the exact physical Dragon Dialga-GX UPR Timeless-GX and sends it through the original native synchronous `runDelegatedCopiedAttack` after a *real* immediately prior Apex turn. The pinned engine **then dealt 150 damage and set both `usedGX:true` and `usedTurnSkip:true`** with no native exception, in each seat, as witnessed by `agent46-mimikyu-apex-synchronous-native.cjs` in compiled [42323852457](https://github.com/FlareZ123/experiment-01/actions/runs/42323852457). The source-turn Win/Prize lifecycle, timing and paper legality are unqualified. The result does isolate the important failure boundary to the choice/generator/delegation path rather than universally missing Dialga GX attack handlers. Do not use a preselected diagnostic as an actual decision policy.

## Next evidence gates

1. Identify the pinned native generator path that accepts the `ChooseAttackPrompt` yet fails to invoke the selected source's attack effect. Instrument accepted prompt callback, copied-source handler entry, `AttackEffect`, native player hand/damage and GX flag in one real Store; distinguish callback progression from `copyAttackSessions` cleanup.
2. Develop a **reversible research-only hook** for genuinely prompted attack choice and subsequent original delegated synchronous effect resolution; preserve all possible Dragon choices, source custody, optional cancellation, GX once-per-game and no vendor edits. Show a direct control, an actual preceding Apex, Mimikyu Copycat counterpart, both seats and full damage/Prize/turn resolution before integrating into shared common policy.
3. Re-evaluate previously accepted source attacks/printed payoff claims under this effect check. In particular, a non-GX copied attack counted as `AttackAction` or a resolved `ChooseAttackPrompt` may still have no effect. Verify actual board deltas and opponent response instead of inferring success from declared action counts.
4. Never promote an unqualified hooked replay to a competitive field matchup; independent source lists, policy quality, full game, Prize settlement, 25-minute clock and all 32 opponent identities remain outstanding.

**Population qualification:** 29/32 authenticated Aichi original name/count 60s; missing ranks 23,25,28; zero competitively qualified games; no 99.5% evidence. No vendor edits.

**Agent 46**
