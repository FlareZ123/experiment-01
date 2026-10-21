# Pinned source-first Powerglass: typed Tool root and printed GX quota correction yield a native game completion

**Agent 30, 21 October 2026 UTC. Native historical development, zero competitive games.**

## Result and why it matters

In an **original frozen rank-11 Mega Absol ex/Garbodor vs candidate New Moon** matchup, applying a printed-GX attack-metadata alias in the research actor-policy layer and enabling its owner-visible Powerglass Tool root produced a **native legal complete result**: candidate B took six Prizes, source A had one remaining, **turn 50 / action 247**. The corresponding corrected-policy **Powerglass-OFF control** remained at the **260-action limit / turn 58**, with source A one Prize, candidate B six, **no candidate Perfection attacks**. The native source opponent made 14 settled attacks in the treatment; the candidate made six settled attacks, four via Mewtwo & Mew-GX's Perfection. No `LABEL_GX_USED` abort remained.

This is evidence for an **actual owner-decision path and one selected native game's outcome**. It does not prove strength against a competent opponent or across the Aichi Top 32.

## Fixed registration, environment and archived actual Store receipts

- [Native CI 39692765333](https://github.com/FlareZ123/experiment-01/actions/runs/39692765333), compiled pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Research checkout `5f44e3f03556a2b3ae5b8780b7fa3dc6c07d27c6`. [Paired raw JSON and source-ledger artifact 12390315077](https://github.com/FlareZ123/experiment-01/actions/runs/39692765333/artifacts/12390315077).
- [Source-first A/B preregistration](https://github.com/FlareZ123/experiment-01/blob/agent30-powerglass-sourcefirst-pair-20261021/results/aichi-2026/registrations/agent30-powerglass-sourcefirst-pair-20261021.md), and [printed GX alias rerun preregistration](https://github.com/FlareZ123/experiment-01/blob/agent30-powerglass-sourcefirst-pair-20261021/results/aichi-2026/registrations/agent30-mewtwo-printed-gx-alias-correction-20261021.md), both committed before the respective run.
- Fixed source-first rank-11 seed `482443328`, candidate seat B, exact published opponent and fixed candidate 60; original source first verified. **Both** A/B source-deal fingerprints `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31` match. The prior negative abort had stopped before printing the treatment fingerprint; this successful rerun resolves that missing data.
- The only policy difference **within this A/B pair** is `AGENT41_ACTOR_POWERGLASS_ROOT_DEV` OFF/ON. Both branches share the same semantic printed GX suffix correction, native opponent policy, prompt fallbacks, supporting energy/retreat and Perfection roots, physical source deal, and frozen decks. Source-first is **retrospectively selected** after source success, as logged in the original registration.
- Across the **earlier** pre-correction [native v2 rejection run 39691889301](https://github.com/FlareZ123/experiment-01/actions/runs/39691889301) and this corrected run, the common research actor root also changed: `attack.gxAttack===true || attack.name.endsWith('-GX')` is now treated as a GX attack, requiring `printedGxRoot===true` and an unspent public GX allowance. Pinned `mewtwo-and-mew-gx.ts` omitted `gxAttack: true` on printed Miraculous Duo-GX despite native quota enforcement. This left the earlier policy issuing an illegal attempted second GX. Vendor code remains unchanged. The correction was subjected to pure and pinned-native marker tests.

## Rank-11 New Moon physical sequence

| Actual action | Root or attack | Native receipt |
| --- | --- | --- |
| 198 / turn 42 | Control passes, treatment **plays Powerglass** on Active Mewtwo & Mew-GX | Paired actual root ledgers first diverge here; `equip-powerglass` intent count **1** and confirmed-public-effect **1** in treatment |
| 199+ / turn 42 | Tool has optional end-turn owner Basic-Energy attachment | Three actual owner `AttachEnergyPrompt` fallback occurrences across resumed play; attachment to Active observed by later board state, but separate per-prompt physical selection still warrants auditing |
| 209 / turn 44 | Candidate copies **Horror House-GX** from public Gengar & Mimikyu-GX | Native completed delegated attack; GX quota consumed, with next source turn observed in same game epoch |
| 220 / turn 46 | Candidate copies **Poltergeist**, opponent Active Oranguru V | Native completed delegated attack, source had **20 Trainers in hand**, computed 1,000 base damage; candidate Prize change **2**, to four remaining |
| 233 / turn 48 | Candidate copies **Poltergeist**, opponent Active Mega Absol ex | Native completed delegated attack, 20 revealed Trainers and 1,000 base damage, **3 Prizes** taken; candidate one remaining |
| 245 / turn 50 | Candidate copies **Poltergeist** against subsequent Mega Absol ex | Native completed attack, 21 revealed Trainers and 1,050 base damage, **final 1 Prize** taken and engine ended game |

The candidate's six attack declarations and **six settled** attacks were: two earlier printed Moon Press (turns 16, 18); copied Horror House-GX (turn 44); copied Poltergeist at turns 46, 48, 50. The last three copies had public per-attack Trainer counts and actual Prize changes. **All four copied attacks were settled.** The source opponent's own native attack settlement record reports **14 declarations and 14 settled**; the opponent is still a weak policy with generic fallbacks, not a strategically validated tournament player.

## Other pair cells and reproducibility boundaries

The other three frozen source-first cells, rank-6 champion-reference, rank-6 New Moon and rank-11 champion-reference, recorded **zero Powerglass root intents** and identical selected native *root-action-label ledgers* and terminal outcomes across OFF/ON, at action counts 93, 211, 89 respectively. Root labels alone do not prove exact board identity, because different physical target geometry can produce the same compact label (see the independent Agent50 Energy-route counterexample). They are a useful checksum, alongside native same-source fingerprints and matching outputs.

Full source-first paired artifact raw SHA256: control `c46991cdf66a7a508525380cb64e133ba51cc4ab2aa02108ad2f79ad2e165088`, treatment `ad7645c976439b658d3fc0e9d9ff37addb2759cbb2309c972e9d0b7d0c8040e3`. Treatment native actor audit recorded 69 selected/accepted roots, 0 rejected roots, 20 physically confirmed roots, **four** accepted owner `ChooseAttackPrompt` choices and **151** remaining native generic prompt fallbacks (74 on candidate seat B). Failure/censor branches were retained. Outcome statuses are **not** aggregated into a win-rate estimate.

## Limitations and next validity gates

- This is a **single retrospectively selected source-first deal**, with the original 60-card lists unchanged, but a source player lacking demonstrated competitive policy strength. The 20–21 Trainer-card hand producing 1,000+ Poltergeist damage is a specific exploitable native opponent behavior, not proof of typical human hand sizes or matchup frequency.
- The historical paper 25-minute tournament clock, all card interactions, full actor-only information set, and genuine opponent decision competence remain unaudited. The native `candidateAttackSettlement` explicitly reports **paperRuleAuditPassed=false, fullPolicyInformationSetAuditPassed=false, tournamentClockAuditPassed=false, qualifiedForCompetitiveInference=false**.
- Some energy attachments were selected by weak native prompt fallback; a prompt count alone is insufficient to prove individual physical choices. A dedicated owner-only Basic-energy `AttachEnergyPrompt` hook with source-validity and printed-card/target witness may improve attribution, but must be separately tested. The staged [Powerglass-after-Pass proof](../twinleaf/agent30-powerglass-pass-native-20261021.md) confirms the underlying mechanics.
- Paper Expanded full Aichi opponent field still has **29/32** exact published 60s. This fixture contributes **zero competitively qualified games**. It is no evidence of 99.5%, and should never be described as an all-field benchmark.
