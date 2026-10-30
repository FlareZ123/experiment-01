# Native owner-controlled Volt Cyclone: first-attached default is a bot choice, reversible with a genuine prompt

**Agent 6, 30 October 2026.** Original Aichi rank6 Iron Thorns ex versus original rank1 Shadow Rider champion-reference, original printed 60s unchanged, true source-first, actual source physical seat A seed **531384326**. From the same genuine physical source opening the source can stage either Speed Lightning first or Double Colorless first, then attach the other at T3 and use its real printed **Volt Cyclone for 140**, Knocking Out Marshadow and taking one Prize (source **6→5**). The subsequent Energy-transfer choice is genuinely **owned by the player**, and can be changed independently of Energy-attachment chronology.

## Reproduction and corrective diagnostic

[Initial six-arm preregistration](registrations/agent6-rank6-volt-cyclone-energy-donor-native-20261030.json) committed **11379f44e1e53e48d27058972278926275598031** before initial code. The printed card database `sv6-77` specifies that Volt Cyclone may move **one Energy** from itself to a Benched Pokémon. First attempt incorrectly instrumented `MoveEnergyPrompt`: [CI 41127391355](https://github.com/FlareZ123/experiment-01/actions/runs/41127391355) returned **zero** such prompts despite six settled attacks. A read-only original Store trace in [CI 41127634160](https://github.com/FlareZ123/experiment-01/actions/runs/41127634160) located the actual native **source-owned `AttachEnergyPrompt` id23**. Its genuine `ResolvePromptAction` physically transferred the first attached Energy from Active to Benched Iron Thorns: Speed in Speed-first, DCE in DCE-first. Other owner prompts were Wait and Prize. This was a wrong adapter surface, not evidence that the Store lacked an owner prompt.

[Corrective six-arm registration](registrations/agent6-rank6-volt-attach-prompt-donor-corrected-20261030.json) committed **582e23080d4bed287bfc8b0c5bdcfa5e499ef535** before implementing the corrected chooser. The first corrected CI run 41128030353 failed at a field-name mismatch in the new runner's registration contract, before running any games. The runner was aligned with the committed new registration in commit **cd2d445fbdc7c12d7e320da33fa1fcfabf9f7e9f**, and all actual native tests then passed.

**[Corrected CI **41128188633 SUCCESS**](https://github.com/FlareZ123/experiment-01/actions/runs/41128188633)**, execution checkout **e317e9e4527d143b86fe28024b8f9edaa6443352**, original Twinleaf pin **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. [Full unaltered artifact 13011906387](https://github.com/FlareZ123/experiment-01/actions/runs/41128188633/artifacts/13011906387), independently downloaded ZIP SHA256 **e72909b97dd6bd9528b306a87c06844c34a65865796eee074d2f5bdc77f4b480**. Native [reversible owner-only prompt resolver hook](../../simulation/twinleaf/agent6-volt-cyclone-donor-choice.cjs), [exact six-arm runner](../../simulation/evaluation/agent6-rank6-volt-cyclone-donor-native.cjs). This hook uses only **own Active attached physical Energy, own Bench, actual source player-id and native `AttachEnergyPrompt` CardList**, never hidden deck/Prize/opponent hand; no vendor edits. The original pinned Store and strict validators accept all choices.

## Six-arm native receipts, same source first physical deal

All six original Store executions succeeded without errors, **6/6** authentic T3 settled Volt Cyclone KO Marshadow 140 with source **Prize6→5**, **6/6** same physical initial deal SHA, same entire opponent T2 native accepted root stream (**Fog Crystal, Girafarig, Psychic Energy, Red Knuckles**), same first opponent T4 roots (**Psychic Energy, Pass**), and no clock-reset crossing. Every explicit donor selection was exposed by the owner-only `AttachEnergyPrompt` and physically moved. Four explicit selections accepted and settled, zero rejected or no-menu fallbacks.

| Original source attachment order | Native donor selection | Actual source Active after damage | Actual second Iron Thorns on Bench after damage |
| --- | --- | --- | --- |
| Speed T1 → DCE T3 | Native generic default | **DCE** | **Speed** |
| Speed T1 → DCE T3 | Explicit **DCE** | **Speed** | **DCE** |
| DCE T1 → Speed T3 | Native generic default | **Speed** | **DCE** |
| DCE T1 → Speed T3 | Explicit **Speed** | **DCE** | **Speed** |
| Speed T1 → DCE T3 | Explicit **Speed** | **DCE** | **Speed** |
| DCE T1 → Speed T3 | Explicit **DCE** | **Speed** | **DCE** |

The default generic resolver chose the **first attached Energy** in both tested chronology orders. The corrected physical owner chooser can deliberately choose **either Speed or DCE**, even when that Energy was attached second, using the native original prompt and without altering the printed 140-damage KO, Prize, or first opposing response. The prompt pool included the physical Active Iron Thorns ex and both Energy card objects. The strict Store's `ResolvePromptAction` removed exactly the requested physical Energy from Active, attached it to the own Benched Iron Thorns ex, and left the other on Active.

## Why this matters and what remains open

The original source deck's resource sequencing can change when Speed's draw-two effect occurs (T1 vs T3), but its Energy donation choice need **not** be determined by that chronology. A policy or simulator that attributes later Active/Bench Energy allocation to the earlier attachment order without consulting a player-owned donor choice risks evaluating a **generic bot artifact as a structural deck constraint**. A competent policy should explicitly choose the physical donor from current public board and future Energy needs. For example, leaving Lightning on Active can favor a future DCE manual attachment; moving Lightning to Bench can favor a different backup attacker. Which is better requires future draw/attachment/supporter/opponent-specific analysis and remains untested here.

Limitations: one already-known favorable physical source deal, source-only heavily scripted T1/T3 setup, generic opponent policy, 135-action cap, no paper game-clock model, no independently qualified competitive result, and no evidence the winner would be different. The test proves **game-engine/prompt integration correctness for an important owner choice**. It does not establish any matchup percentage.

**Benchmark unchanged: 29/32 verified original opposing printed 60s, zero competitively qualified games, no fixed deck established at 99.5%.**
