# Same-deal original rank9 native owner VIP target: real Mega Absol and early Electrode, then nine dead Terminal Period attacks

**Agent 10 | 1 November 2026 | retrospective two-seat fixed-60 native tactical-policy comparison**

## Research question and held-constant source field

Previous [original rank9 source + both-seat ordinary evolution + VIP-before-first-attack mechanism](agent10-rank9-firstturn-vip-before-attack-20261101.md) used Agent9's generic native owner-deck selector to obtain two original Basics, **Toedscool PAR and Dedenne GX UNB**. Dedenne-GX's printed **Dedechange** triggers only when played **from hand** to Bench, so selection from the deck using Battle VIP Pass cannot trigger that Ability (card pool `cards/en/sm10.json`, UNB57; advanced manual Section E-06). Shun Ito's exact 60 contains only one Basic **Mega Absol ex MEG86** and **two Electrode-GX CES48**; the earlier [synthetic pinned ability recipient regression](agent7-rank9-electrode-mega-recipient-staged-pinned.md) showed Mega Absol is a valid non-GX/non-EX target for Electrode's Extra Energy Bomb, but no natural source 60 had assembled that line.

A new **default-off** owner-only VIP prompt decision [preferMegaAbsolVipRecipient](../../simulation/twinleaf/agent10-battle-vip-before-attack.cjs) is offered **only** when the *actor's own public Active* is Voltorb, two Bench spaces are free, and a **native authorized original owner-deck search** has both printed Toedscool and Mega Absol Basic cards. It returns the exact original card objects if the native prompt validator accepts the pair, otherwise retains Agent9's general target selector. No opposing hidden card is consulted. The same algorithm is available on both seats; it is not a source-seat cheat. The one-factor native flag `actorVipMegaAbsolTarget:true` is off by default, requires `actorVipBeforeAttack:true`, and the two unchanged candidate 60s and exact original rank9 source 60 remain frozen.

## Native execution and complete denominator

[Manual GitHub Actions run **41341131399**](https://github.com/FlareZ123/experiment-01/actions/runs/41341131399) **passed**, with four source opponent attempts, no engine errors, all four original native setup and settled physical-zone checks passing; archived artifact ZIP **13097401537**, sha256 `72665b6745d4e38c2f532712b5579b6aa25284d470324c170adc8bedd059c69d`, all rows and ledgers in `agent10-rank9-mega-absol-vip-native.json`. Reproducible [rank9 source driver](../../simulation/evaluation/agent10-rank9-mega-absol-vip-target-counterfactual.cjs), [source target tests](../../tests/agent10-mega-absol-vip-recipient.test.cjs), [same-seed factor test](../../tests/agent10-rank9-mega-absol-vip-target-counterfactual.test.cjs). Previous control frozen with same original precommitted seed groups and both unchanged 60s: [run 41340110972](https://github.com/FlareZ123/experiment-01/actions/runs/41340110972), artifact 13096763510.

| Registered native physical group | Previous general target | New owner Mega recipient target | Outcome before→after |
| --- | --- | --- | --- |
| A=3060075246 / champion reference | Toedscool + Dedenne GX | **Toedscool + Mega Absol ex** | candidate native terminal **165→149** roots |
| A=3060075246 / New Moon | Toedscool + Dedenne GX | **Toedscool + Mega Absol ex** | **260-root cap→260-root cap** |
| B=690229661 / champion reference | no eligible VIP Attack preemption | no change | same **103-root candidate terminal** |
| B=690229661 / New Moon | no eligible VIP Attack preemption | no change | same **260-root cap** |

**All four original full two-seat initial deal fingerprints remain exact matches** to the preceding control; the A source opening is **one distinct physical source deal repeated against two different candidate 60s**, not two independent source successes. Original source seat1 in A was physically second, source seat0 in B physically first.

On both A games, same original native first-own-turn ordinal17 played Battle VIP Pass, owner deck `ChooseCardsPrompt` ordinal18 selected the actual physical Toedscool and Mega Absol, original deck count **46→44**, Bench occupancy **0→2**, then native source Voltorb **Thunder Wave** at root21 in the same turn. Audits show **1 accepted Item, 1 accepted source search, 1 physically confirmed Bench search and 0 unresolved searches** in each A game; specialized source target branch count 1 per A game and 0 on B. No extra engine, illegitimate prompt or damaged source 60 evidenced.

## Newly unlocked real source line and still missing tactical competence

With the early original Mega Absol placement, **both A games** genuinely evolved original **Toedscool→Toedscruel on global turn4** and **Voltorb→Electrode-GX on global turn6**, each as an accepted native Store PlayCard root, versus **turn4 Toedscruel only** in the general-target treatment. The source also naturally promoted the actual Mega Absol and used its printed **Terminal Period**:

- A/champion: two source Terminal Period attacks at **global turns 22 and 24**, native attack ordinals **108 and 121**.
- A/New Moon: seven source Terminal Period declarations at **global turns 48, 50, 52, 54, 56, 58 and 60** (last declaration occurs near action cap).

**Terminal Period only Knocks Out when the opponent's Active has exactly six damage counters.** Every settled native Terminal Period declaration with retained before/after board evidence targeted a defender with **zero** damage counters and produced **no knockout or Prize movement**. Source Gengar/Mimikyu or Sableye paths did not substitute any higher-pressure attacker. **There were zero source Extra Energy Bomb Ability declarations in all four arms**, despite native Electrode entering play: its five-Energy discard requirement, self-KO Prize cost and target safety still need a physically witnessed owner decision. The source's normal attack-choice policy still selects the first payable printed Terminal Period without considering the public 60-damage-counter condition.

Crucially, **a pre-existing, separately pure-tested owner-only `knownDeadAttackRoot` option already handles exactly this Mega Absol defect** in [Agent1's selector](../../simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs): when publicly exposed defender damage is not 60 and the actor's second attack **Claw of Darkness** is cost-payable, choose the 200-damage alternative. No new duplicate selector is warranted. Our next planned one-factor same-deal replays turn on the existing **symmetric `bilateralKnownDeadAttackRoot:true`** on top of this source-recipient target policy, with all original physical fingerprints, paid Energy, genuine native KO/Prize movement, effect prompts, and failure/cap denominators checked.

The known-dead preference is conditional on **Claw of Darkness being payable**, and the particular prompted **opponent hand reveal and target card discard** remain a paper legality and hidden-information threat. An engine terminal due to generic bot mistakes cannot establish competitive performance, and even credible actor roots are not official tournament-clock results.

**Qualification:** 4 real native developmental original-source attempts, 0 independently paper-qualified wins, 0 field win estimates; 29/32 original Aichi published opposing 60s still authenticated (ranks23/25/28 missing). The 99.5% single fixed deck objective is unproven.
