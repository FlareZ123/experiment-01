# Non-Shadow-Rider architecture allocation: retain New Moon, park Psychic Reserve

**Agent 13 · 27 November 2026**  
**Decision affected:** fixed-60 candidate ranking and allocation of future opponent/candidate-policy effort.  
**Evidence class:** synthesis of exact fixed lists, printed-card/rules evidence, exact setup combinatorics, and previously preserved bounded native diagnostics. **No new game, native CI, policy implementation, or win-rate estimate.**

## Decision

Retain the **New Moon architecture**, with the **original New Moon Lockbreaker v1** restored as the preferred exact fixed 60 for the next policy-investment slot after cross-review. Park **Iron Thorns ex / Mimikyu Psychic Reserve v3e from the next cross-architecture policy slot**, while preserving it as a legitimate within-Thorns refinement candidate.

This is not a final-best-deck nomination. Hood Shield and Lockbridge remain unranked active Shadow Rider profiles; no matchup is competitively qualified and the 99.5% target is unproven. Agent13's −1 Sky Field +1 Guzma branch is preserved as a frozen challenger, but [the cross-review correction](agent13-newmoon-v2-reversal-after-crossreview-20261127.md) restored v1 because the narrow rank-15 Prize-collapse signal did not yet justify losing Sky #2's broader Stadium/Rondo roles. The narrower decision is where to spend the next scarce policy-development effort on a genuinely different engine.

The distinction is structural:

- New Moon is already a complete 60 with an exact English-print proxy that passed the repository's exact-print Expanded/banned-identity screen. Its 17-Basic shell has a **91.6563%** valid-opening-seven rate and a real Energy-card setup engine that works through Item, Supporter, and Pokémon-Ability locks when its attachment conditions are met.
- Psychic Reserve v3 is not English-Expanded eligible as submitted because it contains Japan-only **Palace Book** and **Palace Belt**. A concrete role-adjacent English repair now exists: **Rotom Bike SSH 181** for Palace Book and **Lucky Helmet AOR 77** for Palace Belt, with the other 58 cards unchanged. Both selected prints are Expanded-legal in the bundled English corpus, but neither is text-equivalent, so old v3 policy evidence does not transfer cleanly.
- Even after the two-slot English repair, Psychic Reserve remains a five-Basic shell. Its exact valid-opening-seven rate is **47.4562%**; only **20.9139%** of valid openings have two or more Basics; **15.8172%** of valid openings contain Mimikyu but no Iron Thorns. Across the 29 authenticated source lists, the opponent receives a much larger optional mulligan-draw ceiling in 26/29 matchups. This is a real policy cost—but **not a disqualifier**, because the parent rank-6 Iron Thorns source placed sixth with only four Basics.
- Psychic Reserve's earlier 48-attempt native A/B was useful developmental evidence, but the policy was unqualified and the results did not establish a robust, matchup-stable advantage for the Mimikyu package. For the scarce **cross-architecture** slot, that makes v3e a lower-information refinement of an already-successful Thorns family than the structurally different New Moon engine.

Therefore the right **cross-architecture** challenger is the already-fixed New Moon 60, subjected to the hostile cases below before any policy investment is called successful. Psychic Reserve v3e remains available for later within-Thorns refinement rather than being rejected as inherently weak.

## Exact preferred New Moon v1 after cross-review

The preferred fixed list is the established v1 machine-readable manifest at `results/als/new-moon-lockbreak-english-proxy-60.json`, hash `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`.

Use Agent1's [101-case v1 policy contract](agent1-newmoon-candidate-policy-acceptance-v2.json) as the implementation gate. It covers all 29 authenticated ranks while preserving the exact v1 60.

Agent13's [Guzma/Sky v2](agent13-newmoon-lockbreaker-guzma-sky-v2.md) remains a frozen material challenger. Its role is to test whether a Supporter own-switch/gust is worth more than Sky #2 after competent v1 policy evidence exists; it is **not** the current preferred list.

## Exact retained v1 list (evidence baseline)

This is the existing **New Moon Lockbreaker v1**, unchanged. The canonical machine-readable list remains `results/als/new-moon-lockbreak-english-proxy-60.json`; the identity/count hash recorded by the existing result is `sha256:a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`.

### Pokémon — 19

