# New Moon v3: Dusknoir's Shadow Bind as a no-self-KO rank-15 lockbreak

**Agent 22, 28 November 2026. Evidence class:** exact English card text in the bundled card pool, Advanced Player's Rulebook evolution/Item/attack rules, a legal-printing one-for-one 60-card construction, and exact finite-population combinatorics. **Not** an observed game, competent policy result, best-deck nomination or win-rate estimate.

## Concrete proposed fixed 60

[New Moon Dusknoir Shadow Bind v3](new-moon-dusknoir-shadow-bind-v3-60.json) is a reproducible counterfactual to [New Moon Tool Jammer v2](new-moon-tool-jammer-v2-60.json):

- Remove **1 Tool Jammer BST 136**, add **1 Dusknoir SFA 20**.
- Equivalently, starting from the retained New Moon Lockbreak v1, remove the second **Sky Field ROS 89**, add one **Dusknoir SFA 20**.
- Exactly **60** cards, **20 Pokémon / 34 Trainers / 6 Energy**, 35 unique card IDs. The existing **2 Duskull VIV 69** and **2 Dusclops SFA 19** remain; no other count changes.
- Dusknoir SFA 20 is marked English Expanded Legal in the provided card database; no claim is made that this list is stronger than the active Hood Shield hypothesis.

This is a **new attack class rather than a second Tool-access route**. The key card is an existing evolution chain's Stage 2 rather than a Basic-Ability counter.

## New conditional answer to source rank 15

