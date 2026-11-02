# Agent 6: identical-start Tool Jammer held-versus-played native counterfactual

**2 November 2026 | Eight preregistered, mechanically staged pinned-Store arms | zero qualified competitive games**

## Question and exact field relevance

When an opposing **Iron Thorns ex TWM77** holds **Tool Jammer BST136**, does actually attaching it before ending the turn cut off an otherwise executable **Latias ex SSP76 → Lillie's Clefairy ex JTG56** mobility-and-attack chain? The authenticated original [rank-30 list](full-decklists.json) contains exactly **one Latias ex SSP76 and one Float Stone BKT137**, plus **three Lillie's Clefairy ex JTG56**. Authenticated original ranks **6, 24, and 29** are Iron Thorns ex lists, each with one Tool Jammer BST136. Printed rank-30 60 identity: `8423dac2d79c86a3385e31008a8e9ac79c07840197b4e54e6ff7000a1ff67039`, from [original-list admission](original-printed60-admission-v1.json).

The **Float Stone** pair uses printings that co-occur in these original source lists. A separate **Stealthy Hood UNB186** pair exercises the different Ability-protection mechanism. **Stealthy Hood is not included in rank 30's original printed 60**, so its result is solely a paper-mechanics positive control.

## Prospective design

The [eight-arm registration](registrations/agent6-thorns-float-hood-jammer-hold-play-eight-20261102.json) was committed **before** the fresh native run. The code change is [commit `371f8b3`](https://github.com/FlareZ123/experiment-01/commit/371f8b32dc76162d11d4d4a58622e47fd2d16477), the registration is [commit `43658bd`](https://github.com/FlareZ123/experiment-01/commit/43658bd6c846c2b3788c16f19c8f8e108e65b6f3). The native command runs `AGENT6_PAIRED_JAMMER_TURN_DEV=true` in the [isolated pinned Store probe](../../simulation/twinleaf/agent6-skyliner-public-suppression-native.cjs), using the existing **manual-only** [rank-30 workflow](../../.github/workflows/agent7-rank30-source-psychic-staging.yml). This feature is **default off** and not a selected bilateral competitive policy.

Each source physical seat 0 and 1 has two matched starting-state pairs: **Float Stone held vs played** and **Stealthy Hood held vs played**, giving eight staged arms. Both branches begin with the same physical public board and opponent Tool Jammer card **in the opponent's hand**, source owner Active Latias ex, funded Benched Clefairy, opponent Active Iron Thorns with 20 pre-existing damage, a funded opponent Bench Pidgey, six synthetic Prizes and synthetic decks. The original opening shuffle, Prize allocation and legal natural opponent decision distribution are not sampled. The opponent starts a prepared turn 4. The *only controlled difference within each pair* is whether the opponent genuinely plays Tool Jammer to its Active Pokémon before passing.

The opponent holding Tool Jammer makes an actual `PassTurnAction` and retains the Tool in hand; treatment actually issues `PlayCardAction`, moves the **same physical card reference** from hand to the opponent Active Tool slot, then issues `PassTurnAction`. Both modes settle native WaitPrompts, reaching source owner turn 5 with no pending prompt. The source next attempts genuine `RetreatAction`, followed where possible by native `Full Moon Rondo`; attack, KO, two Prize choices, promoted opponent Pidgey and opposing `Tackle` each resolve through Store actions and prompts. The scoped, reversible [ToolEffect paper-fidelity hook](../../simulation/twinleaf/agent6-tool-jammer-tool-effect-guard.cjs) is enabled explicitly. No upstream Twinleaf files change.

## Recovered actual native evidence

[Compiled manually dispatched CI 41547527770](https://github.com/FlareZ123/experiment-01/actions/runs/41547527770) used exact head **`43658bd6c846c2b3788c16f19c8f8e108e65b6f3`**, pinned vendor **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. The [eight-arm JSON artifact 13189845797](https://github.com/FlareZ123/experiment-01/actions/runs/41547527770/artifacts/13189845797) was independently downloaded and decoded: ZIP SHA-256 `bdc5f7894d3b71676e0763fcb372a8536b9f30ce12bc9e272a17b2adc04993c5`, raw JSON SHA-256 `47f5349becb11d8fdbdaa024a0c38c8b2a030c1652aa69f6db3c830ee06f73b9`. **All eight staged rows passed every recorded native/paper fixture check: `failedChecks=0`.** Every one of the four within-tool-and-seat pairs has the exact same pre-action physical-root SHA-256 in the two arms, as stored in `rootFingerprints`.

| Attached owner Tool | Owner seat | Opponent action | Source Latias retreat cost | Native owner retreat / settled attack | Source Prize slots remaining | Native opposing reply |
| --- | ---: | --- | ---: | --- | ---: | --- |
| Float Stone BKT | 0 | Hold Jammer, Pass | 0 | Retreat → Clefairy, Full Moon Rondo KO | 4 | Promoted Pidgey Tackle accepted, 20 damage |
| Float Stone BKT | 0 | Play Jammer, Pass | 2 | Unfunded retreat rejected; no attack | 6 | Not reached |
| Float Stone BKT | 1 | Hold Jammer, Pass | 0 | Retreat → Clefairy, Full Moon Rondo KO | 4 | Promoted Pidgey Tackle accepted, 20 damage |
| Float Stone BKT | 1 | Play Jammer, Pass | 2 | Unfunded retreat rejected; no attack | 6 | Not reached |
| Stealthy Hood UNB | 0 | Hold Jammer, Pass | 0 | Retreat → Clefairy, Full Moon Rondo KO | 4 | Promoted Pidgey Tackle accepted, 20 damage |
| Stealthy Hood UNB | 0 | Play Jammer, Pass | 2 | Unfunded retreat rejected; no attack | 6 | Not reached |
| Stealthy Hood UNB | 1 | Hold Jammer, Pass | 0 | Retreat → Clefairy, Full Moon Rondo KO | 4 | Promoted Pidgey Tackle accepted, 20 damage |
| Stealthy Hood UNB | 1 | Play Jammer, Pass | 2 | Unfunded retreat rejected; no attack | 6 | Not reached |

All eight arms also attest the actual end-of-turn transition **turn 4 → turn 5**, switching active player from the opponent's physical seat back to the owner's, with no unresolved prompts. In the four hold controls, the Tool stays in its owner's hand; in the four treatment arms, its physical reference leaves hand and attaches to the active opponent Iron Thorns. In all four held controls, the attacking Clefairy took two synthetic Prizes (six occupied Prize slots to four), and the KO'd Iron Thorns entered its owner's discard. The subsequently promoted Pidgey attacked on turn 6. The four played-Jammer treatments did not reach that opponent reply because the owner could not execute the staged retreat/attack.

**Workflow conclusion is `failure` for a separate reason.** The existing intentionally **unpatched** default Store audit reproduced the previously documented **eight Float Stone/Tool Jammer paper mismatches** (four offending rows, two failed checks each), returning nonzero. The specifically opt-in matched eight-arm command completed and uploaded the zero-failure artifact. Treating the full job's failure as eight failed gameplay arms, or treating green target arms as a corrected upstream default, would both be reporting errors.

## Practical inference and gate

This is a causal *staged mechanics* witness: playing a reachable singleton Tool Jammer can flip a precise Float Stone-assisted prize-taking line from locally executable to blocked, and that effect persists across a real turn boundary. It is relevant to original ranks 6/24/29 versus 30 **only if the real play, exact board and resource windows arise**. Neither the actual 60-card openings nor characteristic source opponent policies were exercised; this staged opponent Pass and Pidgey reply does not establish competent competitive opposition. The Stealthy Hood arm cannot be generalized to rank 30's printed list. The artificial 20-damage starting condition, pre-funded Pidgey/Clefairy and identical synthetic Prizes all materially limit generalization.

**Next decision gate:** in a **frozen, symmetric two-seat shared policy**, prospectively find naturally dealt original rank-30 versus original 6/24/29 situations with owner-visible legal Tool decisions; compare actual Jammer access versus competing Tool/Supporter uses, paper payment, owner Field Blower response, funded attacker line and opponent continuation. The source rank30 includes **three Field Blower GRI125**, which could reverse the local lock when legally reachable. Preserve non-encounters and original source-deal fingerprints. No candidate was compared here. **29/32 authenticated original sixties, zero competitively qualified games, no selected final 60, and no demonstrated 99.5% field win rate.**
