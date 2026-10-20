# New Moon Lockbreaker v1 under rank-15 dual Vileplume: printed attack-surface census

**Agent 30, 20 October 2026.** Evidence class: exact fixed-60 inventory plus printed card text, pinned engine source inspection, and already-compiled staged/replayed checks. This is a structural hypothesis for realistic native decisions, not a game-win estimate.

## Fixed deck and conditional board

The frozen [New Moon Lockbreaker English-mechanics 60](new-moon-lockbreak-english-proxy-60.json) has **19 Pokémon cards:** **17 Basics and two Dusclops SFA 19, the only two Stage 1 cards**. Every Basic Pokémon in this 60, including the primary Mewtwo & Mew-GX attacker, falls under the printed Vileplume BUS 6 *Disgusting Pollen* attack restriction while that Ability operates and BUS is Active. Dusclops is the only printed Pokémon whose Stage permits its own ordinary attack in that state. This is a card-list census, not an assertion that the two Dusclops can be set up and powered on demand.

The rank-15 source can simultaneously have **Vileplume AOR 3** with *Irritating Pollen* on the Bench. Its Item ban affects both players and therefore makes the four newly added New Moon Item-based anti-lock counters, two **Field Blower** and two **Canceling Cologne**, unplayable while the Item lock is operating. Those counters can still be valuable if played beforehand or after the lock is lifted. Neither the card-list comparison nor the archived replay establishes that every conditional suppression source stays active under all other board effects.

### Printed alternative within the 60

- **Dusclops SFA 19, Stage 1:** *Will-O-Wisp* does 50 damage at two Psychic Energy. It bypasses the printed BUS restriction on Basic attackers, but requires an Active Dusclops and payable Energy. The attack is printed on Dusclops itself, unlike copied GX attacks on Basic Mewtwo & Mew.
- **Cursed Blast Ability:** each Dusclops can put five 10-damage counters on one opposing Pokémon, then knocks itself out. Two such copies alone put at most **100 damage** on a single otherwise undamaged BUS (140 HP), leaving a 40-damage gap. Using both sacrifices both Stage 1 bodies and normally concedes Prize cards. A damaged BUS, Energy-backed Will-O-Wisp, or other damage/effects can change the conclusion. BUS blocks Basic **attacks**, while Cursed Blast is an Ability.
- **Mewtwo & Mew-GX** is Basic even when copying an Evolution GX attack through *Perfection*. Printed BUS restricts the attacking Pokémon's Stage; copying a Stage 1 or Stage 2 attack does not change that Stage.

In the independently reviewed [actual native rank-15 historical paid-retreat board](../aichi-2026/agent30-rank15-paid-bus-lock-temporal-audit-20261020.md), the source established Active BUS plus Benched AOR at turn 18, and the candidate's Active was visibly **Mewtwo & Mew-GX UNM**. A **Dusclops SFA** was already on the candidate Bench in the first dual-board observation. The fact that Dusclops was present is therefore distinct from having it Active and energy-ready to attack.

## Pinned source rule and independent native checks

The actual pinned Twinleaf commit **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05** contains `ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/vileplume.ts`: on a `UseAttackEffect`, its *Disgusting Pollen* reducer tests `effect.source.isStage(Stage.BASIC)`, confirms this Vileplume is opposing Active, checks `IS_ABILITY_BLOCKED`, then throws `GameError(GameMessage.BLOCKED_BY_ABILITY)` when its Ability applies. These are source-code facts at the pinned engine revision and explain why copied attacks from Mewtwo & Mew remain affected by the Basic attack veto.

