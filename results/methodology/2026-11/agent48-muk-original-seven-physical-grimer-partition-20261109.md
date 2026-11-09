# Distinguishing one- and two-Grimer initial sevens in the rank6 lock screen

**Agent48 | 9 November 2026 | exact probability enumeration, no native games**

The historical `candidateForcedActiveMuk()` proxy grouped all Basic-valid starting sevens whose only Basic *species* was Alolan Grimer. It reported `2.9657930129%` after requiring access to a first-eight Boost Shake and at least one unprized Alolan Muk. That event mixes two materially different physical starting boards. If both Grimer are in the opening seven, a player can choose one Active and Bench the other before trying to Boost Shake the Benched Grimer. The initial Active-Grimer-only geometry is therefore not forced.

A new pure `candidateMukOriginalSevenPartition()` in [the original source model](../../../simulation/evaluation/agent43-muk-thorns-firstturn-collision.cjs) enumerates the first eight with `[2 Grimer, 2 Muk, 3 Shake, 10 other Basic, 43 filler]`; the eighth-card weight separates exactly one Grimer in the *original seven* from two. It conditions on a Basic-valid original seven and the six-Prize survival of at least one Muk, assuming independent original shuffles:

| Class among Basic-valid original seven | Exact conditional first-eight access |
| --- | ---: |
| Exactly one Grimer and zero other Basic in original seven | **2.7939290945%** |
| Both Grimer and zero other Basic in original seven | **0.1718639184%** |
| Historical broad Grimer-only *species* | **2.9657930129%** |

The two classes are disjoint and sum to the unchanged broad historical total. The original rank6 Iron Thorns G&H/Tag Call plus DCE/Thunder Mountain paper opportunity estimate is `32.9109095975%` under its independently conditioned opening. An **independent** product for the strict single-Grimer class is therefore **0.9195074785%**, while the historical broad product is **0.9760694573%**. Neither product accounts for opponent mulligan compensation, adversarial sequencing, Item lock, discard affordability, escape mobility, source response, or play outcomes. In particular the one-Grimer-seven class can draw or search another Grimer on the eighth/action turn and may no longer be forced Active.

The patch retains legacy output fields for reproducibility and adds appropriately named strictly partitioned fields; the original model test checks all fractions and products. This resolves the open #21 initial-seven two-Grimer classification, without claiming the additional search-assisted Bench-availability metrics are already modeled or changing the candidate 60. This is **zero competitively qualified games**.

## Added first-own-turn Bench alternatives and anti-Rope geometry

The same model now exposes `candidateMukBenchOpportunityWindows()` with two separate cases. For a selectable Bench Muk by the first own turn, the opening seven must already contain a non-Grimer Basic that can be designated Active, or both Grimer must already be in the original seven. A non-Grimer Basic drawn as the eighth card **cannot retrospectively change a sole Active Grimer**. Exact first-eight access under the published Apex Alchemy counts is **6.4688453394%** with naturally found Grimer, and **20.2958723433%** when allowing Mysterious Treasure/Quick Ball access without modeling real payment or Item locks. Both figures remain optimistic setup screens.

For the stronger geometry where the candidate can have a Muk on the Bench plus **another distinct Benched Pokémon** by the first own turn, at least three physical Basics must be available, counting the fetched Grimer when applicable. The first-eight direct access is **2.9829101534%**; the first-eight search-only class adds **6.4899397251%**, giving **9.4728498785%**. This matters because opponent Escape Rope cannot choose which of two different Benched Pokémon the defender promotes. Search-assisted probabilities ignore discard affordability, Item lock, Bench occupancy changes, and whether the candidate elects that placement. All numbers condition on a Basic-valid original seven, fixed printed candidate 60, the first eight and six Prize cards. These are availability bounds rather than native game success or the 99.5% target.
