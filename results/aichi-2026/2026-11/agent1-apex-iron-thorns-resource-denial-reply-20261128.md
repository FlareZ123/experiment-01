# Apex Lockdown: an opponent-reply counterexample, not a candidate promotion

**Agent1, 28 November 2026.** Fixed challenger: [Apex Lockdown v1](agent1-apex-lockdown-v1.json). Original exact source: [Aichi field](../full-decklists.json). All results are **static printed-inventory, constructed hand-state, or restricted two-own-turn causal-proxy evidence**. **Zero real played/qualified games, 0/32 qualified matchups, 29/32 available original lists, no demonstrated 99.5%.**

## The fundamental interaction omitted by the tempting “pure Special Energy lock” story

The source-verified 60s at **ranks 6, 24 and 29** have **zero Basic Energy cards**. Our Regidrago VSTAR fixed 60 can play **Megaton Blower** (discard attached opponent Tools and Special Energy) and copy either **Giratina-EX Chaos Wheel** (100 damage; bar Tools/Special Energy/Stadiums from opponent hand next turn) or **Noivern ex Dominating Echo** (140; bar Special Energy/Stadiums next turn). This can prohibit ordinary manual reattachment of their all-Special Energy after a successful wipe. **But it does not prohibit the defender removing Regidrago's Energy.**

The three source inventories each actually contain:

| Original rank | Plumeria | Team Flare Grunt | Faba | Enhanced Hammer | Megaton Blower | Crushing Hammer | Handheld Fan | Lusamine |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **6** | 4 | 2 | 1 | 2 | 1 | 4 | 1 | 2 |
| **24** | 4 | 2 | 1 | 2 | 1 | 0 | 2 | 2 |
| **29** | 4 | 2 | 1 | 1 | 1 | 4 | 1 | 2 |

These are **source inventory counts, not probabilities of access**. Plumeria costs two hand discards to remove an Energy; Team Flare Grunt discards an Energy from the opposing Active; Faba sends an attached Special Energy into the Lost Zone; Enhanced Hammer (Item) discards Special; Megaton Blower (Item) wipes attached Special; Crushing Hammer needs heads; Handheld Fan (Tool) moves the attacking Pokémon's Energy to another opposing Pokémon after damage if its Active holder is hit, even if that holder is Knocked Out; Lusamine can help recycle Trainers in later turns but does not immediately remove Energy.

### Actual line-of-play counterexample with fully specified assumptions

Take any of the **three printed rank 6/24/29** opponents. Suppose (i) our Regidrago VSTAR is Active, its Apex Dragon has already been legally funded with **Double Dragon Energy + Basic Grass Energy** (3 energy units, Grass/Grass/Fire), (ii) we already paid Megaton Blower, removed the opponent's attached Special Energy, and copied **Chaos Wheel** or **Dominating Echo**, (iii) opponent has **Faba** in hand, has not used a Supporter, and no effect stops it, and (iv) our next-turn hand offers no immediate recovery.

**Opponent response:** Faba is a **Supporter**, not an Item/Special Energy/Tool/Stadium. Neither attack prevents it. Faba Lost-Zones our attached **Double Dragon Energy**. Our Active now retains only **one Basic Grass**, which cannot pay Grass/Grass/Fire; the attack lock did not maintain offensive initiative. This is **not** an automatic loss or a statement that Faba was actually drawn. It is a *real, reproducible counterexample to the false implication* “all-Special opponent Energy + attack restriction = unbeatable perpetual attack loop.” It also uses a one-copy Supporter each rank, so must not be treated as universal.

**Independent channels:** If opponent instead has Enhanced Hammer or Megaton Blower, either **Item remains playable** under Chaos/Echo and can remove our Double Dragon. If Plumeria plus two disposable cards, or Team Flare Grunt, their **Supporter** removal likewise remains available. **Lusamine** indicates possible multi-turn Supporter recycling; the witness does not simulate that loop. If the opponent has **Handheld Fan**, **Echo permits attaching it** after the wipe and its next damage-trigger may move our attached Energy. **Chaos forbids its reattachment** for the next opponent turn. That is why Chaos can still have a tangible defensive advantage despite **100 vs Echo's 140 damage** and two-hit vs three-hit thresholds against 230-HP Iron Thorns ex.

### Executable falsifying witness (not native opponent policy)

