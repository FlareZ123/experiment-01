# Source-dealt New Moon rank-8 reversal: opposite terminal mechanisms

**Agent 1, 17 October 2026. Status: unqualified fixed-seed diagnostic, zero competitive games.**

## Identity and reproduction

The first New Moon Lockbreaker paired pilot [manual CI 39022298459](https://github.com/FlareZ123/experiment-01/actions/runs/39022298459) used one authentic deck-shuffle seed, **1655907393**, against the exact published rank-8 Aichi **Absol Garbodor** 60 with the candidate in physical **A/0**, actually going **first**. The challenger is the frozen four-slot change to the published 52nd-place New Moon source: two Trainers' Mail and two Rescue Carrier removed for two Field Blower and two Canceling Cologne. All other physical candidate slots and the opponent 60 are held fixed.

A fresh compiled replay at [manual CI 39038490110](https://github.com/FlareZ123/experiment-01/actions/runs/39038490110), head `31c14a23f4e284005faf5bff740123026a6663f1`, **passed five source-independent terminal-signature regressions** and reproduced the archived **winner, remaining Prizes and final turn in both arms exactly**. [Archived live terminal transition and 60-card fingerprint artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39038490110/artifacts/12103600076).

A new research-only [two-arm runner](../../simulation/twinleaf/newmoon-terminal-audit.cjs) captures actual `runMatch.terminalTransition`, before/after public player conditions, genuine engine winner, current [terminal signatures](../../simulation/twinleaf/terminal-signatures.cjs), and actual first-turn order; [pure regressions](../../tests/terminal-signatures.test.cjs) require honest ambiguity when multiple ending conditions coexist or when a zero deck is merely observed. The [manual workflow](../../.github/workflows/newmoon-terminal-check.yml) compiles the pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, invokes the same policy options as the source pilot and preserves an artifact through a locked, atomic single-writer file transition. This is a fresh-process rerun of gameplay, not full intermediate-Store graph replay or paper-rule certification.

## Exact observed terminal states

| Publicly observed quantity | Original source 60 | Lockbreaker four-slot revision |
| --- | --- | --- |
| Engine winner (candidate physical A=0; opponent B=1) | **Candidate 0** | **Opponent 1** |
| Ending turn and last engine dispatch | **60**, ResolvePromptAction (WaitPrompt) | **40**, ResolvePromptAction (WaitPrompt) |
| Initiating action immediately before terminal prompt chain | **Candidate PassTurnAction**, action ordinal 295 | **Opponent AttackAction**, action ordinal 247 |
| Candidate remaining Prizes | **6 → 6** | **6 → 6** |
| Opponent remaining Prizes | **6 → 6** | **3 → 0** |
| Candidate Pokémon in play | **6 → 6** | **9 → 8**, Active removed |
| Opponent Pokémon in play | **6 → 6** | **9 → 9** |
| Candidate remaining deck | **9 → 9** | **11 → 11** |
| Opponent remaining deck | **0 → 0** | **9 → 9** |
| Recorded Field Blower / Canceling Cologne actions | **0 / 0** | **0 / 0** |

Arrow here denotes immediately before the final live `Store.dispatch` and immediately afterward, **not** game-start to game-end. The initial source game advanced from turn 59 (candidate Active turn) to turn 60 (opponent turn) while the opponent's deck was already empty; the pinned engine then declared the candidate the winner, with both Prize pools untouched and all Pokémon still in play. These observations strongly identify an **engine turn-opening deck-out**. They do not independently prove that Twinleaf's deck-out implementation has been reconciled with all paper timing, though the supplied Advanced Player's Rulebook specifies loss on a mandatory turn-opening draw without a card.

The four-slot variant ended after the opponent's actual attack and two prompt resolutions. The candidate's Active was removed, with the opponent moving from three remaining Prizes to zero. That is an observed **three-Prize terminal attack sequence**, not an Item counter success. No unique paper cause is assigned where markers might overlap; the utility deliberately records observable signatures without fabricating a cause.

## Exact opponent attack-path divergence

A second unchanged two-arm source replay [compiled CI 39038841441](https://github.com/FlareZ123/experiment-01/actions/runs/39038841441), at head `5f9708b33215cdeb76a69d8600dff0c5696d4f26`, also **passed** and reproduced the same outcomes. Its [new v2 artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39038841441/artifacts/12102824852) records actual opponent `AttackAction` names in the decisive late turns:

- Source 60: the opponent's Active **Mega Absol ex** used **Terminal Period** on turns **52, 54, 56 and 58**, while both players remained on six Prizes. Printed Mega Absol ex (ME1 86) uses Terminal Period to Knock Out the Active only when it has **exactly six damage counters**, with no printed base damage.
- Modified Lockbreaker: opponent's Mega Absol ex instead used **Claw of Darkness** on turns **34, 36, 38 and 40**. Its printed attack does **200 damage**, then discards a selected card from the revealed opposing hand. Opponent's remaining Prizes went from **three to zero** after the turn-40 attack/prompt chain.

These names distinguish a condition-dependent Knock Out plan from a direct 200-damage attack. The record does **not yet establish that Claw of Darkness was Energy-payable in source-arm turns 52–58**; that requires the recorded attached Energy at those exact board states. Thus the move choices and results diverge, while calling source-arm Terminal Period an objectively avoidable policy misplay would be premature. The opponent's attack choices are another major mechanism not captured by the original pilot's final-winner labels.

## Implication for the deck choice

The earlier fixed-seed winner reversal **must not be characterized as positive evidence for Field Blower or Canceling Cologne**. Neither new Item was played in either arm, so there is zero direct exposure to their intended effect. The source's recorded win occurred through the opponent exhausting its deck while the candidate took **no Prize cards**. Separate [Agent13 source-policy auditing](../als/new-moon-lockbreak-policy-exposure-gate.md) confirmed the generic bot made no direct candidate attacks or Perfection invocations across the eight original paired arms, instead passing repeatedly; the sample was entirely candidate-going-first.

The challenger losing through an opponent's three-Prize attack could result from altered resource sequencing, differing hidden draws, generic policy flaws, or actual deck robustness costs. This one exploratory seed **does not identify which removed Trainer slot is causally responsible**, distinguish a skillful response from bot exploitation, estimate any matchup win rate, or qualify either 60 for promotion.

**Next discriminating test:** preserve exact dealt state before the first diverging action and identify which original connector or recovery resource became unavailable. Independently test actual counter-Item legal play and response on a source-dealt board with an active relevant lock, with both actual starting turns and competent opposing policy. Until then all certified competitive game counts remain **zero**.
