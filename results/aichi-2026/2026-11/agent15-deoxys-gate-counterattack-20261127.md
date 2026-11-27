# Gate counterattack: Deoxys is the stronger conditional challenger

**Agent 15 | 2026-11-27 | candidate ranking and policy competence | development-only conditional branches, not match wins.**

## Decision

Prioritize the fixed **Deoxys Gate v0** challenger below over Solar Barrier and Espeon-only if owner-approved candidate testing becomes available. Keep Hood as the reference; this is not nomination, qualification, a change to any frozen profile, or permission to dispatch. Nine authenticated source ranks (10,12,13,14,18,20,21,27,32) are Regidrago and carry both Phantom Dive and Trifrost sources. A single Psychic VMAX with a fixed attack and continuous VSTAR-specific mitigation addresses both tempo and damage without giving up the second Clefairy or spending a Bench slot on Mew. The earlier opening-only [Solar/Parasol screen](agent15-solar-barrier-structural-candidate-20261127.md) remains valid for its narrower question; the new combat branches materially change its ranking.

## Exact proposed 60 (not registered for dispatch)

Starting from the existing [Hood Shield expanded print export](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md), change **-1 Shadow Rider Calyrex V, -1 Shadow Rider Calyrex VMAX, +1 Deoxys V, +1 Deoxys VMAX**. Both added cards are international Black Star Promos with supplied English corpus Expanded Legal fields (swshp-SWSH266 and swshp-SWSH267). The prior unchanged 58-card printing audit is inherited; this is not a fresh current tournament/engine-support certification.

### Pokémon — 18

| Count | Card | Printing |
|---:|---|---|
|3|Shadow Rider Calyrex V|CRE 74|
|3|Shadow Rider Calyrex VMAX|CRE 75|
|1|Deoxys V|SWSH Black Star Promo SWSH266|
|1|Deoxys VMAX|SWSH Black Star Promo SWSH267|
|2|Lillie's Clefairy ex|JTG 56|
|1|Tapu Lele-GX|GRI 60|
|1|Trevenant & Dusknoir-GX|SMP SM217|
|1|Latias ex|SSP 76|
|1|Dialga-GX|UPR 100|
|1|Mimikyu|GRI 58|
|1|Girafarig|LOT 94|
|1|Marshadow|UNB 81|
|1|Radiant Eternatus|CRZ 105|

### Trainers — 31

|Count|Card|Printing|
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

### Energy — 11

11 Basic Psychic Energy CRE 232. Total **18 + 31 + 11 = 60**. No new ACE SPEC. A separate Espeon-only comparator makes the same 1/1 swap with EVS 64/65. Solar Barrier additionally trades one Clefairy for Mew UNB 76. All are distinct fixed proposals.

## Tactical solution, not merely connector access

- Radiant Eternatus can put Rider VMAX and Deoxys VMAX directly onto Bench, then ends the turn. Both are Psychic VMAX, therefore eligible for Door and Dimension Valley. With Valley and an available manual attachment plus one Underworld Door attachment, Deoxys reaches its `P C C` Max Drain attack (160, healing 30), reduced to `P C`. Enabled Fairy Zone doubles the damage to 320 against a Dragon VSTAR with 280 HP regardless of how many Energy cards/units the source retains. It is a two-Prize return KO if no opposing prevention or mitigation changes the result. Without Fairy Zone, 160 is not enough.
- Protective DNA reduces damage from opposing Pokémon VSTAR to **all** our Pokémon by 30 after Weakness/Resistance. Regidrago VSTAR remains a VSTAR while using Apex Dragon as another attack; the copied card's identity does not change the attacker. Consequently Phantom Dive's 200 Active damage becomes 170, but its six damage counters on the Bench are not damage and remain. Trifrost's 110 per selected Pokémon becomes 80. It does not require an Energy on the protected target. A live Clefairy (190 HP) survives 170 on Active; 170 HP Tapu Lele does not. Latias 210, Rider V 210 and Trevenant & Dusknoir 270 survive either 200 or 170 in the modeled Dragon matchup.
- The two attacks are strategically different: Trifrost discards all attached Energy from the attacker, so when no other opposing Energy remains, Espeon Max Mindstorm deals zero. Deoxys still does 160 (320 with Fairy Zone). Against wide boards Clefairy's Full Moon Rondo is often better than either VMAX: 5 total Benched Pokémon gives 240 with weakness (enough for a 220 HP Dragon V); 6 total gives 280. With Valley the Rondo cost becomes P. Sky Field can enlarge the candidate Bench but replacing it with Valley discards down to five, so Rondo thresholds must be evaluated after that discard.
- Revised starting Active policy uses only the candidate's own opening, in priority L, Rider V, Trev/Dusk, alternative V, Clefairy, Tapu, Girafarig, Marshadow, Mimikyu, Mew, Dialga, Radiant. It does not observe the opponent's unrevealed opening. It is a **Drago-branch competence candidate**, not a claim this order is optimal against Darkness or every archetype; starting the 3-Prize TAG TEAM may be dangerous elsewhere.
- First-going adaptive Gate picks two Riders if possible unless a held Valley route supports hybrid, or only hybrid is possible. Second-going adaptive Gate prefers a hybrid whenever possible in these Regidrago challenges. A competing policy that selects two Riders on a wide public board if Clefairy is reachable gives up mitigation too often (see below). No future draw oracle. Only a real source-revealed matchup policy may use the matchup label in a full game.
- After the Gate turn, before attacking, use actual Door/manual attachment, old-Basic evolution, a real retreat or free Latias/Float pivot, and select Rondo when the visible board can reach the required threshold. A KO-triggered Raihan can attach to an Active attacker, unlike Door. Do not force a VMAX attack when a cheaper two-Prize Rondo is already available.

