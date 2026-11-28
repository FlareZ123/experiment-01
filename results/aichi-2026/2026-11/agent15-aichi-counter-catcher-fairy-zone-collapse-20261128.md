# An adversarial reply the Eon→Deoxys→Drain frontier missed: Counter Catcher the Fairy Zone host

**Agent 15 | 28 November 2026 | original Aichi inventory scan + exact attack-resolution construction + local conditional state tests. This is a source-policy counterexample, not a natural game or matchup win-rate measurement.**

## Concrete failure mode

The previous [A2 response frontier](agent15-a2-regidrago-response-frontier-20261127.md) counted six chosen source attacks aimed at the Active Deoxys VMAX and found that a well-funded Deoxys plan could take a third two-Prize Dragon KO after all six under favorable assumptions. **That apparent 6/6 counterfactual coverage breaks when the source can choose an alternate attack target via Counter Catcher.** The source has a direct **prize-taking, ability-removing, damage-amplification-denying** play against the *Benched* Lillie's Clefairy ex, not just attacks aimed at Deoxys.

Consider exactly the constructed two-KO prefix:

- Candidate A1: Latias ex **Eon Blade** KOs source Regidrago VSTAR#1 (two Prizes). Source VSTAR#2 copies Noivern ex **Covert Flight**, damaging Latias without knocking it out.
- Candidate A2: one Underworld Door + one manual Psychic funds a **Benched Deoxys VMAX**. Latias retreats under Skyliner to Deoxys, which uses **Max Drain** at 160 × Psychic Weakness from Clefairy's live Fairy Zone =320 to KO source VSTAR#2 (two additional Prizes). Candidate now has **two Prize cards remaining**; source has six remaining in this example.
- Source next turn: a third funded **Regidrago VSTAR is Active** with Muscle Band, Dragapult ex is in the source discard for Apex Dragon, and **Counter Catcher is in hand/playable**. Counter Catcher is legal while source has six remaining Prizes to candidate's two; unlike Guzma and Prime Catcher, it **does not move the source's own Active VSTAR**. It gusts candidate's 190-HP Benched Clefairy ex to Active.
- Source VSTAR uses Apex Dragon copying **Phantom Dive** from Dragon-type Dragapult ex. Against Active Clefairy, **200 +20 Muscle Band −30 Deoxys Protective DNA =190** final attack damage, an exact KO. Clefairy ex gives up **two Prizes**; its ongoing Fairy Zone Ability immediately stops providing Psychic Weakness. Six Phantom Dive damage counters may also threaten the remaining Bench.
- Candidate next turn: Deoxys VMAX can be promoted and still has its two Psychic; it can repeat Max Drain, but **without Fairy Zone its damage is just160 against a fresh 280-HP Dragon Regidrago VSTAR**. It does not take the final two Prizes unless Fairy Zone is restored or an additional genuine damage/target option exists.

This is a legally structured, conditional *counterexample* to extrapolating “Deoxys covers all six replies” beyond its restricted attack-into-Deoxys model. **It does not prove Regidrago wins**, because the candidate may recover/bench a second Clefairy, use Night Stretcher or a tutor if accessible, gust a different weakened target, or survive for additional attacks. Counter Catcher, Band, a ready third VSTAR and discarded Dragapult must all be accessible on the same source turn. The source is not entitled to draw those cards at will.

## Exact field inventories

All nine **authenticated Regidrago source lists** (ranks **10,12,13,14,18,20,21,27,32**) contain at least one **Dragapult ex**, one or two **Muscle Band**, and two or three **Guzma**. A narrower, especially straightforward group has Counter Catcher:

| Original Aichi rank | Counter Catcher | Muscle Band | Dragapult ex | Hisuian Goodra VSTAR | Mega Dragonite ex |
|---:|---:|---:|---:|---:|---:|
| **12** | 1 | 2 | 1 | 0 | 0 |
| **14** | 1 | 2 | 1 | 1 | 1 |
| **21** | 1 | 1 | 1 | 1 | 0 |
| **32** | 1 | 1 | 1 | 1 | 1 |

Ranks **10,18,27** instead have Prime Catcher; all nine have Guzma. **Prime Catcher and Guzma switch their controller's Active as well**, so an otherwise already Active third VSTAR cannot simply remain there to attack after those effects. They may still provide Clefairy gust when the source has engineered an eligible, funded replacement attacker on Bench (for example by deliberately promoting a non-attacker after a KO). That board construction requires separate public-state analysis; do not treat Prime/Guzma as interchangeable with Counter Catcher in opponent policy.

Four published ranks physically contain the Counter+Band+Phantom line; **three** of those ranks (**14,21,32**) additionally have **Hisuian Goodra VSTAR** as a Rolling Iron payload; **two** (**14,32**) also have **Mega Dragonite ex** as a Ryuno Glide payload. All card counts above originate from the published original 29-list inventory file at `results/aichi-2026/full-decklists.json`; mere deck inclusion is **not** simultaneous draw/discard/attack availability.

## Branch matrix under the specified A2 board

