# Agent 25: full archived partition-0 cross-rank disposition

**19 October 2026 UTC.** Evidence class: read-only forensic census of the exact, *previously preregistered* 24-arm rank-6/rank-11 exploratory replay archive. No new game, policy, seed, card swap or competitive result was generated.

## Source integrity and interpretation

- Registration: [Agent 41 v1](registrations/agent41-crossrank-r6-r11-v1-20261019.json), originally committed before outcomes at `70b83b9ad0ae98d6daae6ae4ced1856f70beb913`.
- Compiled manually dispatched source: [CI 39193837824](https://github.com/FlareZ123/experiment-01/actions/runs/39193837824), research revision `16ed358b5f0324dba10762e67f9bf286c833af49`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Immutable archive: [artifact 12161805529](https://github.com/FlareZ123/experiment-01/actions/runs/39193837824/artifacts/12161805529), ZIP SHA-256 `59f79ff8be5fe50b19ad701614c7051b21183563f492a16d87c8b1a72aeba627`. Parsed archive member `agent41-crossrank-observed.json`, SHA-256 `098efa1da50a3a3152abda50001ab3071b3ff3a99cc2e9ab63902c8c0d64960a`.
- Method: inspect **every** `rows[]` element of that archived JSON; count the `sourcePolicyAudit` started/completed flags, `sourceTriggerTurn`, `responseDecisions`, true-start flag, `candidateAttackDeclarations`, `sourceAttackDeclarations`, `status`, `terminalTransition`, owner-seat and Prize arrays. Reconcile against `pairs[]` and `statusCounts`. All 24 original arm IDs remain in the denominator. There are 12 candidate-paired rank/repeat/physical-seat streams and **only 11/12 pairs with matching first recorded source hand and actual first player**. Matching first observations do not establish identical hidden Prize/deck orders.
- Dataset totals reproduce: **13 engine-terminal, 10 action-capped/incomplete, 1 engine-error**, **three rank-6 opening-policy triggers and one rank-11 trigger**. The four trigger *arms* occupy just three distinct rank/repeat/slot streams because both candidates trigger rank `6:0:A`.

## All four triggered source-policy arms, with next candidate action

| Frozen arm ID | Real source starts | Source-policy evidence | First observed candidate reply and relevant continuation | Engine terminal, strictly unqualified |
| --- | --- | --- | --- | --- |
| `6:0:A:champion-reference` | Second | Turn-2 held Guzma & Hala line marks **completed**; fetch Thunder Mountain and Double Colorless Energy; source logged **1 attack declaration** overall | Turn 3 starts with Tapu Lele-GX; candidate later declares **Pale Moon-GX** on turn 3; source has no Pokémon in play at terminal | Champion seat A, 93 actions/7 turns, final Prize counts `[2,6]` |
| `6:0:A:new-moon-lockbreaker-v1` | Second | Same turn-2 G&H line marks **completed**, same first visible source hand; source logged **7 attack declarations** overall | Turn 3 Telepathic Psychic Energy, prompt, then **Pass**; turn 5 printed **Hidden Power** declaration; source later takes last Prize | Rank-6 source seat B, 240 actions/30 turns, final Prizes `[6,0]` |
| `6:2:A:new-moon-lockbreaker-v1` | First | Turn-3 Tag Call into G&H line marks **completed**; source logged **5 attack declarations** overall | Turn 4 Dusclops, Psychic Energy, Lillie's Determination, then **Pass**; **zero candidate declared attacks throughout** the archived run | Rank-6 source seat B, 159 actions/15 turns, final Prizes `[6,0]` |
| `11:2:B:champion-reference` | Second | Source turn 2 completed four-action direct Boost Shake chain; **equipped Garbodor witnessed on turn 3**; source logged **6 attack declarations** overall | Candidate turn 3 evolves Shadow Rider VMAX, attaches Psychic Energy, plays Heavy Ball, Dialga-GX and Guzma, then **Pass**; candidate has **1 attack declaration** overall | Champion seat B, 221 actions/34 turns, final Prizes `[6,6]`; source deck remaining **0**, challenger **11**, terminal awarded challenger |

Important outcome cautions:

1. The two `6:0:A` arms share first observed source hand, seed, engine source physical seat and precommitted source opener, but have **different candidate inventories and subsequent trajectories**. Their opposite engine winners are an exploratory *policy-and-inventory* contrast, not an isolated card-power effect, a paired randomized counterfactual, or a tournament result. These games ran under candidate-specific policies.
2. The rank-11 `11:2:B` source-equipped lock has a concrete next-turn witness. Its apparent candidate win occurs with **no Prizes taken by either player** and with the source deck exhausted at termination. The archive is consistent with a deck-exhaustion outcome, and it offers no evidence of beating Garbotoxin through Prize pressure. Formal reducer adjudication and policy quality remain to audit.
3. The New Moon counterpart `11:2:B:new-moon-lockbreaker-v1` starts from the *same first recorded source hand* and actual starting order but records **no opening Boost Shake-policy trigger**; its own candidate policy later records one legal Field Blower Tool removal at turn 35. It remains capped after 260 root actions, zero candidate attack declarations, and source **23** attack declarations. This is strong evidence that the opener trigger cannot be treated as identical exposure in the two different candidate games.

For rank-6 `6:2:A`, the companion champion-reference arm is the sole `engine-error`, before the runner writes any full game evidence. It cannot be used to attribute a paired outcome or to assert that its source also completed the opening line.

## All ten nonterminal games and the rejected root

Every one of the **10 incomplete** records stops at the registered **260-root-action cap**. Five report **zero candidate attack declarations**; one of those (`6:1:A:new-moon-lockbreaker-v1`) reports **zero declarations from both sides** after 260 actions/46 global turns. The other five caps do have candidate attack declarations, including `11:1:B:new-moon-lockbreaker-v1` (9 candidate, 8 source). Accordingly, a blanket "no attacks" explanation for all 10 caps is false. Archive-level diagnostics cannot determine which sequences are policy passes, ineffective play, or genuine still-advancing games without per-root action and board snapshots.

The sole exception is `6:2:A:champion-reference`, seed **2394734225**, `PlayCardAction` rejected `BLOCKED_BY_EFFECT` at root action **33**. This archived `engine-error` record stores an exception stack but **no rejected action card name, actor own hand or public board**, so the exact prohibited action **cannot be identified from this artifact**. An already existing research-owned, narrow replay `simulation/evaluation/agent6-crossrank-rejected-root.cjs` uses the native `captureRejectedActionEvidence` hook to recover owner-observable evidence. Its *implementation* is visible; a passing compiled result and reported cause have not been established by this census. Do not diagnose a specific lock or fault from the error label.

## Freeze the disposition before more games

| Hard opponent | Champion reference | New Moon v1 proxy | Decision |
| --- | --- | --- | --- |
| Rank 6 Iron Thorns | 2 engine terminal wins, 3 caps, 1 Store rejection; one scripted attack pressure and candidate Pale Moon reply observed | 3 engine terminal opponent wins, 3 caps; scripted attacks observed, including zero-attack candidate | **Inconclusive**: one striking pair and multiple decision failures; candidate/policy comparability unqualified |
| Rank 11 Absol/Garbodor | 1 engine terminal win with zero Prizes and source empty deck, 4 engine terminal opponent wins, 1 cap; one equipped lock witnessed | 1 engine terminal win, 2 engine terminal opponent wins, 3 caps; no first-turn lock witness in this partition | **Inconclusive**: asymmetric source exposure and incomplete owner-safe attack policy |

Totals above are **archived simulator statuses**, deliberately **not win/loss rates**. Engine terminal percentages or wins cannot be promoted to tactical superiority, independent game samples, full Japanese-printing/paper-rule fidelity, or a 99.5% benchmark. Rank-11 Tool breakage at turn 35 should not be conflated with a turn-2 first-response opportunity.

**Specific next decision:** preserve v1 partition-1 registration unchanged but defer its compiled run until the single rejected-root owner/public-state defect is characterized and a **separately preregistered v2** describes stronger *both-player*, hidden-information-safe decision policies, response/terminal evidence and a stopping rule for action-cap-heavy cohorts. Either run v1 partition 1 later for the narrow registered mechanical purpose, with every null/cap retained, or invest in fresh v2 deals. Avoid changing the archived v1 policy and presenting its previous arms as v2 validation. Coordinate with Agents 41, 6, 17 and 23.

**Field status unchanged:** 29/32 exact source lists (ranks 23, 25, 28 missing); zero competitively qualified games; no final fixed 60 or demonstrated 99.5%.
