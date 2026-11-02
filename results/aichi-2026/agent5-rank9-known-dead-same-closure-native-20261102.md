# Agent 5: original rank-9 Absol source policy, exact-deal and same-closure known-dead attack reversal

**2 November 2026 | genuine pinned Twinleaf Store | retrospective developer-only A/B | no competitively qualified games**

## Question and prior work

Agent 10 already implemented an opt-in, owner-visible Mega Absol ex attack selector in [the rank-9 known-dead counterfactual](../../simulation/evaluation/agent10-rank9-known-dead-attack-counterfactual.cjs). Its previous [original-rank-9 source comparison](agent10-rank9-mega-absol-early-vip-target-20261101.md) established that a live Mega Absol ex could repeatedly choose Terminal Period against an opponent's Active Pokémon with zero damage counters. Terminal Period's knockout condition requires exactly six damage counters, so those declarations could have no knockout effect. Agent 10's code instead prefers the payable printed Claw of Darkness when the opponent's face-up damage-counter state makes Terminal Period ineffective.

I executed this *existing* one-factor treatment and re-executed its prior control at the **same audited research-code dependency closure**. I independently compared the full native JSON, physical opening-deal identities, accepted root logs, source attacks and settled Prize changes. This is an execution and adversarial evidence audit of Agent 10's policy, rather than a newly authored card tactic.

## Immutable decks, source and policy factor

- Original opponent: **Aichi 2026 final rank 9, Shun Ito, Absol Electrode**, from authenticated [original printed 60](full-decklists.json). Source deck and both candidate decks remain unchanged.
- Candidates: [rank-1 champion-reference fixed 60](benchmark-shadow-rider.md) and [New Moon Lockbreaker v1 fixed 60](../als/new-moon-lockbreak-60-candidate.md). Each appears unchanged in one A-seat and one B-seat source seed group.
- Pinned vendor revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Original rank-9 MEE Darkness Energy uses the existing documented native printing-equivalence boundary.
- Previously preregistered rank-9 physical seed groups: candidate **seat A 3060075246**, candidate **seat B 690229661**; each group is replayed against the two different fixed candidate lists. Native first-turn ownership is observed, not assumed. For this retrospective study, these seeds were previously inspected and provide **no prospective performance sample**.
- Both modes enable identical `actorOnlyComposition`, ordinary evolution `actorNaturalEvolutionRoot:true`, first-turn native owner VIP `actorVipBeforeAttack:true`, and owner prompt `actorVipMegaAbsolTarget:true`. **Only the treatment** enables `bilateralKnownDeadAttackRoot:true` using Agent 1's existing owner-visible conditional printed-attack selector.
- Control runner: [Agent 10's VIP-recipient source policy](../../simulation/evaluation/agent10-rank9-mega-absol-vip-target-counterfactual.cjs). Treatment runner: [Agent 10's known-dead attack extension](../../simulation/evaluation/agent10-rank9-known-dead-attack-counterfactual.cjs).
- The two executions' independently recorded `sourceClosureSha256` values are **identical**: `ff1fa1ea851160b4da95676ea2cd081e8078118c7b54f9aed4c78378b930b012`. They ran on different Git heads, so this is an audited dependency-closure match rather than whole-repository byte identity. The original November 1 comparison had closure `03ed8de7955cb6de13ea2aa169c5aa2f493c1df5c9dd4303b68c3341ae880cb0`, which motivated the new contemporaneous control.

## Actually executed manual CI and immutable raw evidence

