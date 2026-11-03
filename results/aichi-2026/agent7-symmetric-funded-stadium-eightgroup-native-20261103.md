# Agent 7: an owner-visible funded-attack Stadium rule selects the useful original source action and rejects two paper-playable but inert replacements

**3 November 2026 | eight preregistered full physical groups, 24 real native A/B/A executions, zero paper-qualified competitive games.**

## Research question

Does a single reusable, actor-only decision rule based on **discrete attack payability** select a documented high-impact Stadium replacement without blindly playing other differently named Stadiums that the native ActionEnumerator omits?

The source-domain problem is no longer merely legality. Previous independent real original source A/B/A experiments established:
- Original rank6 Iron Thorns ex vs rank9 held `Thunder Mountain Prism Star LOT`, owned `Wondrous Labyrinth Prism Star TEU`, and passed. A one-action physical Stadium replacement made `Volt Cyclone` playable, then two attack uses and two Prize resolutions followed in the native Store.
- Original rank9 owned `PokéStop PGO` and held `Silent Lab PRC`, but replacing it after Pass yielded no new attack.
- Original rank5 Mew/Genesect owned `Path to the Peak CRE` and held `Sky Field ROS`, but replacing it with an **empty Bench** gave no immediate Bench capacity or attack payoff.

A one-size-fits-all "play eligible Stadium" agent would have selected all three. The tested rule must select a Stadium **only when a currently unpayable, damaging Active attack becomes payable from the same already attached physical Energy**, using actor-visible printed data and known Stadium cost modifiers.

## The preregistered policy

[Registration committed before native execution](registrations/agent7-funding-stadium-owner-symmetric-8group-20261103.json) (`41b2e595`) fixes the two original published 60-card pairs **rank6/rank9 and rank5/rank11**, both physical seat placements per pair, two prior retrospective seed sets and two fresh preselected seed sets. Eight physical groups × **native control / selected actor-visible Stadium after native Pass / repeated native control** = **24 bounded 90-Store-action executions**.

New research-owned code:
- [Typed, owner-only Stadium attack-funding candidate planner](../../simulation/twinleaf/agent7-funded-stadium-attack-planner.cjs), backed by existing [printed Energy payability](../../simulation/twinleaf/actor-energy-payability.cjs).
- [Reversible native bot to real Store adapter](../../simulation/twinleaf/agent7-funded-stadium-selected-native.cjs), with no upstream Twinleaf changes.
- [Actual native A/B/A symmetric eight-group runner](../../simulation/evaluation/agent7-funded-stadium-symmetric-eightgroup-native.cjs).
- [Pure planner controls](../../tests/agent7-funded-stadium-attack-planner.test.cjs), including real source-like Thunder funding, Path/Sky and Wondrous/Sky negatives, quota, card-name, status/attack locks and hidden-zone non-access.
- [Original source exact first-divergence auditor](../../simulation/evaluation/agent7-stadium-source-impact-receipt.cjs), attached to the earlier strict source controls.

Candidate selection requires an original genuine live owner root, a physical owner hand Stadium with verified different **printed name**, no public Stadium play lock, no spent Stadium turn quota, and an unmodified native `PassTurnAction`. It searches printed attacks of the current Active Pokémon using the *detached owner/public actor observation*, compares known Stadium cost modifiers and uses the existing typed attached-Energy payment matcher to find an attack doing at least 80 printed damage that was previously unpayable and becomes payable after the replacement. **Current implementation can only positively select Thunder Mountain** and recognizes Wondrous Labyrinth / Thunder cost effects. It uses no private opponent hand, deck, Prize cards or future information. It makes **one selected Stadium action maximum per game**. All other native decisions, including opponent response, run unchanged.

This is a **developmental selected component** with a native opponent bot, not a paper-entire-game oracle or validated general tactical policy. Unknown modifiers, Ability-immunity, attack rules and the cost of surrendering a lock Stadium remain open. The actual native Store remains responsible for accepting the chosen indexed card and resolving the attack and its follow-up.

## Compiled evidence and complete denominator