## Reproducible holdout

Exact executed [Python source](agent15-gate-counterattack-20261127.py), Git blob 1d97ea325c6d0d9b956420488d9095d30d7589b7, committed 173e40669fa9af62215120d6115c0bf635e19d67. Standard library only. This **offline, restricted action-state model** is not a new Twinleaf game harness, no CI or workflow was invoked. It conserves the 60 physical slots, checks one-Tool occupancy, separate attachment budgets, actual card zones, legal own evolution age, two Gate Bench slots plus Radiant, search/payment contention, Basic-valid opening seven and six unknown Prize slots. Direct search, Fog/Treasure/Quick/Heavy Ball, VS Seeker/Compressor, FSS, Night Stretcher, Arven, Lillie/Iono, KO-triggered Raihan/Teammates/Unfair Stamp, actual manual/Doors, Sky Field replacement discards, damage/KO/promote and retreat are represented. Assumes K1 zone feasibility and a specified heuristic, not optimal policy or perfect hidden-information model. FSS/Float host contention and actual printed retreat costs are accounted for; preliminary pre-fix pilots are superseded.

Reproduce with:
```bash
for seed in 27112050 27112051 27112052 27112053; do
  for branch in phantom trifrost; do
    python agent15-gate-counterattack-20261127.py 2000 "$seed" "$branch" hood_robust,hood,solar_adapt_robust,solar_offense_adapt_robust,deoxys_adapt_robust,deoxys_choice_robust,solar_choice_robust
  done
  python agent15-gate-counterattack-20261127.py 1500 "$seed" quiet hood_robust,hood,solar_adapt_robust,solar_offense_adapt_robust,deoxys_adapt_robust
done
```
8,000 attempted/6,927 legal opening deals per combat branch; 6,000 attempted/5,213 valid for quiet (same seeds, subsets of physical deals). These are matched branches, not 19,067 distinct independent openings. Denominator includes valid hands failing the exact two-VMAX Gate route, counted as zero for this particular T2 route. Quiet first-going target is a fresh 220 HP Dragon V with 2 Energy units; quiet second-going target is a fresh 280 HP Dragon VSTAR with 3 Energy units, **not** a prediction it always reaches that board. The two second-going combat cases condition on source having a legal Apex Dragon and attack source available, no other interference or Gust. Source selects Trifrost targets to maximize immediate Prizes, then tactical board disruption and damage; Phantom Dive puts all six counters on an unprotected 60 HP Mew if present, otherwise its highest-priority eligible target. Source policy is fixed and public-board-only, not a full opponent model. Trifrost leaves no opposing Energy anywhere in the test. Source's Bench count is a stipulated public scenario held constant, not sampled from a source deck. No source response after our counterattack.

## Combat branch results

Percent of valid openings that execute the modeled legal T2 route and KO the 280 HP active VSTAR. `Efficient` is the subset of those returning a KO after conceding fewer than two Prizes on the intervening attack (not a whole-game metric). `Lost|Gate` is mean source Prizes conceded conditional on a successful T1 two-VMAX Gate, so conditional denominators may differ slightly between architectures. `Net|Gate` is (2*return KOs - source Prizes)/Gate count, **only** the isolated two-attack exchange. No Gate is not interpreted as an actual game loss.