Assume a fresh 190-HP Clefairy; live Deoxys Protective DNA, source VSTAR Active with Band unless specified, paid Apex Dragon, an accessible Counter Catcher, and a fresh 280-HP Regidrago VSTAR as the final target. Opponent has six Prizes remaining and candidate two. `Backup` means candidate can legally put a second Clefairy ex onto its Bench next turn by hand/recovery/search, **not** that every deal has one.

| Source copied attack onto gusted Clefairy | Damage to Clefairy | Fairy Zone next turn | Deoxys A3 Max Drain versus fresh VSTAR |
|---|---:|---|---|
| **Phantom Dive**, Band, no backup | **190: KO** | Off | **160: no KO** |
| Phantom Dive, **no Band** | 170: survives at20 HP | On | 320: KO after legal retreat to Deoxys |
| Phantom Dive, Band, **backup accessible** | 190: KO | Restored | 320: KO |
| **Rolling Iron**, Band, backup accessible, **no Ranger** | **190: KO** | Restored | **240: no KO** because source VSTAR's Rolling Iron reduces damage by80 |
| Rolling Iron, Band, backup accessible, **Ranger available** | 190: KO | Restored | 320: KO after Ranger removes attack effect |
| **Ryuno Glide**, no Band, no backup | **300: KO** | Off | 160: no KO |
| Covert Flight, Band | 60: survives | On | 320: KO after legal retreat |

Ranger is a Supporter and can contend with recovery, search or a needed gust on that turn. The copied Rolling Iron reduction is an effect of the attack on source VSTAR; it remains on that Pokémon for the opponent's next turn unless removed, so a freshly restored Fairy Zone alone is insufficient. Ryuno Glide can KO through DNA without Band but requires its source Dragon payload and copies its Energy-discard cost/effect, which may affect future attacking. Damage in the matrix is final damage after the specified Band/DNA; Phantom's six distributed Bench damage counters are **not attack damage** and are not reduced by DNA.

If candidate's own Clefairy is already damaged, Band may not be required; if DNA is suppressed, different damage applies. If Item lock is active, Counter Catcher is not playable. If source's remaining Prizes are **not greater** than candidate's, Counter Catcher fails its printed condition. If Dragapult or Goodra is not in the source discard, Regidrago cannot copy its attack yet. Those are real legality and reachability gates, not minor probabilities to ignore.

## Practical fixed-deck and source-policy change

A credible opponent worker must evaluate **gusted support knockouts, their lost continuous Abilities, the resulting damage-weakness map, and immediate Prize race**, rather than merely choosing a listed attack against current Active Deoxys. In a source rank with Counter Catcher live while behind, `Counter Catcher → Clefairy → Band Phantom` can dominate `Phantom into Deoxys`: it gains two Prizes and removes the weakness amplifier. `Counter Catcher → Clefairy → Band Rolling` is even more disruptive when its payload is accessible, requiring both a replacement Clefairy and Ranger for an A3 repeat Drain. These are reasons to **test source best-response search**, not to assign a win percentage.

The candidate should recognize this risk **before** selecting hybrid Gate or exposing its sole Clefairy: conserve a legal second Fairy Zone route (second copy, Fog Crystal, Night Stretcher, Hisuian Heavy Ball as applicable) until the terminal two-Prize turn, or establish a different OHKO line not dependent on Clefairy. A second Clefairy prematurely on Bench may itself take Phantom damage counters; keeping it in hand until needed is a potential defensive improvement, subject to hand disruption/UDP tradeoffs. Whether the fixed 60 has sufficiently reliable recovery is unknown without full actor-only game states.

This makes the earlier D=6/6 row **non-generalizable**, not numerically “wrong” within its old stipulated attacks that did not gust. No earlier simulator, Stage-A fixture or source worker was retroactively altered. The correct next integration is an **adversarial source counterplay regression** and conditional backup-Clefairy reserve in the approved successor policy, not an immediate card swap.

## Executable checks and limits

[Conditional Counter Catcher response model](../../../scripts/2026-11/agent15-clefairy-counter-gust.py) tracks exact source/candidate Prize counts, counter eligibility, paid/available Apex payload, source Band and candidate DNA, Clefairy HP/KO, Fairy Zone liveness, last VSTAR HP, Rolling reduction and candidate's backup/Ranger permissions. It deliberately does not simulate full board setup, cards drawn/held, opponent AI or full games.

[Local regression suite](../../../tests/2026-11/agent15-clefairy-counter-gust.test.py) passed: 190 exact KO; absent Band170 survival; restored Clefairy320 versus no Fairy160; Rolling240 without Ranger; Ryuno300 without Band; Counter disabled for wrong Prize differential/Item lock; unavailable Apex/payload; exact rank subsets. Run: `python tests/2026-11/agent15-clefairy-counter-gust.test.py`.

**Research benchmark:** 29 published Aichi sixties authenticated; ranks23/25/28 not fabricated. Zero qualified competitive full-field matchups, no proven 99.5% target, no fixed deck promoted. No native game, worker, CI, vendor code or fixed deck was changed.