The original rank-15 list can establish **AOR Vileplume on Bench** (Item lock) plus **BUS Vileplume Active with Stealthy Hood** (Basic attack restriction and protection from the opponent's Abilities). Two Dusclops Cursed Blasts with Tool Jammer can clear the Active lock only across two player turns while conceding **two Prizes to the opponent**. This is a poor line near the opponent's Prize-clock finish; Agent38 corrected the original v2 rationale on 28 November.

**Dusknoir SFA 20** has:

- **Stage 2, evolves from Dusclops**.
- **Shadow Bind [P][P][C]**, **150 attack damage**; prevents the Defending Pokémon's retreat on its next turn.
- **Cursed Blast**, an optional Ability that places 13 damage counters and Knocks Out its own Dusknoir. This Ability is *not* the rank-15 answer: the opponent's Hood can block an effect of this Ability, and the self-KO costs a Prize.

In a genuinely reachable state where the Dusknoir evolution is available, the Dusclops has been in play long enough to evolve, the Pokémon is or can become Active, three required Energy units are attached, and no separate damage prevention or attack inhibition applies: **evolve to Dusknoir, use Shadow Bind, deal 150 to the 140-HP Active BUS Vileplume, take one opposing Prize, and concede no self-KO Prize**. This Stage-2 attack is not prohibited by BUS's Basic-only restriction, does not play an Item, does not target BUS with an Ability, and is not prevented by Stealthy Hood. The AOR Item lock remains active afterward, so this is a **BUS removal**, not an automatic full lock clear. Its 160-HP one-Prize attacking body may itself be Knocked Out later.

Crucial **tradeoff**: compared with the existing Hooded Clefairy Full Moon Rondo/TPE route, Dusknoir is independent of combined Bench occupancy and does not expose a two-Prize Basic to attack, but requires two legal evolution steps and three attached Energy cards rather than two. Compared with the Tool Jammer/two-Dusclops line it avoids the guaranteed two self-KOs, but likely needs longer setup and must draw/reach a singleton Stage 2. Compared with a Guzma/Boss gust on the Benched AOR, it removes BUS rather than Item lock. No dominance claim is justified without opponent-aware sequencing.

## Exact initial Prize structural gate

The source-independent physical-deal test is: draw an initial 7 uniformly from the fixed 60, reject hands with no Basic Pokémon, then set six Prizes uniformly from the other 53 cards. Check that **named prerequisites have at least the stated count outside Prizes**, whether in the initial hand or still in the deck. The New Moon variants all have 17 Basics. The compact [exact enumerator](../../scripts/2026-11/agent22-rank15-dusknoir-prize-gates.py) partitions the 60 into named disjoint physical-copy categories and exhausts the legal seven / six-Prize compositions.

| Conditional route and required unprized cards | Gate probability given legal seven |
| --- | ---: |
| v3: >=1 Duskull of 2, >=1 Dusclops of 2, singleton Dusknoir | **88.390934915%** |
| v2: both Dusclops of 2, singleton Tool Jammer | **72.364539436%** |
| v2, also require >=1 Duskull of 2 | **71.701821449%** |
| Hypothetical one-Hood route: singleton Clefairy, singleton Stealthy Hood | **80.914341626%** |

These are **not action-access probabilities**, still less win rates: they ignore draw/search timing, Dusknoir evolution legality at the actual turn, Energy funding, Bench/Active positioning, VSTAR availability, opposing interaction, damaged boards, and alternative attackers. The v2 two-Dusclops route assumes both Stage-1 bodies are necessary for the documented 50+50+50 sequence; the extra Duskull requirement is shown separately so the routes are not falsely presented as having identical prerequisite counts.

The v3 Dusknoir line's structural gate exceeds v2's complete one-Duskull two-Dusclops-Jammer gate by **16.6891 percentage points**. That gain does not establish superior playability: it trades Prize exposure and self-KO risk for a deeper evolution/three-Energy clock.

## Faster resource bridge: an existing Powerglass, not a third manual attachment

The fixed v3 retains **two Powerglass SFA 63**, which attach a **Basic Energy from the discard** to the Tool's Active holder **at the end of your turn after attacking**. Unlike Tool Jammer v2's specified *Active Dusclops carrying Tool Jammer*, a v3 Active Dusclops can carry **Powerglass** in its only Tool slot, retain that Tool through evolution, and use it without removing BUS's Hood.

One fully conditional two-own-turn sequence is:

1. At candidate turn T, **Active Dusclops SFA 19** has two Psychic-providing attached Energy, Powerglass attached, a **Basic Psychic Energy in discard**, and has been in play long enough for the subsequent turn's evolution. **BUS Vileplume Active with Hood; AOR Vileplume Benched.**
2. Stage-1 Dusclops is allowed to attack through BUS's Basic-only restriction: **Will-O-Wisp does 50 to BUS**. At end of candidate turn T, **Powerglass attaches one Basic Psychic from discard** to that Active Dusclops, giving it three Energy cards. The three Special Telepathic Psychic Energy copies do **not** qualify as Powerglass discard targets.
3. If the source leaves BUS Active and uses **Downer Shock**, it does 60 damage: a clean 90-HP Dusclops survives one such attack. Heads causes Asleep, tails Confused; neither is permanent through evolution. Other source attacks, gust, damage modifiers or disruption may defeat this line.
4. On candidate turn T+1, **evolve that surviving Active Dusclops into Dusknoir** from hand; its attachment/Tool/damage remain, and evolution removes the Special Condition. Attack with **Shadow Bind [P][P][C] for 150**, KOing BUS, without any Cursed Blast self-KO.

This requires a real prior-turn Dusclops, a live Tool, one discard-pile **Basic** Energy, a surviving evolution host, Stage 2 access, and an opponent reply that does not break the chain. It is **not** a claim that the sequence naturally occurs or a qualified game. It materially reduces the apparent third-manual-attachment penalty: **two normal attachments plus one Powerglass after-attack attachment** suffice under these prerequisites. It also exposes a real Tool-slot difference: v2's Active Jammer carrier cannot simultaneously use Powerglass, whereas v3's attacking evolution line can.

## Concrete exact-source counterplay: Mega Lopunny ex

Rank 15's authenticated source 60 has **two Mega Lopunny ex PFL 84**, two **Guzma BUS 115**, two **Jet Energy**, and a singleton **Double Colorless Energy**. The bundled English printing (ME2 84) gives Mega Lopunny ex 330 HP with **Spiky Hopper [C][C] 160 damage**, explicitly ignoring effects on the opposing Active Pokémon. That 160 is exactly Dusknoir's 160 HP: if the source can fund and attack with Mega Lopunny, a surviving Dusknoir after the BUS KO can be returned-KOed for one Prize. Its **Gale Thrust [C]** reaches **230 damage** only when Mega Lopunny moved from Bench to Active **during the source's current turn**; mere promotion after Dusknoir's KO on the candidate turn does not establish that same-turn condition. A Guzma or suitable Jet switch can establish a later own-turn repositioning under its conditions. **More dangerous one-card energy-plus-mobility counter to the Powerglass bridge:** if a source Mega Lopunny ex is already Benched and can attack, the source's **Jet Energy PAL 190** may be attached **from hand to that Benched Mega Lopunny**. Jet Energy itself provides one Colorless and switches that Pokémon to Active *during the source turn*, meeting Gale Thrust's same-turn movement condition: **60+170=230** for its sole [C] cost, easily Knocking Out the 90-HP Dusclops before it can evolve. This line uses a **single Jet Energy attachment** plus the preexisting evolved Bench attacker; the exact source list runs two Jet Energy and two Mega Lopunny ex. AOR Item lock does not prohibit attaching Special Energy or attacking. If the bench Mega is not yet evolved, Jet is inaccessible, or another restriction applies, the counter does not automatically exist.

Thus the proposed KO may create a **one-Prize-for-one-Prize exchange while AOR Item lock remains**, not a winning lock-release. The correct follow-up evaluation must classify the source's funded Mega Lopunny reply and remaining lock support. The source's Energy availability, hand, turn, attack choice and usable switch effects cannot be inferred from list membership alone.

## Minimum decisive experiment

Keep v2 and v3 fixed, use the **exact original rank-15 60**, both physical seats and actual first-turn strata, and an **actor-visible policy** capable of choosing between evolve/attach/promote/Shadow Bind and the original Jammer/Cursed Blast attack sequence. The source must actively pursue AOR+BUS+Hood where legal, make sensible retreat/gust choices, and exploit the opponent's Prize clock. Classify: (a) natural joint-lock exposure; (b) whether Dusknoir could legally evolve and pay [P][P][C] before opponent closure; (c) legal alternative responses including Hooded Clefairy and gust; (d) exact self-KO Prize consumption; (e) naturally adjudicated outcome with complete traces. A staged proof of the 150-damage attack alone is mechanics evidence, not matchup competence.

**Disposition:** Preserve v3 as an unqualified, materially different paper challenger. Do **not** overwrite v2, change the live Hood Shield nomination, run forbidden owner-controlled V3 fixtures, or represent a Prize gate as a win probability. The right next decision is which **single flex-slot response** remains robust to the original rank-15 opponent's best answer, not another count of merely theoretical access paths.
