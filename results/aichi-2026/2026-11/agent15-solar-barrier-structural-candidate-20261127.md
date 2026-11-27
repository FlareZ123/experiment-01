# Solar Barrier: hybrid VMAX / attack-channel protection architecture

**Agent 15 | 27 Nov 2026 | candidate-ranking screen, not nominated | no gameplay or CI.**

## Decision

The current Hood Shield candidate has an all-Shadow-Rider VMAX package, but nine authenticated Aichi Regidrago inventories include *both* Dragapult ex TWM 130 and Kyurem SFA 47. Those are independent attack-effect and attack-damage channels. Two more lists carry Alolan Raichu UNM 57's multi-target damage attack. Test a **Radiant Eternatus → one Shadow Rider VMAX + one Espeon VMAX** branch, with Mew's Bench Barrier, rather than merely trying another copy of a connector.

This is a structurally different *proposal* for later matched candidate comparison. Do not change the frozen Hood/Lockbridge profiles, policies, fixture registration, workflow, or decision board, and do not dispatch. The present data justify keeping this as a conditional challenger, not promotion. The full-field 99.5% goal is unproven.

## Two exact, reversible 60-card experimental alternatives

Solar Barrier v0 derives from the [Hood Shield legal-print 60](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md):

- −1 Shadow Rider Calyrex V CRE 74, −1 Shadow Rider Calyrex VMAX CRE 75, −1 Lillie's Clefairy ex JTG 56.
- +1 Espeon V EVS 64, +1 Espeon VMAX EVS 65, +1 Mew UNB 76.

The exact proposed **Solar Barrier v0** (not a registered game input):

| Count | Pokémon (18) | Print |
|---:|---|---|
|3|Shadow Rider Calyrex V|CRE 74|
|3|Shadow Rider Calyrex VMAX|CRE 75|
|1|Espeon V|EVS 64|
|1|Espeon VMAX|EVS 65|
|1|Mew|UNB 76|
|1|Lillie's Clefairy ex|JTG 56|
|1|Tapu Lele-GX|GRI 60|
|1|Trevenant & Dusknoir-GX|SMP SM217|
|1|Latias ex|SSP 76|
|1|Dialga-GX|UPR 100|
|1|Mimikyu|GRI 58|
|1|Girafarig|LOT 94|
|1|Marshadow|UNB 81|
|1|Radiant Eternatus|CRZ 105|

| Count | Trainers (31) | Print |
|---:|---|---|
|2|Lillie's Determination|MEG 119|
|1|Iono|PAL 185|
|1|Teammates|PRC 141|
|1|Raihan|EVS 152|
|1|Acerola|BUS 112|
|1|Guzma|BUS 115|
|4|Mysterious Treasure|FLI 113|
|4|Fog Crystal|CRE 140|
|2|VS Seeker|PHF 109|
|1|Quick Ball|FST 237|
|1|Hisuian Heavy Ball|ASR 146|
|1|Battle Compressor Team Flare Gear|PHF 92|
|1|Field Blower|GRI 125|
|1|Night Stretcher|ASC 196|
|1|Unfair Stamp|TWM 165|
|1|Float Stone|BKT 137|
|1|Forest Seal Stone|SIT 156|
|1|Sky Field|ROS 89|
|1|Dimension Valley|PHF 93|
|1|Pokémon Ranger|STS 104|
|2|Stealthy Hood|UNB 186|
|1|Arven|SVI 166|

11 Basic Psychic Energy CRE 232. Total **60**, 14 Basics and four VMAX, same as Hood. The three new Pokémon printings (swsh7-64, swsh7-65, sm10-76) are marked Expanded Legal in the provided English corpus. The unchanged cards inherit the prior export's printing-normalized legality evidence; no fresh independent current-banlist or engine-support certification. No new ACE SPEC.

Comparator **Parasol Barrier v0** = exactly the existing Hood Shield legal-print 60, −1 Lillie's Clefairy ex JTG 56, −1 Acerola BUS 112, +1 Mew UNB 76, +1 Big Parasol DAA 157 (swsh3-157, Expanded Legal in provided corpus). This retains 4/4 Rider and sacrifices the healing/pickup Supporter for energy-independent attack-effect protection while the Tool host is Active. Acerola is a deliberate illustrative opportunity cost, not an optimized cut; candidate strength remains unknown.

## Rules-derived matchup channels (not empirical outcomes)

