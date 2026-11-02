# Original rank-30 Clefairy: actual free retreat exposes a settled Rondo, without changing the winner

**Agent 6 | 2 November 2026 | one retrospective original physical-deal positive witness; zero competitive-qualified games.**

## Question and fixed inputs

Agent 7's original-source rank-30 A/B/A [Psychic Bench staging](agent7-rank30-psychic-benched-staging-original-native-20261101.md) demonstrated genuine native Energy attachments to the same Benched `Lillie's Clefairy ex JTG` without an attack. Agent 7 requested an exact original-Store CheckRetreatCostEffect, physically accepted promotion and Rondo followed by a meaningful reply, rather than inferring that Latias ex's Skyliner makes retreat possible.

The follow-up reuses the **previously inspected**, unselected-for-strength rank-30 physical deals from `simulation/evaluation/agent25-nine-omitted-archetypes-source-readiness.cjs`: source slot A / source seat 1 / seed **3407938073**, and source slot B / source seat 0 / seed **233633536**. Each compares the same two unchanged candidate 60s (rank-1 champion-reference and New Moon Lockbreaker) with owner-source Psychic Bench staging **on in both control and treatment**. A control Pass is retained. A treatment may replace one real source Pass with a Store `RetreatAction` only after observing an actual two-Psychic funded Clefairy, a native zero-cost retreat result, and a suitable owner Active. No action is injected into the opponent's turn. This is **retrospective mechanical intervention** rather than prospective gameplay evidence.

## Reproducible native result

- [Compiled manual workflow 41383792967](https://github.com/FlareZ123/experiment-01/actions/runs/41383792967), pinned execution source commit `f2e43587d5c32e26d67a68ebfc347c470191d78e`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Full native artifact 13114481627](https://github.com/FlareZ123/experiment-01/actions/runs/41383792967/artifacts/13114481627), ZIP SHA256 `370808e4e8572c24f7ca2aaf11a76c89ef364b573149625f56d0598696a80124`, full JSON plus original native root ledgers and settled-attack before/after public boards.
- Eight actual Store attempts (two seed/seat cases × two unchanged fixed candidates × control/treatment), **zero native exceptions**, **four of four** same-candidate identical full initial physical-deal fingerprints. All attempts reached an untimed engine terminal; **zero competitively qualified games**. These are previously observed seeds and retain selected-deal bias.

| Original physical case | Real owner Pass opportunity | Native treatment | Native engine winner |
| --- | --- | --- | --- |
| A / rank-1 champion | Turn 30, after two real Psychic Energy on Clefairy | Zero-cost `RetreatAction` accepted; natural next action `Full Moon Rondo` declared and settled for **180 damage** | Candidate in both arms |
| A / New Moon | Not encountered before terminal | No intervention | Candidate in both arms |
| B / rank-1 champion | No source Pass at turn 33; source used `Filch` | No intervention | Source in both arms |
| B / New Moon | No source Pass at turn 33; source used `Filch` | No intervention | Candidate in both arms |

**Exact positive live window:** A/champion, original source physical seat 1, native global turn 30. Authentic source owner ID 202, Active `Latias ex SSP` with visible `Skyliner`, source Bench index 0 `Lillie's Clefairy ex JTG` holding exactly two `Psychic Energy MEE`, zero Special Conditions and `CheckRetreatCostEffect.cost.length === 0`. Control chose `PassTurnAction`. Treatment's genuinely dispatched Store `RetreatAction(202,0)` succeeded, and the live source Active became Clefairy. Headless then **naturally proposed** `AttackAction Full Moon Rondo` without an additional attack override. Native attack settled through completion root **121** from attack declaration root **118**, changed opponent Active `Latias ex` from **0 to 180 damage**, with **no source Prize** on this attack. Source seat 0 (the opponent) then made a native turn-31 `PlayCardAction Lillie's Clefairy ex` and **`AttackAction Eon Blade`**, demonstrating consequential opponent continuation. The current game-level winner remained the candidate. This establishes a mechanically executable line in one specific physical state, not a strong policy or matchup.

## Instrumentation repair and evidence caveat

The prior [manual run 41361363742](https://github.com/FlareZ123/experiment-01/actions/runs/41361363742) contained eight Store attempts and **zero** reported source Pass windows, even though its native headless ledger included source Turn-30 Pass. The observer incorrectly relied on an `AddPlayerAction`-based initial Store sentinel and `action.playerId`. A read-only diagnostic [run 41383727683](https://github.com/FlareZ123/experiment-01/actions/runs/41383727683) showed the authentic T30 native Store action reached the wrapper with `actionPlayerId:null` under that incorrect field lookup (275 total Store dispatches in A control), despite `source.id=202`. The actual headless engine associates root actions through `action.clientId ?? action.id` (prompt actions use pending prompt ownership). The fixed observer now reads those same fields, authenticates the original source seat and global turn, and uses per-Store state rather than a globally shared first-game sentinel. The native A control then observed exactly one eligible Pass and the treatment observed the same physical owner window.

The existing headless root ledger still labels the **originally proposed Pass** at ordinal 117 even when the Store observer physically dispatches Retreat in its place. Therefore **root labels alone cannot certify this intervention**. The stronger corroboration is the observer's exact Store-result receipt (retreat accepted, Active Clefairy) and the independent native attack settlement's public board, attack roots, damage and reply. This fork is an opt-in Store-level counterfactual that is **not a released two-seat actor policy**. A future natural-policy promotion must choose `RetreatAction` itself, preserve native root/proposal fidelity, certify live legality/prompt/payment and test fresh source deals.

## Code and actionable handoff

- `simulation/twinleaf/agent6-rank30-real-store-rondo-pass-fork.cjs`: default-off, reversible native Store intervention and owner/public state audit.
- `simulation/evaluation/agent6-rank30-funded-clefairy-retreat-native.cjs`: all eight source-deal control/treatment attempts and failure preservation.
- Existing **manual-only** `.github/workflows/agent7-rank30-source-psychic-staging.yml`, opt-in `agent6_rank30_rondo:true`; no push-triggered workflow added.
- **Next release question for Agent 7 / Agent 41:** can the common owner-root policy select this genuine funded Rondo mobility opportunity naturally, using only own/public information and a validated retreat-cost policy, without suppressing more valuable Active attacks? Require at least one native accepted retreat, settled attack, exact opponent reply and selected-game failures in a preregistered two-seat `v3-development` release. B/New Moon's funded Clefairy competes with an already occurring Mimikyu `Filch`, so mere funding must never force a retreat.
- Paper match clock, owner hidden-information safety for the generic scorer, source-policy competence, 3 missing original Top 32 60s and all game-level qualification remain open. **No demonstrated 99.5% field win rate.**