The existing [nine-case staged native Store matrix](../../simulation/twinleaf/new-moon-rank15-dual-lock-actions.cjs) passed [compiled manual CI 39145455906](https://github.com/FlareZ123/experiment-01/actions/runs/39145455906): a Basic Mewtwo & Mew-GX `Miraculous Duo-GX` is rejected by the active BUS lock with or without AOR Item lock, while a Stage 1 Dusclops's printed Will-O-Wisp damages the active Vileplume under both locks in the staged test. The matrix also proves Tool/Ability counterexamples under its injected conditions. It uses injected boards, so it does not certify the original t19 candidate's actual Energy or attack readiness.

## Research implication

The original lockbreaker four-Item trade pushes toward a **time-critical pre-lock release**. Once BUS Active and AOR Bench are simultaneously established, the candidate needs a genuine Stage 1 battle line, a viable non-Item lock intervention, or another legal answer. A simulator that evaluates only Basic Mewtwo-GX attack access or accepts theoretically searchable Item outs will overstate actual response realism.

The strongest next test is an actual original-Store owner-visible **turn-19 Mewtwo-GX versus Active BUS attack veto**, contrasted with unchanged original-source Bunnelby Active, documenting cost satisfaction, native `UseAttackEffect` rejection and next source action. If the t19 original candidate lacks required Energy, that limitation should be recorded instead of selecting a later conveniently favorable seed. Existing producer work remains retrospective and opponent bot quality unqualified.

**Benchmark status remains 29/32 exact opposing source 60s, zero competitively qualified games, and no proven fixed-60 99.5% win rate.**


## One-turn conditional line: Supporter gust into a 150-damage Night Watch

An explicit structural alternative worth native testing is a **Boss's Orders Supporter** replacing one presently Item-only anti-lock slot. Boss's Orders' official text selects one opposing Benched Pokémon to move Active ([Pokémon Trainers Website](https://asia.pokemon-card.com/sg/card-search/detail/24764/)). AOR prohibits **Items** from hand and leaves a Supporter gust available under ordinary Supporter rules. The source rank-15 t18 paid-retreat board has the 130-HP **Vileplume AOR** on its Bench and 140-HP BUS Active.

The candidate's fixed list already has **Trevenant & Dusknoir-GX SMP SM217**, whose printed *Night Watch* costs **three Psychic Energy** and deals **150**. The authentic t18 native dual-board snapshot already places Trevenant & Dusknoir-GX on the candidate Bench and Mewtwo & Mew-GX Active. In a state where Mewtwo & Mew-GX has three payable Psychic Energy, can use *Perfection*, and the player has a legal, unused Supporter play, the candidate could **Boss's Orders the Benched AOR into Active, then copy Night Watch to Knock Out its 130 HP**. After gust, BUS is on the Bench, removing its Active-only Basic attack prohibition for this attack; after the Knock Out, AOR's Item lock leaves play as well.

This is a **conditional tactical construction**, not a demonstrated played line. The current fixed 60 contains **no Boss's Orders or Guzma**. Adding one costs another resource slot; reaching it under a pre-existing Item lock, having three Energy at the right time, an intact Perfection Ability, the opponent's possible effects, and the subsequent source reply all require a prospective original-Store test. A native control attack named Night Watch was declared on turn 19 in the no-retreat historical branch, suggesting an actual attacking line existed before BUS was promoted, but that declaration alone neither proves the proposed Supporter was accessible nor that all original resource states are transferable to a different fork.

The proposed test should hold each 60 fixed within each candidate arm, introduce the Supporter as an explicit separately frozen structural candidate, and compare both physical seats against source rank15. Preserve the original no-gust historical control, source-owned lock establishment, Supporter contention, owner-hand legality, complete native attack resolution, and subsequent source turn before drawing any deck-selection conclusion.


## Existing non-Item access chain for a newly added gust Supporter

There are two existing *conditional* Supporter-search routes worth testing before judging the Boss's Orders hypothesis:

- **Forest Seal Stone SIT 156** is a Pokémon Tool granting the attached **Pokémon V** the once-per-game *Star Alchemy* Ability, which searches any card. The frozen 60 contains one **Galarian Articuno V** as its sole Pokémon V and one Forest Seal Stone. Under the supplied Advanced Player's Rulebook (B-02 Pokémon Tools, page 10), a Sword & Shield-era Pokémon Tool is treated as a **Tool rather than an Item**, even if its old printing also labels it Item. Consequently, AOR's Item-play prohibition does not itself stop attaching the Stone from hand to a valid Articuno V or activating its Star Alchemy Ability, provided Ability access and unused VSTAR Power remain. This could fetch a newly added Boss's Orders after Item lock.
- **Tapu Lele-GX GRI 60** carries *Wonder Tag*, searching for a Supporter when played from hand onto the Bench. It is a Pokémon Ability. The AOR Item restriction alone does not disable this Ability. Practical access still requires Tapu Lele in hand, a Bench slot, and an unsuppressed Wonder Tag.

These are **connector pathways with serious occupancy/opportunity costs**, rather than guaranteed outs. In the actual rank-15 paid-retreat first dual-board snapshot, the candidate had **eight occupied Bench slots under its Sky Field configuration** and no Galarian Articuno V or Tapu Lele-GX in play. Several Benched Unown could potentially free Bench space using *Farewell Letter* if their Ability is usable, but that sequence must be observed and kept owner-information-safe. The original Stage1 Dusclops attack line competes for the same scarce Energy, retreat, and Active slot. The proposed Supporter also consumes the only normal Supporter play of its turn.

An important experiment therefore compares **actual t19 owned hand, artifactual forest-stone availability, Bench-recycling lines and legal supporter quota** under the archived source pressure. Existence of a Tool/Ability connector is insufficient evidence that Boss can be deployed in that physical deal. Native mechanics tests should preserve the original Mewtwo Active, true attached Energy and source Able/blocked Ability effects.


### Boss's Orders versus Guzma: an essential turn-18 distinction

The two Supporters are not interchangeable in the archived board. Printed **Guzma BUS 115** gusts one opposing Benched Pokémon **and then requires its user to switch their own Active Pokémon with a Benched Pokémon** when the first switch succeeds. With the candidate's powered **Mewtwo & Mew-GX already Active** at t18 and eight candidate Bench occupants, this forced second switch would move the attacker away. A second legal self-switch or retreat may then be necessary, under severe Item lock. By comparison, printed **Boss's Orders RCL 154** changes only the opponent's Active Pokémon, retaining Mewtwo & Mew-GX Active for an immediate copied *Night Watch* if its Energy/Perfection prerequisites hold.

The distinction is a direct example of **Active Move Realism and connector contention**. Any proposed one-slot Supporter-gust candidate should initially test **Boss's Orders specifically**, and should evaluate Guzma only with a separately demonstrated affordable own-switch recovery line. Neither Supporter is in the frozen New Moon 60 as tested, so this is still an unproven structural adjustment.


## Field-wide opportunity-cost check for a Boss slot

The Boss proposal cannot be selected from the rank-15 tactical line alone. The exact published Aichi source inventory and printed lock rules create distinct matchup responses:

- **Iron Thorns ex-only ranks 6, 24 and 29:** all Pokémon in those three fixed source decks are **Iron Thorns ex**. If the opponent has no Bench, Boss has no legal target. Even with another Iron Thorns ex on Bench, gusting a different Thorns to Active may leave its same *Initialization* Ability operating. Thus Boss is not a reliable substitute for **Canceling Cologne** against this lock.
- **Garbodor lock ranks 8, 11, 16 and 22:** a Tool-equipped **Garbodor LTR/BKP** has *Garbotoxin* while either Active or Benched, so simply gusting it does not turn off the Ability. A Boss may create an attack target whose Knock Out removes the lock Pokémon. But Garbotoxin suppresses Mewtwo & Mew-GX's Perfection; an ordinary copied *Night Watch* may be unavailable until after Garbodor is removed. **Mewtwo & Mew-GX's printed Miraculous Duo-GX**, for three payable Energy, could conditionally Knock Out a 100-HP Garbodor despite Perfection being disabled, if the one permitted GX attack remains unused. This consumes the GX attack for the entire game and competes with the core copied *Horror House-GX* plan. Tool removals can remain valuable in this matchup.
- **Vileplume ranks 2 and 15:** where an Item-locking AOR remains Benched and an Active-only BUS restricts Basic attacks, the Supporter gust creates the specific immediate Night Watch target described above. The actual unqualified same-seed source pressure is documented only for rank 15, not all Vileplume configurations.

Boss's Orders also retains general tactical gust value in other matchups, but no aggregate performance estimate follows from these role relationships. An optimizer must account for the **removed slot, Supporter turn contention, unique GX use, access under lock, Bench and Energy budgets, and response by each original source opponent**. This supports a new structural hypothesis; it does not justify automatically overwriting the existing frozen 60.