| Branch | Successful existing manual CI | Executed research head | Archived artifact | ZIP SHA256 | Raw JSON SHA256 |
| --- | --- | --- | --- | --- | --- |
| Known-dead attack ON | [41399309154](https://github.com/FlareZ123/experiment-01/actions/runs/41399309154) | `6537328a4b91f14ddcbf3be50e2c85f24a4946f5` | [13120134600](https://github.com/FlareZ123/experiment-01/actions/runs/41399309154/artifacts/13120134600) | `b860d1e24ad63ad4bdb8a550ca792419d1b04b9d6354eeacae30ae7d751fbea5` | `03dff6b9712e6d50c89add9a59b70f8820d4dbbb382a2c2d62f03954583dacfa` |
| Same-closure control OFF | [41400104410](https://github.com/FlareZ123/experiment-01/actions/runs/41400104410) | `485f0a43995b67b4f64d7d2a4de9e68ba325c4cb` | [13120433511](https://github.com/FlareZ123/experiment-01/actions/runs/41400104410/artifacts/13120433511) | `5db10e7e747809a1169eae5daf5d2ba9813738ef8bfa57be599e94f8008d0cc3` | `b5e1367985daf93b776674dc228a2845a516b5c1fa8285c595579e4086675f11` |
| Historical prior control (not causal closure) | [41341131399](https://github.com/FlareZ123/experiment-01/actions/runs/41341131399) | `73b1904a39e0960063b2dbf1a609099368e32595` | [13097401537](https://github.com/FlareZ123/experiment-01/actions/runs/41341131399/artifacts/13097401537) | `72665b6745d4e38c2f532712b5579b6aa25284d470324c170adc8bedd059c69d` | `67f72b7b9ad84bc954c30303692e9da6c1bc752e6e9d9f654c13ac205911d8cd` |

Each new successful manual workflow retained **all four actual original-Store attempts** (8 total), including a cap. Both modes' runs passed their native workflows; every trial has a verified original source and full two-player physical initial-deal fingerprint matching its same-trial counterpart. The historical control and same-closure control also have **exactly identical accepted root-action digests** on all four trials.

## Failure-inclusive four original-source comparisons

Prizes are ordered by the real **physical seats [A, B]**, with source on B for candidate A and source on A for candidate B. `engine-terminal` is deliberately **not** a competitively qualified win.

| Authenticated original source / fixed candidate | Same-deal control OFF | Treatment ON | Accepted original-source attacks and status |
| --- | --- | --- | --- |
| Rank 9 vs champion reference; candidate A, source B | 149 roots, native candidate terminal, Prizes [0,6] | **Identical** 149-root terminal and digest | Both: 2 Thunder Wave + 2 Terminal Period |
| Rank 9 vs New Moon; candidate A, source B | **260-root cap**, [4,6] | **248-root source terminal**, [4,0] | Control: 2 Thunder Wave + 7 ineffective Terminal Period. Treatment: 2 Thunder Wave + **5 Claw of Darkness** |
| Rank 9 vs champion reference; candidate B, source A | 103 roots, native candidate terminal, [6,3] | **Identical** 103-root terminal and digest | Both: 4 Lode Search |
| Rank 9 vs New Moon; candidate B, source A | 260-root cap, [5,4] | **Identical** 260-root cap and digest | Both: 14 Lode Search + 9 Hidden Power |

Three of the four treatment/control **complete Store root-action ledger digests match**. Only the A/New Moon row changes. That is a real one-factor source-policy sensitivity for the *fixed* decks on an originally frozen physical setup, with no exposure-selected trial excluded from the table. It does not show how the policy affects the field on fresh random games.

## Native late-turn Claw settlement and opponent continuation

In changed A/New Moon, the source first executed Claw of Darkness at global turn **48**, already far outside realistic 25-minute Aichi match pacing. Source's native Mega Absol ex was supplied by **two Prism Energy and one Telepathic Psychic Energy**, funding the printed Darkness, Darkness and Colorless attack cost under native available type units. The source's five native accepted `AttackAction` roots and `sourceAttackSettlement` before/after public Prize receipts agree:

| Global turn | Store root ordinal | Actual source remaining Prizes before -> after | Observed effect |
| --- | --- | --- | --- |
| 48 | 203 | 6 -> 5 | First Prize taken, Klefki KO |
| 50 | 215 | 5 -> 2 | 3-Prize Trevenant & Dusknoir-GX KO |
| 52 | 226 | 2 -> 1 | Lunatone KO |
| 54 | 237 | 1 -> 1 | 200-damage attack, no KO |
| 56 | 245 | 1 -> 0 | Knockout of previously damaged Mewtwo & Mew-GX, native terminal |

All five source attack settlements explicitly report `settledPromptChain:true`. The native owner prompt resolved the chosen original opponent-hand discard target during each attack. Observed five discarded card identities in order are Telepathic Psychic Energy, Rescue Carrier, Battle VIP Pass, Forest Seal Stone and Battle VIP Pass. These are genuine source-engine prompt and physical-effect receipts, **not** independent certificates of concealed-hand randomness, paper prompt semantics or fair selection. This source example establishes a relevant late attack policy branch, while the original opponent's offensive play remained missing until after dozens of turns.

## Previously hidden source-policy and candidate-policy co-failure: 19 Joust turns

The same genuine native Store receipts reveal the *mechanism creating the late Mega Absol attack opportunity*. The New Moon candidate's `Klefki SVI 96` has **Joust for 10 printed damage**; original rank-9 source's `Electrode-GX CES 48` has **190 HP**. In the changed source-seat-B game:

- The candidate attack-settlement ledger shows **19 consecutive Klefki Joust declarations**, on odd global turns **11, 13, ..., 47**, always into the source Active Electrode-GX.
- The source actor on even turns **6, 8, ..., 46** returned **21 explicit PassTurnAction roots**. No Extra Energy Bomb Ability was declared. Source passive snapshots showed the early Active Electrode-GX with a single Prism Energy, while its viable Mega Absol ex was on the Bench.
- Actual public attack-state evidence: source Electrode started turn 11 at **0 damage**, was at **140** before turn39, **170** before turn45, **180** before turn47. Turn47's nineteenth Joust added the last 10 damage and **finally Knocked Out Electrode-GX**, awarding the candidate **two Prize cards** (candidate prizes 6 -> 4). Mega Absol ex, with Telepathic Psychic Energy + two Prism Energy already attached, was then promoted and began five Claw attacks on even turns 48–56.
- This is a **mutual strategic stall**, with the candidate's repeated 10-damage attacker allowing the opposing setup to mature over dozens of turns. It is an exceptionally poor substitute for competent aggressive opponent response or a tournament-clock model, irrespective of the source actor's later successful decision branch. The source actor also appears unable to convert its early Stage-1 Electrode board into attacks, Energy Bomb or tempo.

This is a **decisive admission veto** for treating the 248-root source terminal as evidence of rank-9 real-world strength. It strengthens the narrower causal claim that the alternative late attack is actually playable and consequential under the tested toy decision policies, while explaining why the real-world interpretation is severely constrained. The exact 21 source passes and 19 candidate Joust declarations are computable directly from the preserved original Store `rootActionLedger`; KO and damage progression are independently visible in `candidateAttackSettlement.attacks`. The 19 attacks are **one serial game**, not 19 independent opponent trials.

## Admission boundaries and scientific conclusion

1. The attack-choice correction is **consequential**: it changes one genuine native source game from a 260-root censor to a 248-root source engine terminal, while the other three fixed-deck games and same-physical-deal accepted root logs are unchanged. This directly cautions against accepting earlier New Moon engine-terminal or capped comparisons with an incompetent original Absol/Electrode opponent as reliable competitive results.
2. All **eight** contemporaneous native attempts remain developer-only. The original rank-9 owner policy still lacks authenticated early characteristic Extra Energy Bomb activation, strategic source competence, independent paper-effect and opponent-hand prompt/randomness audit, hidden-information safety, and 25-minute match-clock adjudication. Five Claw roots starting on global turn 48 are especially weak evidence of real-world opponent pressure.
3. Source rank 9 is only **one of 29 authenticated exact original lists** and the 32-rank target includes missing original lists **23, 25 and 28**. Nothing here selects, upgrades, or validates one strongest fixed 60. **Zero competitively qualified games, zero estimated full-field win rate and no demonstrated 99.5% target.**

## Reproduction

Reuse the existing manually dispatched workflow `.github/workflows/aichi-source-locked-campaign.yml` with `agent41_crossrank_trial=true` and `trial_ids=agent10-rank9-claw-known-dead` for treatment; use `trial_ids=agent10-rank9-mega-absol-vip-target` for control. Record both output JSONs, their actual reported `sourceClosureSha256`, each `trial.id`, `sourceDealFingerprint`, `fullPhysicalDealFingerprint`, `rootActionLedgerSha256`, native status and source `AttackAction` identities. Join **only rows with equal authenticated physical setup fingerprints**. Consult `sourceAttackSettlement.attacks` for settled Prize and opponent-turn detail. Both GitHub Action runs above and immutable artifact digests make the actual observation reproducible without launching additional CI.
