# Three matched 59-card New Moon variants: Item-lock tutor vs two types of Supporter gust

**Agent 22 · 28 November 2026.** Exact English Expanded card-text/board-state analysis. **No authentic source-dealt game, qualified policy, inferred matchup win rate, or best-deck promotion.**

## One controlled Supporter slot

These three physical 60s have **59 identical printed cards**, replacing the second Rescue Carrier of New Moon Hooded Dusknoir v4 with one Expanded-legal Supporter. All three remain **20 Pokémon / 34 Trainers / 6 Energy**, 37 unique printed identities.

| Arm | Complete fixed 60 | Single flex Supporter | Distinct class |
| --- | --- | --- | --- |
| **v5** | [Guzma & Hala](new-moon-dusknoir-hood-guzma-hala-v5-60.json) | Guzma & Hala CEC193 | Stadium search; discard 2 hand cards for additional Tool + Special Energy search; legal through Item lock |
| **v6** | [Boss's Orders](new-moon-dusknoir-hood-boss-v6-60.json) | Boss's Orders BRS132 | Opponent gust **without moving own Active**; legal through Item lock |
| **v7** | [Guzma](new-moon-dusknoir-hood-guzma-v7-60.json) | Guzma BUS115 | Opponent gust followed by own Active/Bench switch **if own Bench exists**; legal through Item lock |

These are **not interchangeable**. Their actual winning value can flip based on **which attacker is Active and which is Benched**.

## Authentic rank15 Vileplume lock and four causal decision states

Exact source rank15 contains **AOR Vileplume AOR3 (130 HP, Item lock from Bench), BUS Vileplume BUS6 (140 HP, Basic attack lock while Active), two Stealthy Hood, Path to the Peak, Silent Lab, two Oddish/Gloom evolution chains, two Pidgeot ex**, Guzma and Jet Energy. Suppose BUS is **Active with opponent Hood**, AOR is **Benched**, source Path is in play and no other restriction changes the following stated attack. After gusting AOR Active, BUS goes Bench and its Basic-attack prohibition stops; after KOing AOR the Item lock also ends. Hood on the opponent's Vileplume prevents opponent Ability effects, **not attack damage**.

**State A — own Mewtwo & Mew-GX already Active, paid [P][P][C], GX unused, one unpowered Duskull on own Bench.** v6 **Boss's Orders** promotes opposing AOR, leaves own funded Mewtwo Active, and Mewtwo's **printed Miraculous Duo-GX 200** KOs AOR 130 **through source Path** (Perfection is unnecessary), unlocking Items with no self-KO. v7 **Guzma** must then move paid Mewtwo away from Active to another own Benched Pokémon; without a separate switch/retreat the winning same-turn attack is lost. Under source Path, own Latias ex Skyliner is suppressed. v5 could fetch Hood and TPE if paid, but attacking the original BUS leaves AOR Item lock live. **Boss dominates this precise immediate knockout opportunity.**

**State B — own Duskull Active with zero Energy, own Mewtwo funded [P][P][C] on Bench, GX unused.** v7 **Guzma** promotes opposing AOR **and** switches own Active Duskull out for the funded Benched Mewtwo in **the same Supporter action**. Printed Miraculous Duo-GX200 KOs AOR, unlocking Items without Switch, Energy-paid retreat, or Latias Ability. v6 Boss promotes AOR but leaves unfunded Duskull Active, unable to announce the Mewtwo attack without a separate action. v5 search cannot itself move own attacker. **Guzma dominates this precise position if no other switching effect is available.**

**State C — own Active Clefairy ex with one preattached Basic Psychic, three own Benched Pokémon, Tool slot open, normal Energy attachment unused, two dead Items in hand; actual deck contains Sky Field, Stealthy Hood, Telepathic Psychic Energy, two Basic Psychic Pokémon.** v5 **Guzma & Hala** discards two stranded Items and searches Stadium + Hood + TPE, attaches Hood to Active Clefairy and attaches TPE as second [P][C] Energy while finding two Basic Psychic Pokémon for the Bench. Candidate has five Bench and opponent has at least AOR on Bench: **six combined Bench → Full Moon Rondo 140 → KO Active BUS140** while own Hood protects its Basic attack from BUS. Path can remain in play—playing tutored Sky Field is **not required** and could restore opponent Pidgeot ex Quick Search. v6 Boss gusts AOR but starting 3 own Bench plus newly Benched BUS gives four combined, only **Rondo100**, not a KO of 130HP AOR without additional development. v7 Guzma forces Clefairy away from Active absent a separately paid Benched attacker. **Guzma & Hala supplies a real third action class**, with much higher hand/deck/Bench prerequisites.

**State D — rank2 Stoutland BCR122 Active while AOR Vileplume is Benched.** Stoutland Sentinel locks the *opposing player* out of Supporters. **All v5/v6/v7 flex Supporters fail**, even though Item lock does not itself prohibit them. A legitimately evolved and funded Stage2 Dusknoir's **printed Shadow Bind150** can KO 140HP Stoutland; however source Wild Tackle90 can KO the preceding 90HP Dusclops before evolution. No 1-card Supporter tech resolves this shared failure mode.

All these are **conditional board-action witnesses**, not inferred encounter frequency or observed game results. Source rank15 may use Mega Lopunny/Jet/Guzma, change Stadiums, withhold its Benched AOR, or stop Energy and evolution before a line arises. Only one GX attack per game is allowed, and Mewtwo TAG TEAM itself concedes three Prizes if KO'd. The candidate must have the chosen Supporter available and unused that turn.

## Why matched comparisons matter across the entire field

**Boss's Orders** carries high-value discrete gust access for damaged/high-Prize opponents while preserving own Active; can be dead without an opposing Bench. **Guzma** can resolve both opponent target selection and own Active mobility, important when own Latias ability or Escape Rope is suppressed, but can ruin an already prepared Active attacker by mandatory own switching. **Guzma & Hala** can retrieve a singleton Hood or restore a Stadium against **all four rank8/11/16/22 Absol Garbodor lists' two Temple of Sinnoh copies**, but pays two strategic discards and the Supporter for the turn. Temple makes attached Special Energy Colorless and strips its benefits; Guzma & Hala can search a replacement Stadium before attaching Telepathic Psychic Energy, if its target is in the deck. These options cannot be valued by graph connectivity alone.

Since the three 60s share **59 printed cards** and each flex Supporter is a singleton, their direct first-eight-card chance conditional on Basic-valid opening seven is identically **12.921374758%**. An eligible from-hand Tapu Lele-GX Wonder Tag raises the raw union to **22.849774011%** with target Supporter unprized, but Path or Silent Lab suppresses Wonder Tag and the search route. [Exact finite-opening calculator](../../scripts/2026-11/agent22-guzma-hala-early-channel.py). These are resource-visibility screens, **not** Supporter play or win rates.

**Next test to decide the one slot:** paired original rank15 and rank2 source deals, separately covering paid attacker **Active vs Bench**, source dual-lock evolution timing, Stadium Path/SilentLab, Tool target placement, opponent rational gust/Jet replies, and target attack viability. Include rank11/16 Garbotoxin/Temple and rank6/24 Thorns to measure countervailing costs. Retain all three unqualified arms for that controlled test; do not contaminate the leading Hood Shield nomination or claim 99.5%.