| Known source ranks | Threat | What the new package changes |
|---|---|---|
|10,12,13,14,18,20,21,27,32|Apex Dragon → Kyurem Trifrost (110 damage to 3) | Mew's Bench Barrier prevents attack damage to the Bench; Active remains damageable. |
|same nine|Apex Dragon → Dragapult ex Phantom Dive (200 damage Active, six counters on Bench)| Solar Revelation prevents the counter-placement effect on each Energy-bearing Pokémon; Mew alone does not. Charge Mew before Gate where justified. Neither ability prevents direct Active damage. |
|4,17|Alolan Raichu Electro Rain (30 damage per discarded Lightning Energy, distributed)| Mew protects Bench while in play with Ability enabled; opponent can concentrate damage on Active or gust Mew. |
|8,9,11,16,22|Mega Absol ex Terminal Period (KO exactly six damage counters)| Solar Revelation should protect an Energy-bearing target from this attack's non-damage KO effect, not Claw of Darkness's 200 damage. This is rules inference requiring exact engine and paper ruling challenge. Garbotoxin can suppress the Solar source. |
|31|Dusknoir Cursed Blast / damage-counter movement Abilities| Neither Solar Revelation nor Bench Barrier prevents opposing Abilities; retain Hood. |
|6,24,29 and other locks|Iron Thorns Initialization / Garbotoxin| Solar Revelation on a Rule Box Pokémon may be suppressed; Mew's non-Rule-Box Ability is not suppressed merely by Initialization. Garbotoxin can suppress both. Hood on the relevant protected source is a separate action. |
|12,13,14,20,21,27,32|Apex Dragon → Noivern ex Covert Flight| Attack effects on opponent's attacker are not removed by Solar Revelation; retain Pokémon Ranger. |