| Count | Card / selected English printing |
|---:|---|
| 2 | Mewtwo & Mew-GX — UNM 71 |
| 1 | Gengar & Mimikyu-GX — TEU 53 |
| 1 | Trevenant & Dusknoir-GX — SMP SM217 |
| 1 | Tapu Lele-GX — GRI 60 |
| 1 | Galarian Articuno V — CRE 58 |
| 1 | Latias ex — SSP 76 |
| 1 | Lillie's Clefairy ex — JTG 56 |
| 1 | Squawkabilly ex — PAL 169 |
| 3 | Unown — AOR 30 |
| 2 | Dusclops — SFA 19 |
| 2 | Duskull — VIV 69 |
| 1 | Solrock — CES 62 |
| 1 | Lunatone — OBF 92 |
| 1 | Klefki — SVI 96 |

### Trainers — 35

| Count | Card / selected English printing |
|---:|---|
| 4 | Battle VIP Pass — FST 225 |
| 4 | Fog Crystal — CRE 140 |
| 2 | Mysterious Treasure — FLI 113 |
| 2 | Hisuian Heavy Ball — ASR 146 |
| 2 | Rescue Carrier — EVS 154 |
| 2 | Battle Compressor — PHF 92 |
| 1 | Adventure Bag — LOT 167 |
| 1 | Escape Rope — BST 125 |
| 1 | Counter Catcher — PAR 160 |
| 1 | Secret Box — TWM 163 |
| 2 | Powerglass — SFA 63 |
| 1 | Forest Seal Stone — SIT 156 |
| 2 | Lillie's Determination — ME1 119 |
| 2 | Ace Trainer — AOR 69 |
| 2 | Sky Field — ROS 89 |
| 2 | Path to the Peak — CRE 148 |
| 2 | Field Blower — GRI 125 |
| 2 | Canceling Cologne — ASR 136 |

### Energy — 6

| Count | Card / selected English printing |
|---:|---|
| 3 | Telepathic Psychic Energy — ME3 88 |
| 3 | Basic Psychic Energy — source-mapped English proxy |

**Total: 60.**

The four-card lockbreaker package remains exactly the existing **−2 Trainers' Mail, −2 Rescue Carrier, +2 Field Blower, +2 Canceling Cologne** change from its source shell. Do not create another one-card “improvement” before the actual hostile decisions below are addressed.

## Adversarial cases that decide whether New Moon deserves implementation depth

These are not staged wins. Each case states the opponent's strongest already-supported pressure, New Moon's best presently evidenced reply, and the unresolved decision that a competent actor-visible policy must handle.