[GitHub Actions 41710828055](https://github.com/FlareZ123/experiment-01/actions/runs/41710828055) completed **SUCCESS** at 2026-11-03 20:20:24 UTC; checked-out code HEAD `d18c1db1bfcbf55987b38f1cfef4efca542993d8`, pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The same manual workflow's pure paper-gate and source-audit tests succeeded. The selected panel itself completed.

| Trial property | Observed |
| --- | ---: |
| Preregistered physical deal groups | **8/8** attempted |
| Native Store 90-action-budget game attempts | **24/24** |
| Native error/abort groups | **0** |
| Same complete physical deal in every three-arm group | **8/8** |
| Identical first and repeated native control full action traces | **8/8** |
| Accepted *selected* Stadium actions | **1** |
| Exact first divergence attributable to that selected action | **1/1** |
| Actions selected in four fresh preselected physical groups | **0** |
| Actual final paper-competitive games | **0** |

Artifact **13267599573**, `agent7-stadium-paper-name-native-four-arm`, includes full `agent7-funded-stadium-symmetric-eightgroup-native.json` (**1,569,959 bytes**, SHA-256 `22be96538e4f3efcfa98f421f36bce9ae0d24aa3bbd00815e48cae4c93697611`). Complete ZIP SHA-256 `20a092bcf6ad840111959ca758c902f1cac52f0f0e19137fb523a9278f29d958`, zipped size 103829 bytes. It also includes both earlier 3-arm original-source exact witnesses and the four-arm native paper name/Prism settlement controls.

| Source pairing | Seed stratum | Primary rank seat | Exact seed | Stadium selected? | Exact native result |
| --- | --- | ---: | ---: | --- | --- |
| Rank6 vs rank9 | Historic | 0 | `3858002039` | **Yes** | Wondrous→Thunder, accepted |
| Rank6 vs rank9 | Historic | 1 | `1192664073` | No | unchanged control |
| Rank5 vs rank11 | Historic | 0 | `912174767` | No | rejects inert Path→Sky option |
| Rank5 vs rank11 | Historic | 1 | `1914651848` | No | unchanged control |
| Rank6 vs rank9 | Fresh preregistered | 0 | `809028196` | No | unchanged control |
| Rank6 vs rank9 | Fresh preregistered | 1 | `4056743630` | No | unchanged control |
| Rank5 vs rank11 | Fresh preregistered | 0 | `2020989066` | No | unchanged control |
| Rank5 vs rank11 | Fresh preregistered | 1 | `1458038047` | No | unchanged control |

**The one selection is a previously discovered historical game, not independent fresh discovery.** The four fresh games gave no positive selection. There is no defensible population activation rate or win rate from this sample.

### The exact non-hardcoded positive case

In historic original rank6 seat0 at global turn10, the generic planner *without hardcoding a rank, turn, source hand index, or source card holder* detected its own Active Iron Thorns ex with 3 physically attached Energy cards, held Thunder Mountain, and in-play Wondrous Labyrinth. The local printed attack cost was Lightning + 2 Colorless; Wondrous added one Colorless, yielding **4** required symbols, hence the three attached physical Energy units were insufficient. Thunder removed one Lightning, yielding **2** required Colorless symbols, readily paid by those attached Energy units. `Volt Cyclone` has printed 140 damage, and the opponent Active Unown AOR had 60 HP. The owner-visible planner proposed **Thunder Mountain** only when the original native bot then chose Pass.

Actual Store accepted exactly the new physical Stadium, moved the outgoing Prism Star Wondrous to **own Lost Zone**, and subsequently accepted source owner `Volt Cyclone` on global turns10 and12. The two attack prompts moved attached Energy to the Bench and took two native Prize cards, 6→5→4; the same-seed native control passed on both turns, did not attack at any observed root, and took no Prize within its full 90-action control. Opponent rank9 genuinely continued: turn11 `Rescue Carrier`, `Unown` and Pass; further `Prism Energy` and Rescue Carrier were played on turn13. The first actual root-action divergence remained **ordinal 61**, with all earlier actions matching, exactly the expected genuine native mechanism.

### Negative controls and generalization limit

The policy declined both **original rank9 PokéStop→Silent Lab** and **original rank5 Path→Sky** historical missing-enumerator cases. These remain paper-playable but provided no verified immediate attack or Prize improvement under the previous actual Store counterfactuals; original rank5 owner's Bench was empty. The other historic symmetric seats and four fresh physical source games never met the narrow printed-attack payability condition.

This filtering is a meaningful improvement in **action realism** compared with simple paper-access enumeration, yet the tested agent deliberately remains silent about Stadium cards that offer future control value, ability denial, Bench capacity or next-turn preparation. Failure to select those is *coverage limitation*, not proof that those lines are strategically poor. The result also must be read alongside [Agent20's independent native negative counterfactual](2026-11/agent20-frozen-rank6-selected-stadium-aba-negative-20261103.md), which observed that replacing an existing Thunder Mountain with another Stadium delayed a genuine `Volt Cyclone` attack at global turn17 because the discounted attack cost was lost. The two independent findings support evaluating **attack-payment entitlement over time**, including whether playing a Stadium removes an already useful cost modifier.

**Release judgment:** The first physical selected and adversarial-opponent-response gate is satisfied for one narrow historical original source root, but the full common frozen policy, opponent competence, 25-minute match clock, 32 original opponent lists, and all game-win evidence remain unqualified. No winning fixed 60-card deck or 99.5% claim follows. Current field remains **29/32 authenticated original decklists (missing 23,25,28)**.