| Source action | Opp Bench | Hood old policy KO | Hood robust KO | Solar full robust KO | Espeon-only robust KO | Deoxys robust KO | Deoxys minus robust Hood (paired 95% MC approx) |
|---|---:|---:|---:|---:|---:|---:|---:|
|Phantom Dive|0|4.98%|7.25%|13.57%|16.40%|16.18%|+8.94 ±0.92 pp|
|Phantom Dive|2|30.23%|39.37%|32.05%|39.54%|42.40%|+3.03 ±0.86 pp|
|Phantom Dive|4|32.08%|41.53%|33.82%|41.49%|44.25%|+2.71 ±0.85 pp|
|Trifrost|0|6.51%|8.10%|1.69%|1.96%|16.76%|+8.66 ±0.94 pp|
|Trifrost|2|38.46%|44.26%|33.07%|41.11%|44.48%|+0.22 ±0.75 pp|
|Trifrost|4|40.31%|46.15%|34.73%|43.03%|45.68%|−0.48 ±0.72 pp|

|Source action|Opp Bench|Hood robust efficient|Deoxys efficient|Hood Lost / Net given Gate|Deoxys Lost / Net given Gate|
|---|---:|---:|---:|---:|---:|
|Phantom Dive|0|7.13%|15.43%|0.588 / −0.408|0.315 / +0.088|
|Phantom Dive|2|32.93%|39.58%|0.588 / +0.392|0.315 / +0.741|
|Phantom Dive|4|34.26%|41.04%|0.588 / +0.446|0.315 / +0.787|
|Trifrost|0|8.08%|16.66%|0.316 / −0.115|0.228 / +0.189|
|Trifrost|2|44.26%|44.43%|0.184 / +0.919|0.129 / +0.979|
|Trifrost|4|46.15%|45.68%|0.136 / +1.013|0.096 / +1.042|

Deoxys width-sensitive policy (two Riders when Clefairy is accessible and public source Bench >=2) misses the mitigation: Phantom Dive 38.99%/41.11% at bench 2/4, and conditional losses 0.545 versus 0.315 for always-hybrid when possible. Thus choosing more Doors because Rondo damage is available is not always correct. The source attack opportunity is an immediate competing objective. Wide Trifrost width-sensitive 43.84%/45.62%, versus 44.48%/45.68% preferred hybrid. Do not optimize using a VMAX-only attack metric: it exaggerates Espeon's value and ignores Clefairy.

## Quiet tempo control

First-going T2 KO of 220 HP Dragon V, second-going T2 KO of 280 HP Dragon VSTAR. No opposing damage/lock; same legal opening denominator.

|Role / Opp Bench|Hood old policy|Hood robust|Espeon-only robust|Deoxys robust|Deoxys − Hood robust|
|---|---:|---:|---:|---:|---:|
|first / 0|23.54%|24.50%|24.75%|24.30%|−0.19 ±0.66 pp|
|first / 2|29.52%|31.17%|32.02%|31.56%|+0.38 ±0.63 pp|
|first / 4|29.52%|31.17%|32.02%|31.56%|+0.38 ±0.63 pp|
|second / 0|7.52%|8.52%|16.46%|15.90%|+7.39 ±1.03 pp|
|second / 2|43.37%|46.90%|46.06%|45.23%|−1.67 ±0.78 pp|
|second / 4|44.06%|47.86%|47.15%|46.35%|−1.52 ±0.77 pp|

Approximate paired MC interval uses the discordant-pair variance, not uncertainty about the world/model. No multiple-comparison claim or matchup weighting. First-going adaptive hybrid is approximately neutral in this resource branch. The robust **same-list** starter and attachment change itself improves Phantom Dive counterattack at width 2/4 by 9.14/9.46 pp and lowers conditional mean Prizes conceded from 0.975 to 0.588. That policy improvement should be retained as a concrete hypothesis even if the Deoxys 60 is rejected.

## What this does not establish

No game win rates, no estimate of the real likelihood that either source attack is reached, no dominance claim for all opponents, no multi-turn prize race, no Timeless-GX/extra turn, Gust, opponent Stadium replacement, hand disruption, effects beyond the modeled branch, or full engine equivalence. The model restricts to an exactly two-target first-turn Gate and omits many legal alternative attacks, recovery plays and full Trainer effects, including Guzma/Acerola, ordinary evolution without Gate, and natural alternative VMAX evolution. Deoxys cannot block effect damage counters, ability effects, non-VSTAR attackers or player-directed restrictions. An active Iron Thorns or other suppressor can remove DNA. Losing a Door reduces ongoing draw and Energy economy; this is the next real risk, not measured by a two-turn exchange. Dark weakness, high retreat, lock matchups, support liabilities, source extra turns and repeated attacks are unresolved. Do not imply that the 29 known lists are the full field: 23/25/28 remain unauthenticated, zero qualified games, no selected fixed 60, 99.5% remains unproved.

**Next decision:** if authorized, compare these exact 60s and the two starter policies in paired full matches using existing owner-controlled infrastructure, with all-nine Drago source profiles plus non-Drago stress (Iron Thorns, Raichu, Mega Absol, lock, mirror and Meloetta). Preserve original list and policy until actual evidence is available; do not introduce another admission gate.