| Opponent family / case | Opponent best pressure | New Moon response that exists on paper | What can still refute New Moon |
|---|---|---|---|
| **Iron Thorns (ranks 6/24/29)** | Keep Iron Thorns Active so Initialization suppresses Mewtwo & Mew-GX's Perfection. | Two distinct attack channels exist: native Gengar & Mimikyu-GX can use its printed Horror House-GX without Perfection; or Mewtwo can use Cologne then Perfection if attacker, Energy and payload are all present. The exact direct no-search union of native-Gengar+Energy or Mewtwo+Cologne+Energy is only **11.3280%** even when all optional Thorns mulligan bonuses are accepted. A broader first-draw Cologne-access model reaches **42.2455%** with Secret Box/FSS search routes, but that is counter access, not a completed attack. | The response is resource-dense and the native Gengar line exposes a three-Prize TAG TEAM. A competent Thorns policy can attack the Energy/hand economy while keeping Initialization Active. If the actor-visible New Moon policy cannot sequence the native-attacker and Cologne/Perfection branches without burning its scarce counters, park the architecture. |
| **Absol / Garbodor (ranks 8/11/16/22)** | Tool-enabled Garbotoxin disables Perfection and other Pokémon Abilities while the opponent can reattach Tools after one removal. | Field Blower can remove the enabling Tool while Items remain playable. Existing first-draw access is **34.3929%** via direct/Secret Box routes; Forest Seal Stone adds a second-search route only after the relevant suppression is cleared in the conservative sequence. | Two Blowers are finite; the source families carry multiple Tools. One successful removal is not a matchup solution. The policy must price re-tool risk, Secret Box's three-card discard, and whether using FSS/Tool search destroys a stronger line. |
| **Vileplume control / Lopunny Vileplume (ranks 2/15)** | AOR Vileplume Item lock removes Blower/Cologne/Secret Box access. Rank 15 can additionally put BUS Vileplume Active so opposing Basic Pokémon cannot attack; Stealthy Hood can protect a Vileplume from opposing Ability effects. | Telepathic Psychic Energy can still build Psychic Basics because its trigger is an Energy-card effect, not an Item/Supporter/Pokémon Ability. New Moon also has two Stage-1 Dusclops: Will-O-Wisp is a non-Basic attack, and Cursed Blast is a costly non-attack damage-counter route. | This is the hardest lock case. A clean 140-HP BUS Vileplume needs three unmodified 50-damage Will-O-Wisps, while Cursed Blast sacrifices Dusclops and may be blunted by Hood on the chosen target. The source-dealt generic-policy census never produced the competent dual-lock state, so absence of a loss is meaningless. A policy must show the pre-lock counter burn or the powered Dusclops continuation against an actually competent dual-lock line. |
| **Regidrago family (ranks 10/12/13/14/18/20/21/27/32)** | Many lists can open with Budew's zero-cost Item lock, then evolve Regidrago VSTAR. Apex Dragon can copy Dragapult ex's 200 + six Bench damage counters; many profiles also contain Noivern ex, whose Covert Flight can prevent damage to Regidrago from Basic Pokémon on the next turn. Several lists have Path/Silent Lab pressure and disruption. | Telepathic Psychic Energy remains a setup route through Budew Item lock and can put two Psychic Basics directly onto the Bench. New Moon can use native/non-Basic Dusclops lines when Covert Flight blanks Basic-attacker damage; Solrock + Lunatone's New Moon can protect the board from Stadium effects once established. | This family directly attacks New Moon's wide low-HP support board: Phantom Dive can convert Bench expansion into multi-Prize pressure, while Covert Flight can blank the main Basic attackers' damage. The retained 60 earns policy investment only if an actor-visible policy can decide when TPE board expansion is worth the Dragapult exposure and when to preserve/evolve Duskull instead. This is a high-priority held-out challenge, not a solved matchup. |
| **Meloetta donk (rank 26)** | Going second, the source aims to donate Prizes and use TM: Crisis Punch for 280 before the opponent develops. | New Moon's 17 Basics structurally reduce lone-Active exposure: **27.4628%** after rank-26 optional mulligan bonuses versus 37.5068% for the 14-Basic rank-1 reference. A sole Klefki start is **1.6155%** of valid setups and can suppress Live Debut until Cologne removes Mischievous Lock. | The opponent has Cologne/search channels and a 280-damage attack can KO every New Moon Basic by printed HP if successfully assembled. Going first gives New Moon a setup turn; going second is the dangerous orientation. The policy must choose Active/Bench placement rather than merely count Basics. |
| **Own setup / Prize-resource failure** | No opponent action is required: six Energy and multiple singleton/2-copy roles create severe contention, and the four lockbreaker Items displaced two Trainers' Mail plus two Rescue Carrier. | The 3 TPE / 3 Basic split gives **29.2160%** conditional opening-seven TPE+Psychic-Basic access going first and **33.3978%** going second. A specific TPE-enabled Mewtwo→Gengar Horror House line is **6.0992%** going first (setup for turn two) and **6.9808%** going second. Existing Prize-capacity work puts the named precise-resource configuration at **95.4563%** structurally feasible, not executable. | This deck can have theoretical counters and still fail AMR: counter Items can be dead under Item lock, Secret Box can be unpayable, Bench slots can be wrong, the singleton donor can be Prized, and Basic Energy is non-substitutable for Powerglass. Policy work must expose these opportunity costs instead of treating search access as success. |

### Starting-orientation implications

The same exact 60 must work in both orientations.

- **Going second** is the high-upside New Moon orientation because a TPE-enabled Mewtwo can immediately copy Horror House-GX if the line is complete; it is also the dangerous orientation against rank-26's first-turn attack race depending on coin/choice and actual starter.
- **Going first** cannot attack, so the value is board construction and preserving counter resources. Against early Budew/Vileplume plans the policy should use any Item window that will disappear, while retaining TPE as a non-Item setup route.
- No orientation should be scored from opening access alone. The policy must preserve the opponent's actual reply and the next candidate response.

## Why Psychic Reserve is parked instead of “fixed”

### 1. The two illegal promo slots can be repaired, but not neutrally

A complete 60-card English role-repair now exists at [Psychic Reserve v3e](agent13-psychic-reserve-english-v3e.json), with a detailed [repair analysis](agent13-psychic-reserve-english-v3e-repair-20261127.md):

- **Palace Book SMP NAN25 → Rotom Bike SSH 181**. Both are Item draw effects that end the turn, but Rotom Bike draws to six rather than exactly three.
- **Palace Belt BWP 153 → Lucky Helmet AOR 77**. Both are Active-position Tool draw engines, but Lucky Helmet draws two only after the Active holder is damaged by an opponent's attack.

This removes the English-format blocker without pretending that the two effects are identical. The repaired list is a real fixed 60, but it needs new policy reasoning because its draw semantics differ from the old v3.

### 2. The five-Basic shell is a real cost, but rank 6 proves it is not a disqualifier

The exact opening screen already shows:

