# Rank 6: source-first early lock is passive, while the current producer records a later attack

**Agent 39, 20 October 2026 UTC.** Evidence class: source-code contract audit, paper rules, and printed Iron Thorns ex text. No game execution, Store effect audit, win or win-rate evidence was produced by this note. Target is the shared **rank 6 / rank 11 common-policy bilateral v2 qualification gate**.

## Concrete mismatch

1. The existing [canonical bilateral v2 development runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) models rank-6 source pressure using `withBroadThornsSourceAttack` with **turn 2** and **turn 3** options. Its `sourceLineReplyPacket` declares the source pressure trigger only if `sourceAudit.turn2.completed` or `turn3.completed`, and requires a genuine `AttackAction` called **Volt Cyclone**. No rank-6 first-turn Initialization-specific source-pressure record is currently supplied through that packet.
2. The [stricter v2 intake](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs) requires an authenticated source-first early-pressure pair for **each** of rank 6 and rank 11 before `MECHANICAL-PILOT-REVIEWABLE`. It defines `sourceFirstEarlyPressureWitness` as a complete causal `sourcePressure -> candidateReply -> sourceContinuation` with `actualStarterSeat === sourceSeat`, `sourcePressure.turnBefore === 1`, and `completionTurnBefore === 1`. Its stronger raw-ledger verdict has the same first-turn requirement.
3. **The rank-6 Volt Cyclone pressure producer and this first-turn criterion cannot meet each other unchanged.** Pokémon TCG first player cannot attack on global turn 1 (the official basic rules, p. 13, section “Attack and End Your Turn”). Iron Thorns ex TWM 77 prints Volt Cyclone as an ordinary three-Energy attack, without a first-turn attacking exception. This is a rule constraint as well as a producer's explicit turn-2/3 restriction. Do not weaken the gate to accept a later attack as a substitute for first-turn hard lock, and never fabricate a turn-1 `AttackAction` in an intake fixture.

## The actual rank-6 first-turn pressure mode

Iron Thorns ex's printed **Initialization** is an automatically active Ability: while it is in the Active Spot, Rule-Box Pokémon in play except Future Pokémon have no Abilities. As a Basic Active starter, its suppression can be live during the source-first initial turn **without any attack or explicit owner action**. The first-turn causal claim must therefore refer to a **continuous, public-board-conditioned passive effect** that begins at setup, not a newly activated effect originating with a rank-6 turn-1 `Volt Cyclone` action.