Source inventory: `results/aichi-2026/full-decklists.json` Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`, 29 authenticated lists; ranks 23/25/28 missing. At least **11/32** benchmark slots have the two spread-damage channels above. No claim that these attacks are always selected or reachable. The supplied Advanced Player's Rulebook I.A-01 and II.C-07/C-16/C-17/C-18/C-19 distinguish direct damage, counters, attack effects, copied attack damage/effects and player-directed restrictions. Solar Revelation also does not cancel Timeless-GX's extra-turn effect or existing effects, and does not protect an unenergized Pokémon. Big Parasol is an alternative attack-effect barrier that does not require charging each recipient, but only works while its Tool host is Active and enabled: gust, Field Blower, Tool suppression and competition with Float Stone/Hood/FSS matter.

## New offensive line: Max Mindstorm instead of Max Geist

Espeon VMAX's attack costs Psychic + two Colorless and deals 60 × the total Energy attached to all opposing Pokémon. With an enabled Lillie's Clefairy ex, an active Regidrago VSTAR (280 HP) has Psychic Weakness ×2:

| Opposing Energy units | Max Mindstorm with Fairy Zone | Own Psychic needed for Max Geist to reach same Regidrago KO threshold |
|---:|---:|---:|
|2|240 (miss)|5|
|3|360 (KO)|5|
|4|480 (KO)|5|

A conventionally powered Apex Dragon has three energy units unless an applicable cost modifier or subsequent expenditure changes that; count actual provided units, not cards. Against 280 HP without Fairy Zone, five opposing Energy are needed for Max Mindstorm. This is a conditional attack threshold, not a probability of the opponent's board or an automatic favorable Prize trade.

A concrete turn sequence if resources and opponent response permit:
1. Going first, use any required searches, put Mew onto the Bench and manually attach a Psychic to it (protects Mew from Phantom Dive counters once Solar is enabled).
2. Bench Radiant Eternatus last; choose one Rider VMAX and Espeon VMAX from deck. This ends the turn. Do not burn the Energy attachment or Bench slots on autopilot; an ordinary two-Rider Gate remains the default when no public spread or Dragon pressure is known.
3. On the following turn, with Espeon Benched, attach one Psychic using Underworld Door, another manually, and with Dimension Valley in play use a legal pivot (Latias ex Skyliner if Active is a Basic and enabled, or other legal retreat/switch). Fairy Zone must be enabled, the target must be Active, and the opposing Energy count must actually reach three. Additional Energy, a second Door, or later normal evolution can replace the cost reduction. If an attack-cost modifier or opponent lock changes the line, recompute it.
4. If Espeon is instead in hand, the Espeon V line permits normal evolution later, subject to turn age; Gate cannot fetch a VMAX from hand or Prizes.

Important: two simultaneous VMAX targets from Gate are not equivalent: hybrid gives one Underworld Door rather than two (one fewer attachment and two fewer potential cards each turn). Espeon is itself a three-Prize target with 310 HP versus Rider's 320. Mew adds a low-HP Bench target if Solar/its Energy is missing. Removing a Clefairy reduces redundancy exactly where the offensive line needs it. The extra Bench slots are not free. With Mew, Radiant, both VMAX, Clefairy and Latias, the board is already six Pokémon, requiring either Clefairy or Latias to be the starting Active under normal capacity if all five others are Benched. This package must not assume all components simultaneously available.

## Matched physical opening-resource screen

Reproducer: [Python script](agent15-solar-barrier-opening-20261127.py). Executed locally, seed 27112026, 300,000 shuffled 60s, 258,346 valid sevens retained, 41,654 invalid sevens discarded. Shared physical slots map directly between Hood, Solar, and Parasol; exactly 14 Basics and four VMAX. The six Prizes follow the valid seven, then the first normal draw. The route solver assigns **distinct** Fog Crystal/Mysterious Treasure/Quick Ball/Hisuian Heavy Ball connectors and pays an extra physical hand card for each Treasure/Quick Ball, reserves held target cards and honors the Basic-only single Heavy Ball exchange. Searches must be into the correct deck/Prize zone. Radiant forced Active cannot trigger. Starter priority C/L/other Basic/Mew/Radiant is a screening choice, not a calibrated gameplay policy. No extra card draw, FSS, Supporter, opponent compensation, switching, Sky Field, hand disruption, lock, DCI, prize inference or optimal player policy. Connector assignment uses physical locations, so is a feasibility calculation, not an actor-information-certified policy. Parasol and Valley are direct-held only. All reported events overlap unless otherwise noted.

| Restricted opportunity, conditional on a legal seven | Count | Probability |
|---|---:|---:|
|Hood: Gate two Riders|130370|50.46333%|
|Solar: Gate two Riders|118638|45.92214%|
|Solar: Gate one Rider + Espeon|104003|40.25725%|
|Solar: either two-target route|130370|50.46333%|
|Hood two-Rider opportunity converted to hybrid only|11732|4.54120%|
|Solar: hybrid plus Mew Benched|60281|23.33344%|
|Solar: hybrid plus Mew Benched **and charged**|50761|19.64846%|
|Solar: hybrid plus Clefairy in play|64088|24.80704%|
|Solar: hybrid plus funded Mew and Clefairy|20562|7.95909%|
|Solar: hybrid plus Clefairy, Latias and directly held Valley|2668|1.03272%|
|Solar: preceding offensive board plus funded Benched Mew|272|0.10529%|
|Parasol: Gate two Riders, Benched Mew and directly held Parasol|7957|3.07998%|

Sampling SE for 50.46333% is 0.09837 percentage points; for 19.64846% it is 0.07817 pp; for 0.10529% it is 0.00638 pp. The equality of the two-target route events is an exact slot-identity invariant of the restricted model, not merely MC agreement: three Riders plus one Espeon yield two VMAX with at least one Rider exactly when four original Rider slots yield any two VMAX. The lost double-Door option is the disjoint 4.54120 pp event where the only available pair is one Rider and Espeon. The 19.64846% event deploys a *funded Mew* and both protection sources, not universal protection of every Pokémon. The 0.10529% event is only the first-turn board/stadium/attachment resource screen, not the turn-two attack probability.

**Conclusion:** this is a meaningful conditional offensive alternative, not a free defensive upgrade. Do not demand a fully assembled six-Pokémon protection/pivot/Valley board on turn one; the restricted opportunity is only 0.105%. Default to two Riders except in a public-evidence-supported branch. Direct resource screen suggests the Solar/Mew route is easier to assemble before Gate than naturally drawing Parasol, but Arven/FSS and the one-Tool-per-Pokémon conflict must be modeled before comparing actual policies. The Parasol route preserves two Doors and may be preferable when Ability lock rather than Energy access is the problem. No candidate promotion on this screen alone.

## Next decisive test, after owner-controlled execution gates permit

Use the existing shared runner/policy infrastructure, no new workflow. First establish actual Hood/rank1 trace and independent competence as directed by the live decision board. If the observed losses or source-policy challenge cases involve the two spread channels, compare the exact unchanged Hood against the above frozen alternatives on matched rank10/12/13 and rank4/17 cases, plus rank6/11 lock and rank31 Ability-counter negative controls. Candidate policy must branch on actor-visible board/reveals, not hidden source rank labels, and model Gate versus normal evolution, Mew's Energy target, Espeon's attack threshold, opponent gust and source suppression. Require no added qualification gate merely for this proposal. If the hybrid cannot compensate for one lost Door and weaker Clefairy redundancy, discard it; if it earns a clear improvement, then extend to the whole 32-rank panel. No fixture, full game, CI run, frozen-profile edit, or qualified result occurred in this investigation.