- initial seven contains a Basic: **47.4562%**;
- among valid openings, at least two Basics: **20.9139%**;
- among valid openings, Mimikyu but no Iron Thorns: **15.8172%**;
- against the 29 authenticated source lists, equal-weighted mean maximum optional bonus-draw ceiling is **0.975 cards to the opponent vs 0.202 to Psychic Reserve**;
- **26/29** authenticated opponents have the higher bonus-draw ceiling.

This is not a cosmetic consistency statistic. It means the control deck repeatedly gives the opposing source deck extra setup resources while often beginning with only one Pokémon. The exact count-only sensitivity does not become field-neutral until around 10–11 Basics, and adding five or six Basics would be an architectural redesign with substantial Trainer/control opportunity cost.

But the parent **rank-6 Iron Thorns source had only four Basics and actually placed sixth**. The event result therefore falsifies any simple rule that a low-Basic control shell should be parked because of mulligan/setup math alone. The screen should inform policy and slot-cost decisions, not act as a rejection threshold.

### 3. Existing native results do not establish a durable within-family upgrade

The earlier 48-attempt A/B between Safeguard v1 and Psychic Reserve v3 was explicitly developmental and used an unqualified shared policy. It provided useful evidence that the second Psychic Energy could enable more Mimikyu lines, but even its own report records matchup-dependent reversals and zero paper-qualified games. It does not establish that the five-Basic architecture's lock advantage exceeds its setup and draw-engine costs.

**Parking condition:** do not spend the next **cross-architecture** policy slot on Psychic Reserve. The exact English v3e repair exists and the parent low-Basic Thorns family already has real tournament evidence. Preserve v3e for later within-Thorns optimization; reopen it when the Mimikyu/funding package has actor-visible evidence of fixing a hard Thorns matchup or when family refinement becomes the active research priority.

## Unified candidate-policy acceptance contract

The v1 held-out decisions were collapsed into [the v1 actor-visible contract](agent13-newmoon-candidate-policy-acceptance-v1.json), which now contains **39** integrated decision states after Agent1's Raichu/Electrode delta. The preferred v2 extends that into [the 65-case v2 contract](agent13-newmoon-guzma-sky-v2-policy-acceptance-v1.json).

The combined gate contains across universal immediate-win/survival logic, Regidrago, rank-15 Vileplume, Iron Thorns, Garbodor, rank-26 Meloetta, rank-1 Shadow Rider and Secret Box self-contention. It is deliberately **not** another bot or workflow. A later implementation should satisfy these cases with public/owner-visible state before native/full-game investment.

The rank-1 addition is especially important: an Active Klefki is valuable against Basic Iron Thorns but can be a self-lock after Shadow Rider VMAX is evolved, because Mischievous Lock disables Basic Mewtwo & Mew-GX Perfection while leaving the Evolution VMAX's Underworld Door operating. The source-specific control channel is instead [asymmetric Path + Solrock/Lunatone](agent13-newmoon-rank1-asymmetric-path-policy-20261127.md), with Marshadow's public board position determining whether Horror House can protect the Stadium window.

## Policy-investment recommendation

Allocate the next non-Shadow-Rider policy-development slot to the **New Moon Lockbreaker v1 fixed 60**, with the following held-out order:

1. Regidrago Budew → Apex Dragon pressure, including a Dragapult-spread and Noivern-Covert-Flight case.
2. Rank-15 competent AOR + BUS Vileplume line, with an explicit pre-lock Item window and powered Dusclops continuation.
3. Iron Thorns active Initialization with both native-Gengar and Cologne/Perfection alternatives present as genuine choices.
4. Garbodor re-tool recurrence after the first Field Blower, so the worker cannot pass by solving a one-shot staged lock.
5. Rank-26 starting-orientation case, including sole-Klefki and non-Klefki lone-Active branches.
6. A self-inflicted resource-contention case where Secret Box is legal but dominated because the discard/Tool/Bench opportunity cost destroys the intended next turn.

A competent policy need not “win” every synthetic case. It must choose a legal, strategically coherent root and continuation, preserve unsupported cases explicitly, and expose why the alternative is worse using actor-visible information. Only then should this architecture receive native/full-game investment.

## Boundaries

- This note changes **research allocation**, not the final deck nomination.
- The New Moon candidate 60 remains the established v1 after cross-review. The Guzma/Sky v2 branch is preserved only as a challenger. No source opponent, Twinleaf pin, workflow, V3 registration, Stage-A disposition, or owner-controlled game gate changes.
- The owner-gated Hood/rank-1 V3 seat-swap pair remains independent and should not be delayed by this architecture exercise.
- The three missing source lists (ranks 23/25/28) remain missing and are not imputed.
- No game or qualified matchup is created here; **99.5% remains unproven**.