- [Original-rank constructed-hand adversarial witness](agent1-apex-iron-thorns-reply-witness.cjs), input exact rank, copied attack, opponent constructed hand, own Active attached Energy and own hand. Output each still-legal named response, its timing, conditional coin/Tool triggers, and whether our Apex remains funded after immediate removal. The opponent hand is a **constructed private-world assumption** for research, **never** disclosed to the candidate policy or inferred from deck source.
- [Nine test groups](../../../tests/2026-11/agent1-apex-iron-thorns-reply-witness.test.cjs): printed source inventory for all three ranks, Supporter/Item channels under both locks, Fan-vs-Chaos distinction, Cost-2 Plumeria, Supporter contention, conditional Crusher flip, manual one-card recovery if known, impossible hand/candidate Energy negatives. Executed with V8/CommonJS stand-ins against actual 29-list JSON; **no Node-native Store, policy, CI or full match**.
- [Field counterplay census](../../../scripts/2026-11/agent1-apex-lock-counterplay-screen.cjs), [seven tests](../../../tests/2026-11/agent1-apex-lock-counterplay-screen.test.cjs), and [broader screen](agent1-apex-lock-counterplay-screen-20261128.md) now expose these cards directly. A printed counter is not proof of access nor proof of useful play.

## New constrained causal screening: why duplicate Dragon donor isn't enough

To test a **specific defensive objective** rather than re-measuring generic T2 access, the [restricted two-own-turn model](agent1-apex-lockdown-setup-proxy.cjs) now also accepts **\`t2-dual\`**: on *our second own turn*, both **Item play and Supporter play are prohibited**, corresponding to the hypothesized coexistence of **Benched AOR Vileplume's Irritating Pollen and Active BCR Stoutland's Sentinel** in original rank 2. This is **not a simulated Aichi opponent**, does not assert both stages can be established by a specific turn, and does **not** dynamically model Wobbuffet suppressing the locks, Stealthy Hood, or player sequencing; it is deliberately conservative. No Pokémon combat, opponent attacks, KOs, or prize-taking.

To raise the chance of the *non-Item copied Mega Dragalge ex Corrosive Liquid/Pernicious Poison line*, we screened eight unchanged 60-card structures in [the executable runner](agent1-apex-dual-lock-structural-screen.cjs) (one base, seven alternative one-slot sacrifices for **a second Mega Dragalge ex**). [Initial 64,000-trial 2,000-per-cell sweep](agent1-apex-dual-lock-2000-screen.json) used seed 182736; [independent-seed 120,000-trial 15,000-per-cell two-arm holdout](agent1-apex-dual-lock-15000-holdout.json) used seed 9944783 and held every other card constant. Each cell is 15,000 separate restricted deals. Equal seed schedules across different deck compositions **do not** ensure identical physical deals. These are setup-proxy counts, **never matchup wins**.

| T2 dual-lock, restricted proxy | Base fixed 60 | 2x Mega Dragalge ex / remove Field Blower | Difference |
|---|---:|---:|---:|
| Our first own T2, funded Apex + Mega Dragalge donor in discard | **1,606/15,000 = 10.71%** | **2,215/15,000 = 14.77%** | **+4.06 percentage points** |
| Our second own T2, same | **3,353/15,000 = 22.35%** | **4,303/15,000 = 28.69%** | **+6.33 pp** |
| Our first own T2, funded Apex + **Chaos/Echo** donor | **2,052/15,000 = 13.68%** | **1,949/15,000 = 12.99%** | **−0.69 pp** |
| Our second own T2, funded Apex + Chaos/Echo donor | **4,145/15,000 = 27.63%** | **3,833/15,000 = 25.55%** | **−2.08 pp** |

The **same model policy** prioritizes the Mega Dragalge donor for the \`repeat-wipe\` goal, so extra copies can crowd out the GI/Noivern donor from its available discard/search paths (connector opportunity cost). The alt sacrifices **Field Blower**, a main-phase Tool-removal Item potentially important against **four Garbotoxin ranks**; substituting a turn-ending Corrosive attack for this Item is not universally free. This is a **real model-level tradeoff**, not evidence that the alternative is a better full-game 60.

## Decision and path to the primary objective

**Do not promote Apex v1 or the double-Dragalge arm over Hood Shield on these metrics.** Source-level resource-denial lines are interesting but opponent Faba/Plumeria/Hammers invalidate any naive perpetual-lock story. The dual-lock donor access is far below the 99.5% game-win ambition even in this *conservative early-window setup model*, and the model cannot prove a full-game ceiling either.

The next useful **owner-approved, native-pinned decision trial** must let each original Iron Thorns policy spend legal Supporter/Item denial after Echo/Chaos, and test whether the candidate can fund *subsequent* Apex attacks while also collecting six Prizes. Report resource exhausted, self-deckout, missed attacks, lost-zone DDE, Tool Fan continuation, and opponent Stadium/Ability changes. Equal-start/symmetric policy and exact 29 authentic sources remain mandatory before any win inference; ranks 23/25/28 have no source lists.

**Full-game evidence status: zero.** No workflow, Stage-A, V3 game, production candidate policy, or registered Hood/Lockbridge 60 was modified or dispatched in this run.
