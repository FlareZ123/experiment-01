# Apex Alchemy versus original rank26: bidirectional Basic Ability exposure under Alolan Muk

**Agent 2 | 3 November 2026 | static printed-card and turn-geometry audit, zero competitive games**

## Exact matched printed-60 susceptibility inventory

From the authenticated rank26 Hibiki Yamada *Meloetta Donk* original source 60 and the **unchanged frozen** Apex Alchemy v0 and Shake4/Quick2 v1 candidates, the supplied original English card-identity texts establish the following **conditional susceptibility** when SM1 58 Alolan Muk's *Power of Alchemy* is operating:

| Exact printed 60 | Basic Pokémon copies | Copies with an Ability that Muk removes | Distinct exposed Ability names |
| --- | ---: | ---: | ---: |
| **Original rank26 Meloetta** | 12 | **11** | **7** |
| **Apex Alchemy v0** | 12 | **3** | **3** |
| **Apex Alchemy v1** | 12 | **3** | **3** |

These are **inventory counts**, not the number of live Abilities simultaneously denied, affected turns, successful lock plays, or wins. Muk affects Basic Pokémon in play, in each player's hand and in each discard pile. It does not strip the Abilities of non-Basic Pokémon or Pokémon remaining in the deck or Prize cards.

The exact source rank26 Ability-bearing Basic identities are **4 Unown AOR 30** (*Farewell Letter*), **2 Exeggcute PLF 4** (*Propagation*), and one each of **Tapu Koko Prism Star TEU 51** (*Dance of the Ancients*), **Meloetta ex BLK 44** (*Debut Performance*), **Squawkabilly ex PAL 169** (*Squawk and Seize*), **Crobat V DAA 104** (*Dark Asset*), and **Dedenne-GX UNB 57** (*Dedechange*). Its remaining Basic, **Bunnelby PRC 121**, has the **Ω Barrage Ancient Trait** instead of an Ability; Muk does not remove that Ancient Trait.

The Apex frozen 60s expose their **Kyurem SFA 47** (*Plasma Bane*), **Tapu Lele-GX GRI 60** (*Wonder Tag*) and **Latias ex SSP 76** (*Skyliner*) Basic Abilities to their own Muk. They preserve six non-Basic Ability-bearing copies outside Muk's Basic class: three Regidrago VSTAR (*Legacy Star*), two Alolan Muk (*Power of Alchemy*), and one Hisuian Goodra VSTAR (*Moisture Star*). Both Apex registered Pokémon inventories and their complete 60-card SHA-256 identities are unchanged.

## Essential tactical adjustments to the inventory counts

The original rank26 has **zero Colress-named cards**. The candidate Kyurem's printed *Plasma Bane* specifically requires a Colress-named card **in its opponent's discard pile** to reduce Kyurem's own Trifrost attack requirement. Under ordinary printed owner/discard rules against this exact source 60, Kyurem's own prerequisite does not occur, with or without Muk. It is a raw self-exposed copy with negligible direct Kyurem Ability opportunity in this matchup.

The rank26 Meloetta's printed *Debut Performance* grants first-turn attack permission **only when its player goes first**. If rank26 goes first, the opponent's Stage 1 Alolan Muk cannot already be established through its ordinary setup before rank26's first turn; candidate Boost Shake can only be played on the candidate's later first turn. If rank26 goes second, first-turn attack permission is normally already available, making the Ability unnecessary. Thus a static inventory counts one Meloetta Ability copy without a realistic Muk-deniable first-turn attack restriction under these setup rules. The *first-turn going-first Meloetta* vulnerability therefore remains an independent failure mode of a Muk strategy.

After excluding these two specifically demonstrated non-applicable Ability opportunities for this exact pairing, **ten original-source Basic copies and two Apex Basic copies remain within printed potentially meaningful Ability categories**, subject to each card's own requirements. This is a *screen of potentially useful options*, not a suppression-success metric or a point score. Source Unown, Exeggcute, and Koko cannot automatically be assumed active in every game.

Most importantly, Apex's **own** Latias ex *Skyliner* (retreat enabling) and Tapu Lele-GX *Wonder Tag* (Supporter searching on Bench entry) are disabled while its Muk is operating; this is a genuine structural sequencing cost which may outweigh the opponent-side breadth in individual states.

## Computation and collaboration

- [Original rank26 exact Basic-Ability census](../../scripts/agent2-rank26-basic-ability-exposure.cjs), with [source-print and Ancient Trait tests](../../tests/agent2-rank26-basic-ability-exposure.test.cjs), uses the source registered roster and the provided English card archive.
- [Both unchanged Apex self-exposure census](../../scripts/agent2-muk-bilateral-basic-ability-matrix.cjs) and [same-60 tests](../../tests/agent2-muk-bilateral-basic-ability-matrix.test.cjs) verify card IDs, 12 Basic copies, 3 self-suppressed Basic copies, 6 preserved non-Basic Ability copies, and source 11/12.
- A source printing alias is handled explicitly: the rank26 roster uses **Tapu Koko ♢**, while the original English card database prints **Tapu Koko ◇**. Both resolve to the same TEU 51 / `sm9-51` physical identity; normalization does not merge different numbered cards.
- [CI 41715017275](https://github.com/FlareZ123/experiment-01/actions/runs/41715017275) passed the source and bilateral source-identity tests after correcting that alias. A later one-test printed-conditional guard was added; the original six pass receipt remains valid for the underlying census.
- [Agent43's 13-case native Muk/Exeggcute/Cologne staged receipt](https://github.com/FlareZ123/experiment-01/actions/runs/41682005018) confirms conditional Ability propagation effects and distinguishes **Active Muk**, where Cologne silences it, from **Benched Muk**, which Cologne cannot affect.
- [Agent2's exact original source first-turn Cologne access through held direct, three Pad and Mail](../statistics/agent2-rank26-mail-pad-cologne-joint-20261103.md) computes 29.83252% with modeled 12-Basic-opponent mulligan bonuses. The existing specialized source `rank26-cologne-opener.cjs` presently selects only against opposing Active **Iron Thorns ex** or **Klefki**; it does not explicitly activate against Active Muk. Further natural-deal action-policy counterplay is required.

## Limitations

All three cards in the candidate self-exposure table are **known copy-level static susceptibilities**. Print effects need actual timing, Bench space, owner choice, card residency, attack costs and simultaneous conflicting lock state to measure value. Merely counting Ability names would be a misleading optimizer reward. The opponent can have its own locks or countertools; the candidate has yet to demonstrate an attack-funding cycle and opponent reply under an authenticated, qualified full game.

The benchmark remains **29 of 32 original source sixties**, the missing ranks **23/25/28**, **zero competitively qualified games**, no selected final 60, and **no demonstrated 99.5% field win rate**.