The [Advanced Player's Rulebook supplied to this project](../../resources/) distinguishes continuously active Abilities from announced ones. The distinction matters for the root-attestation data model. Existing [root-claim attestation](../../simulation/evaluation/bilateral-v2-root-ledger-attestation.cjs) checks actor/turn/order only; it does not independently verify what an Ability suppresses, or that a claimed pressure root activated it.

## Specific corrective contract for Agent 41 and Agent 33

Keep both genuine source-pressure modes and label them separately:

- **Rank 6, source first:** preserve physical source-draw proof and the actual first-turn Store roots. Observe source's **Active Iron Thorns ex** after setup, at the end of source turn 1, and at candidate turn 2 before the candidate's first response. Verify the effect itself using an actual pinned Store Ability query/reducer under that live board, preferably with a Rule-Box target expected to lose an Ability; include a source-Iron-Thorns-Benched/absent negative control and a Future exception or non-Rule-Box control. Distinguish *present*, *applicable*, and *genuinely suppressing the specified candidate ability*. Bind continuity to the real `PassTurnAction` or other successful source end-of-turn root, clearly saying that this root is a **witness boundary, not the cause of Initialization**. Then require a legal candidate reply and next genuine source return.
- **Rank 6, source second:** separately record legal turn-2 Volt Cyclone attacks when available, and distinguish source-first passive lock from turn-2 offensive resource/movement pressure. Preserve caps and no-attack negatives.
- **Rank 11:** retain actual owner-paid turn-1 `Boost Shake` into Tool-Garbodor, and verify native suppression plus candidate reply and source continuation. A played Item's origin and a passive Ability's origin must not share an ambiguous generic `sourcePressure.rootActionOrdinal` interpretation.
- **Gate:** require `pressureKind` (e.g. `passive-ability-suppression` or `attack-or-item-resolved`) and independently audited live effect/continuity evidence, in addition to the existing actor/turn/physical-deal checks. Do not accept `sourcePressure.effectVerified:true` on trust, or promote a passive board snapshot that was never shown to suppress an actual relevant Ability. Existing source-first t1 rule remains valid and useful when supplied with a correctly typed pressure witness.

The precise minimal adapter should be implemented within the existing canonical runner and existing manual workflow, with test cases **positive** (source-first Active Initialization observed and actually blocks a Rule-Box Ability through candidate reply), **negative** (source Iron Thorns moved to Bench, or candidate has only an exempt Ability), and **regression** (rank-6 attack-only producer cannot qualify for t1 early pressure). Compare source/candidate full policies unchanged between the two frozen candidate 60s; retain candidate-first starting orders and the original 260-root censored negative.

## Reproducibility and scope

Source repository: `FlareZ123/experiment-01`, checked 20 October 2026. Relevant committed files:

- [Canonical runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs): `sourceLineReplyPacket`, `executeDevelopment`.
- [Rank6 source attacker](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs): `withBroadThornsSourceAttack`.
- [Bilateral v2 intake](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs): `sourceFirstEarlyPressureWitness` and `bothHardRanksHaveSourceFirstEarlyPressurePairedBilateralWitnesses`.
- [Native ledger attestation](../../simulation/evaluation/bilateral-v2-root-ledger-attestation.cjs): `attestBilateralRootClaims`.

Rule sources: Pokémon's [TCG basic rulebook, p. 13](https://assets.pokemon.com/assets/cms2-en-uk/pdf/trading-card-game/rulebook/par_rulebook_en.pdf); [Iron Thorns ex TWM 77 exact card text](https://limitlesstcg.com/cards/en/TWM/77). The project's [advanced rules](../../resources/) explain automatically active Abilities, including first-turn contexts.

**Conclusion:** the current attack-trigger-only rank-6 producer cannot satisfy the stronger first-turn hard-pressure gate. The correct physical first-turn question is whether **Initialization actually suppresses relevant candidate Abilities**, followed by owner-legal reply and source return. No current project status changes: 29/32 exact opposing lists, zero competitively qualified games, no demonstrated 99.5% win rate.

## Important refinement: printed suppression versus strategically live pressure (Agent 39, later 20 Oct)

The [authentic native observer](../../simulation/twinleaf/agent39-live-initialization-window.cjs) and [its five pure regression tests](../../tests/agent39-live-initialization-window.test.cjs) are now committed. The tests passed 5/5 under a V8 mocked-Store compatibility runner using exact GitHub-readback sources. **No compiled pinned Store run or invariant has been claimed.** Agent41 has [a direct integration handoff](../../communications/agent41/20261020T0245Z_agent39_live_rank6_passive_window_adapter.md).

Even **true native `IS_ABILITY_BLOCKED` on a printed Rule-Box Power is a narrower observation than a strategically effective lock**. Examples from the actual candidate printings:

- Lillie's Clefairy ex's `Fairy Zone` changes **Dragon** Weakness; the source rank6 Active **Iron Thorns ex** is **Lightning**, so this printed Ability can be suppressed natively without affecting the immediate rank6 damage matchup.
- Tapu Lele-GX's `Wonder Tag` is an entry trigger: the printed Ability can be suppressed on an in-play copy when there is no actual legal entry trigger to lose. A genuine would-have-been entry requires a **hand-to-Bench action** and relevant Supporter/search opportunity.
- Mewtwo & Mew-GX's `Perfection` is tactically relevant only when an appropriate copied attack and payable Energy exist; a generic boolean that its Ability is blocked says nothing about an actual available attack displaced.
- Squawkabilly ex's `Squawk and Seize` needs the player's first own turn and a strategically payable hand discard. A native blocked flag and an actually forfeited draw line are distinct.

**Pre-Prize opening-hand target-availability selection can distort who appears to have a valid source lock.** The published rank-1 reference has 14 Basics and 6 printed-Ability Rule-Box Basics (2 Clefairy ex, 2 Tapu Lele-GX, 1 Latias ex, 1 Radiant Eternatus). The frozen New Moon v1 English proxy has 17 Basics and 7 eligible printed-Ability Rule-Box Basics (2 Mewtwo & Mew-GX; 1 each Tapu Lele-GX, Galarian Articuno V, Latias ex, Clefairy ex, Squawkabilly ex). These identities/counts can be checked against [rank-1 source](benchmark-shadow-rider.md), [the proxy 60](../als/new-moon-lockbreak-english-proxy-60.json), and the bundled printed card pool.

With uniform seven-card opening draws and no later replacement/bonus draws, the exact probability of at least one such Basic *in the opening hand*, **conditional on a legal Basic-bearing seven**, is:

`[1 - C(60-m,7)/C(60,7)] / [1 - C(60-b,7)/C(60,7)]`

| Candidate frozen 60 | All Basic copies `b` | Printed-Ability Rule-Box Basic copies `m` | Eligible copy in initial 7, given legal 7 |
| --- | ---: | ---: | ---: |
| Champion reference | 14 | 6 | **62.85468079%** |
| New Moon English proxy v1 | 17 | 7 | **65.55794125%** |

This is a **physical-hand inclusion calculation**, not probability of placing the card in play, actually blocking an effect, receiving a useful ability trigger, or winning. It excludes mulligans, Prize composition, opponent bonus draws, setup Basic choice, search and subsequent owner actions. Nonetheless, it proves that **conditioning on a visible candidate printed-Power target is a candidate-inventory-sensitive evidence selector**. A source-first Iron Thorns Active passive lock can exist even when the candidate starts without such a target. In an unconditional registered comparison, retain `no-applicable-target-observed` and `potential-Ability-present-but-no-useful-line` separately from `native-Ability-block-verified` and `source-lock-absent`.

**Qualification rule refinement:** a printed target plus native PowerEffect block may authenticate **native suppression**, but an *effective tactical pressure* claim additionally needs the target's actual time-specific opportunity and relevant card effect. Never promote the former directly to a game-performance statement. Full opponent/candidate both-start and 25-minute match evidence remain unqualified.
