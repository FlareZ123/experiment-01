# Agent 5: source-trigger and censoring disposition for Agent 41 cross-rank partition 0

**19 October 2026. Evidence class:** independent read-only forensic reanalysis of archived, preregistered, genuine-source Twinleaf exploratory traces. **Zero qualified competitive games; no deck ranking or 99.5% evidence.** This document does not modify any of the registered runner, source decks, policies, or completed arms.

## Provenance and exact scope

- Source: Agent 41's [precommitted registration](registrations/agent41-crossrank-r6-r11-v1-20261019.json), [compiled run 39193837824](https://github.com/FlareZ123/experiment-01/actions/runs/39193837824), archived artifact **12161805529** (`agent41-crossrank-observed.json`).
- Independently downloaded ZIP, verified **SHA-256 `59f79ff8be5fe50b19ad701614c7051b21183563f492a16d87c8b1a72aeba627`**, identical to the report's announced archive digest; extracted JSON SHA-256 `098efa1da50a3a3152abda50001ab3071b3ff3a99cc2e9ab63902c8c0d64960a`.
- Research code head `16ed358b5f0324dba10762e67f9bf286c833af49`, frozen Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; fixed 260 root-action limit.
- All **24/24** registered partition-0 arms remain in the denominator: 13 engine terminals, **10 exact action-limit censors**, and one dispatch error. These are **12 source seed/physical-slot streams**, reused between two candidate inventories. Only **11/12** candidate pairs satisfy the report's same observed first source hand and first-turn gate; this is weaker than hidden-deal equality.

## Four opportunity-triggered arms: actual completion and candidate response

| Source / registered arm | Actual source policy | Candidate reply on next turn | Observed continuation and limitation |
| --- | --- | --- | --- |
| **6:0:A:champion-reference** | Rank 6 started second. Source G&H on turn **2**, obtained Thunder Mountain + DCE, applied Stadium + Energy, and its policy emitted `AttackAction('Volt Cyclone')` (`turn2.completed=true`). | Candidate turn **3** deployed Tapu Lele-GX, Psychic Energy, Sky Field, Lillie's Determination, Marshadow, Latias ex, another Tapu Lele-GX, then **`Pale Moon-GX` root AttackAction**. | Source had **1** total Store attack declaration, candidate **3**; source-policy attack intent is documented but exported archive does not retain the declaration's name or post-attack lock/damage snapshot. Engine terminal candidate seat 0, **[2,6]** remaining Prizes (candidate, source). The terminal initiating action is a candidate attack, at a much later point. |
| **6:0:A:new-moon-lockbreaker-v1** | **Same actual first source hand** as previous arm; rank 6 second. Identical turn-2 G&H → Stadium + DCE → issued Volt Cyclone policy steps, `completed=true`. | Candidate turn **3** attached Telepathic Psychic Energy and **passed**. On turn **5** it evolved Dusclops, then announced **Hidden Power**. | Source had **7** total declarations, candidate **1**. Source won on a much later attacking terminal after **240 root actions**, with **[6,0]** Prizes. This source-hand-paired contrast is policy- and roster-confounded; it cannot estimate inventory win-rate difference. |
| **6:2:A:new-moon-lockbreaker-v1** | Rank 6 first. On source turn **3**, held Tag Call searched G&H, G&H found DCE with Stadium held, then Stadium + DCE were played and policy emitted Volt Cyclone; `turn3.completed=true`. | Candidate turn **4** evolved Dusclops, attached Psychic Energy, played Lillie's Determination and **passed**. Turn **6** included Gengar & Mimikyu-GX, Energy, Ace Trainer, Forest Seal Stone, Fog Crystal, then **passed**. | Source had **5** total declarations, candidate **0**. Source engine terminal via attack on turn 15, remaining Prizes **[6,0]**. Crucially the paired champion arm `6:2:A:champion-reference` **failed before supplying comparable first-hand evidence**. Treat this as an unpaired source-opportunity observation. |
| **11:2:B:champion-reference** | Rank 11 second. On turn **2**, source issued Tool attach, Boost Shake, Garbodor search and chosen target. `completed=true`; **next-turn live witness `equippedGarbodor:true`**. | Candidate turn **3** evolved Shadow Rider Calyrex VMAX, attached Psychic Energy, used Hisuian Heavy Ball, placed Dialga-GX, played Guzma, then **passed**. Turn **5** used Fog Crystal, attached Energy and **passed**. | The source had **6** total attack declarations, candidate **1** somewhere later; no demonstrated immediate Tool removal, Underworld Door escape or damaging reply. Source deck emptied; candidate won at start of source turn **34** by deck-out, with **[6,6]** Prizes throughout this terminal. That engine win is not proof the candidate beat the equipped-Garbodor lock competently. |

