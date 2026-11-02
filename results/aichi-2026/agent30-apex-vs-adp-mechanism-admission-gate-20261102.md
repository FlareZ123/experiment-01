# Comparative structural gate: Apex Alchemy versus ADP → Thorton → Regidrago v2

**Agent 30 | 2 November 2026 | independent paper-mechanism screening | no head-to-head native games or qualified matchup results.** Response to [Critic's request for one shared hard-candidate falsification gate](../../communications/broadcast/20261102T2318Z_critic_structural_candidates_to_common_falsification_gate.md).

## Exact immutable candidates under comparison

| Candidate | Mechanism | Exact printed-60 artifact | Canonical fixed identity |
| --- | --- | --- | --- |
| **Agent43 Apex Alchemy v0** | Regidrago VSTAR / Benched Alolan Muk via early Boost Shake | [Agent43 v0](agent43-apex-alchemy-paper-expanded-v0.json), [paper report](agent43-apex-alchemy-structural-candidate-20261102.md) | `21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769` |
| **Agent5 ADP → Thorton → Regidrago v2** | First-own-turn going-second enhanced Altered Creation-GX, one-turn-later Thorton into Regidrago V, evolve VSTAR and copy Wild Blaze | [Agent5 v2](candidates/agent5-adp-thorton-regidrago-60-v2.json), [paper report](agent5-adp-thorton-regidrago-structural-fifth-candidate-20261102.md) | `bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b` |

Both are *complete* unranked fixed-60 print inventories with distinct mechanisms; neither has a competitively qualified game. No selected winner, and neither artifact should be modified inside a comparison. Agent2 Shake4/Quick2 is a separately hash-frozen sensitivity variant, not this v0.

## Shared YES / NO / UNKNOWN paper-cost gate

**YES** means the relevant printed rule makes the action possible if its stated conditions hold. **NO** is a source-card/rule contradiction. **UNKNOWN** means no natural played trace with a qualified source opponent and adequate decisions has resolved it.

| Prerequisite and state | Apex v0 | ADP/Thorton v2 | Deciding evidence or failure |
| --- | --- | --- | --- |
| Printed 60, ID/count integrity, currently flagged English Expanded | **YES** source inventories independently tested | **YES** source inventories independently tested | Full Japanese event/errata identity remains **UNKNOWN** for both |
| First own turn *going first* triggers distinctive mechanism | **YES**, Boost Shake first-turn Muk if Grimer/Shake and live Items, **but turn ends** | **NO**, ordinary first-player first-turn attack ban prevents Altered Creation-GX | Basic turn rule; alternate ADP T2 offense is possible but misses defining first-turn GX |
| First own turn *going second* enables defining move | **YES**, Shake Muk possible, **NO** same-turn Budew attack after Shake | **YES**, an enhanced Altered Creation-GX can be attempted if ADP is Active, attached DDE alive and legal Energy colors apply | Boost Shake `Your turn ends`; ADP T1 requires attacker Active, one DDE, source conditions |
| Prize prerequisite | **YES** mechanism exists if Muk outside Prizes, and Regidrago engine resources survive | **YES** if ADP, Regidrago V/VSTAR, DDE, Thorton, Wild Blaze survive | Six Prize cards cannot be handwaved. Exact source enumerations have incompatible scopes |
| Physical initial Active | **UNKNOWN** under natural play (Muk on Bench only when a non-Grimer Basic can start) | **UNKNOWN** under natural play (ADP must be Active for T1 GX) | Agent43 direct alternate-starter setup conditional **6.29698142%** among Basic-valid opens. Agent5 ADP held conditional **36.85746%** among valid opens; held does not prove active and ready |
| Discard, Energy and one-Supporter payment | **UNKNOWN** under actual source hands; Boost Shake is Item and Mysterious Treasure/Quick Ball cost discards | **UNKNOWN** under actual source hands; Guzma & Hala may need two discarded, Ultra Ball two, then T2 Thorton consumes Supporter, DDE/color must survive | One connection can exclude another. Neither abstract graph nor printed access implies payment |
| Own Basic Abilities after Muk | **NO**; Muk suppresses friendly Lele/Latias once active | **YES** while not separately blocked by opposing source | Apex can order pre-Muk Lele usage only if source does not already deny it |
| Ability lock from original source | **UNKNOWN**; Stage1 Muk survives a simple Iron Thorns Basic Rule Box-only predicate, but Garbotoxin may suppress it | **UNKNOWN**; both ADP and Regidrago are Rule Box, so opposing Iron Thorns disables Lele/Crobat support (DDE/attacks remain separate) | Must check priority and official counter-rulings in the current native state |
| A complete attacker, paid attack and source continuation | **UNKNOWN** | **UNKNOWN** | This is the actual comparative-admission bottleneck; existing paper tests are insufficient |
| Qualified game-win rate / four existing deck controls | **UNKNOWN**, zero qualified games | **UNKNOWN**, zero qualified games | A native terminal, a setup opportunity, and a match win have incompatible evidence status |

## Two prespecified original-source adversarial roots

### R6 Iron Thorns ex-only: contrasting forms of failure

**Identical authentic opponent:** original rank6 fixed printed 60, four Iron Thorns ex, four Plumeria, two Team Flare Grunt, two Enhanced Hammer; see the repository's [source manifest](full-decklists.json). Opponent is genuinely played from its owner-visible hand and its legal printed Energy/Supporter/Item costs; no programmed hand/card arrivals.

- **Apex distinguishing claim** is that a **Bench Alolan Muk**, searched by a genuine first-turn Shake and allowed to persist, removes the source's Basic `Initialization` Ability while Regidrago can still establish Attack cost. The cheap exact audit [already independently measured](../statistics/agent30-apex-alchemy-direct-turn2-lock-attack-20261102.md) only **0.1250266578%** of Basic-valid openings for a *strict direct one-Item, paid Dragon-payload discard plus ready GGF VSTAR on T2*; that is a narrow positive path and cannot be used as an upper bound on draw/supporter/search alternatives. A precommitted mechanistic veto is a real source-policy state where owner-selected, paid first-turn Muk exists, yet the opponent's relevant Basic Ability is *still actually live* (wrong lock order/suppression) or the source responds by legal Energy/Active denial before the next attack. Evaluate these separately: a Muk-only ability failure rejects the claimed Ability interaction; Energy denial only rejects an overbroad **two-turn offense** consequence.
- **ADP distinguishing claim** is the **going-second first-person-turn enhanced Altered Creation-GX** before a T2 Thorton + VSTAR + Wild Blaze copied attack, with +30 attack damage and one extra Prize on damage KOs. One Combo-critical DDE can be removed by rank6's actual Plumeria/Flare Grunt/Hammer on the source's responding turn. The defining **T2 funded attack** requires a legal replacement that one ordinary Basic attachment often cannot supply; T2 Thorton also excludes a different Supporter that turn. A precommitted mechanistic veto is an *actually selected paid source* DDE removal on the turn between T1 GX and T2 attempted Apex, with no legal T2 double-color replacement after full owner-visible action generation. This is a reproducible failed defining chain, without proving the rest of the deck cannot win via fallback.

**Both first-player orders** must be attempted; ADP's first-turn GX claim is inherently going-second-only. Raw first-eight setup successes under one starting choice cannot rank general play strength.

### R8 Absol Garbodor: shared Special Energy chokepoint

The authenticated rank8 source has **two Temple of Sinnoh**, Garbotoxin Tool interactions, and competitive speed. Temple removes Double Dragon Energy's useful double colored production while active, invalidating **both** candidates' GGF Regidrago attack via one DDE plus one basic. ADP v2 has **two Field Blower** and Apex v0 **one**; these are meaningfully different registered slots. Both have replacement Stadiums (ADP Viridian Forest two, Apex Giant Hearth two). A paper source-played Temple must be answered by an *actually held and playable* Field Blower or replacement Stadium before the attack, and source can replace it again; a theoretical answer path is insufficient. Garbotoxin also attacks Apex's Muk/Legacy Star while depriving ADP of supporting Abilities.

**Prespecified source discriminant:** In both seated natural games from the same exact rank8 original 60, record the first Temple that made the owner’s required Energy illegal, and separately whether the actual registered candidate can legally remove Temple before its next desired attack. Distinguish actual held Field Blower/viridian/Hearth from a card in the deck reachable only through an already consumed Supporter or a blocked Item. Show the opponent's next selected Stadium/Tool continuation, or mark policy-incompetent if omitted.

## Cheap decision before expensive qualification

1. **Free mechanical admission**: accept both as fixed-60 structural ideas, with printed legality caveat; source-game paper payoff remains **UNKNOWN**.
2. **Early NO labels**: ADP first-turn enhanced GX when going first; Apex combining first-turn Boost Shake and Budew's Itchy Pollen attack; any DDE supplying two colored Energy under unsuppressed Temple of Sinnoh; any Tapu Lele Wonder Tag attempted after own Muk already removed Basic Abilities. These are counterexamples to *specific claimed lines*, rather than grounds to discard the whole sixty.
3. **High-information distinct probes**: rank6 *Muk suppresses Initialization and attacker survives* versus *ADP enhanced GX + T2 energy continuity despite genuine Plumeria*; rank8 *answer Temple/Garbotoxin with paid cards*. Include the original rank1 Mimikyu → Regidrago copied Apex Dragon → Dialga-GX extra-turn counter-ALS and rank2 Item/Supporter lock after a pilot proves its own defining source mechanism.
4. **Escalate only after concrete traces**: candidate exact SHA, source SHA/rank/printing, full physical hand + Prize fingerprints, both first-player orders and both seats, manually paid discard/attachment/Suporter, owner information restrictions, attack effects/Prizes, adversarial source's first meaningful response, no action cap. Zero qualified games currently; no basis to elect one strongest 60 from these proposals.

**Decision: BOTH REMAIN UNKNOWN FOR PROMOTION.** This compact cross-candidate audit contributes new source-specific falsifiers and exposes unequal opening denominator/time windows; it does not assert one is stronger. The 99.5% collective target remains unproven against the still-incomplete 29/32 authenticated original Top 32 field.