**Qualification nuance:** The rank-6 policy's `completed` flag is set **before returning** its `AttackAction('Volt Cyclone')` to the Store; the archived data records only per-seat *counts* of actual attack declarations. A full source action → accepted named attack → printed effect → candidate answer witness requires preserving named Store attack declarations and subsequent board/damage/lock state. Likewise the rank-11 source's next-turn equipped Tool is stronger direct evidence of the mechanical lock setup than a mere proposed action.

The **three rank-6 triggered arms correspond to two distinct physical seed/slot streams**, because the two `6:0:A` candidate arms share a source starting hand. The fourth is one rank-11 stream. The proper exploratory opportunity denominators are **3 rank-6 arms / 2 streams** and **1 rank-11 arm / 1 stream**, retaining all no-opportunities and rejected/capped counterparts.

## All 11 nonterminals: what the artifact can actually identify

**10 action-limit censorings**, each with `engineEndReason:'action-limit'` at the exact fixed **260** root actions:

| Arm | Turns | Final Prizes [candidate, source] | Attack declarations [candidate, source] |
| --- | ---: | --- | --- |
| 6:0:B:champion-reference | 32 | [3,6] | [0,4] |
| 6:0:B:new-moon-lockbreaker-v1 | 36 | [5,6] | [0,1] |
| 6:1:A:new-moon-lockbreaker-v1 | 46 | [6,6] | [0,0] |
| 6:1:B:champion-reference | 31 | [2,2] | [3,6] |
| 6:2:B:champion-reference | 30 | [4,6] | [0,4] |
| 6:2:B:new-moon-lockbreaker-v1 | 31 | [3,6] | [5,3] |
| 11:0:A:champion-reference | 36 | [2,6] | [3,1] |
| 11:0:B:new-moon-lockbreaker-v1 | 41 | [6,3] | [5,9] |
| 11:1:B:new-moon-lockbreaker-v1 | 37 | [1,6] | [9,8] |
| 11:2:B:new-moon-lockbreaker-v1 | 49 | [6,6] | [0,23] |

The archive proves these ten ran into the specified cap and records attacks and Prize positions, including a **turn-46 0/0-declaration cap** and a **turn-49 0 candidate versus 23 source declarations cap**. It does **not** preserve the last actions, remaining legal options or complete owner-visible last state for each. Therefore none can be classified confidently as a policy loop, an unresolved prompt, or genuinely slow but progressing gameplay. Prize counts alone do not establish activity during the final turns.

**One engine dispatch rejection:** `6:2:A:champion-reference` threw after **33** actions: `PlayCardAction: BLOCKED_BY_EFFECT` from `headless.cjs`, with its exception stack but no last candidate/source root ledger or physical board snapshot. The blocked card, effect owner and legality of the bot's proposed action are **unknown from this artifact**. It might be a legitimate lock veto exposing a weak policy; the exception alone cannot establish the applicable rule or proper recovery. The result is an **engine-error**, never a loss.

## Decision and next falsifiable change

**Disposition: both frozen 60s remain unpromoted; partition 0 is inconclusive for candidate selection.** The strongest immediate source observation is the rank-11 real equipped-Garbodor next-turn witness, but its candidate eventually obtained an unqualified deck-out win without an evidenced timely removal or attack response. The rank-6 source policy reported three completed attack proposals; source-name acceptance and printed effect are not certified in the archive. In the only initial-source-hand-matched triggered pair, champion-reference followed an early `Pale Moon-GX` whereas New Moon passed, a specific candidate decision-policy competence gap worth auditing before comparing lists.

**Best next integration:** reuse Agent 41's frozen partition-0 runner for a *single bounded forensic rerun* that archives the **actual named Store attack declaration and public post-attack state**, plus the **last 8 root decisions and owner-visible public state** for each censor/error. Do this diagnostically on the *same registered seeds* without entering reruns into a new win-rate sample. A targeted source-turn and candidate-reply packet would establish whether the four reported opportunities converted and whether the error is a faithful effect veto. Only after diagnosing policy corrections should a **separately registered, fresh-seed, two-archetype v2** be used for any genuine deck-choice comparison.

All outcomes are provisional simulator observations. Japanese printing equivalence, paper-rule fidelity, bilateral expert action competence, hidden-state pairing, and an official match clock remain unverified.
