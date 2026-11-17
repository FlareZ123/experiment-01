# Copycat–Apex–Timeless Prize risk: core exposure is not the Heavy Ball capacity cut

**Agent 35 · 17 November 2026 · exact-model reconciliation.** No new card interaction, deck variant, fixture, game, or win-rate estimate.

## Decision

The 19.15% figure in the 15 November Agent3/Agent6 reports is the probability that at least one of the two singleton Basic core cards (Mimikyu or Dialga-GX) is in the six Prizes **before recovery**. It is not the actual Prize-only unavailability probability for the current Hood 60, because that 60 also contains one Hisuian Heavy Ball, which can retrieve one Prized Basic.

The repository already has the more complete calculation: Agent6's 7 November two-Basic min-cut and Agent21's multiplicity extension both account for Heavy Ball capacity. For the current 1 Mimikyu / 1 Dialga / 1 Heavy Ball / 14-Basic list, the **optimistic Prize-zone recovery-capacity cut is 2.366909% conditional on a legal seven-card opening**, not 19.15%. This assumes every Heavy Ball outside Prizes is accessible and usable. It does not model Item lock, drawing/searching Heavy Ball, or the attack line's other requirements.

The two numbers are useful, but they answer different questions. Do not compare them as if they were the same event.

## Three distinct events

Let M, D and H indicate that the unique Mimikyu, Dialga-GX UPR 100 and Hisuian Heavy Ball ASR 146 respectively are in the initial six Prizes.

1. **Core-Prize exposure (no recovery):** M OR D. At least one required Basic is Prized. This is 19.152542% under an unconditional six-Prize partition, or 18.766341% conditional on a legal initial seven for the 14-Basic Hood list. It is an upper-bound stress case if Heavy Ball cannot be used; it is not the actual cut while a usable Heavy Ball can retrieve one missing Basic.
2. **Optimistic Prize-only capacity cut (one Heavy Ball available):** (M AND D) OR (H AND (M OR D)). Either both required Basic roles are Prized, so one Ball cannot recover both, or Heavy Ball is itself Prized alongside at least one required Basic. This is **2.3669091034%** conditional on a legal initial seven.
3. **Actual executable counterline failure:** depends on more than Prize composition—whether Heavy Ball can be drawn/searched and played, whether Item lock is active, whether Mimikyu can be placed Active and powered, whether Dialga is in the required discard zone, whether the opponent used Apex Dragon last turn, whether the GX allowance remains, and whether the line survives the opponent's response. None of the cited Prize models estimates this event.

The exact two-Basic capacity model and its multivariate Prize/valid-opening conditioning are in [Agent6's original min-cut](agent6-champion-copycat-two-basic-prize-mincut-20261107.md) and [Agent21's independent multiplicity extension](agent21-copycat-prize-access-multiplicity-sensitivity-20261107.md). Agent50's [Hood DCI/AMR policy specification](agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md) correctly uses the 2.366909% capacity-cut value.

## Reconciled values for the current 1/1/1 package

| Quantity | Probability | Interpretation |
|---|---:|---|
| At least one core Basic Prized, unconditional six-Prize partition | **19.152542%** | No-recovery core exposure; includes many states Heavy Ball can rescue |
| At least one core Basic Prized, conditional on valid seven | **18.766341%** | Same exposure under legal-opening conditioning |
| Both core Basics Prized, conditional on valid seven | **0.808671%** | One Heavy Ball cannot recover both |
| Heavy Ball Prized with at least one core Basic, conditional on valid seven | **1.614441%** | Recovery Item unavailable from Prizes while a core is missing |
| All three named cards Prized, conditional on valid seven | **0.056203%** | Overlap between the preceding two cut components |
| **Optimistic capacity cut with one Heavy Ball, conditional on valid seven** | **2.366909%** | Correct Prize-zone min-cut when every unprized Heavy Ball is usable |

The exact conditional fractions are:
- core exposure: 162938799/868250240;
- both core Basics Prized: 702129/86825024;
- Heavy Ball plus at least one core Prized: 666561/41287424;
- all three Prized: 63813/113540416;
- capacity cut: 139744719/5904101632.

The capacity-cut identity is the union of both-core-Prized and Heavy-Ball-plus-at-least-one-core-Prized; subtract their overlap (all three Prized). This reproduces Agent21's 1/1/1 value exactly.

## Field-budget interpretation

There are 11/32 Regidrago archetype entries (nine authenticated source lists and two missing exact lists). Under the equal-rank field mean, if every other matchup were a perfect win and **every occurrence of a Prize event were an automatic loss**, the hypothetical field-loss contributions are:

| Event treated as an automatic Regidrago loss | Per-Regidrago probability | 11/32 field contribution |
|---|---:|---:|
| Core exposure with no Heavy Ball recovery | 18.766341% (valid-seven conditional) | **6.450930 percentage points** |
| Optimistic Heavy Ball capacity cut | 2.366909% (valid-seven conditional) | **0.813625 percentage points** |

The 19.152542% unconditional core-exposure value gives 6.583686 percentage points under the same simple 11/32 weighting, as Agent6's 15 November report calculated. These are **no-recovery stress bounds**, not expected losses. The 2.366909% capacity cut gives 0.813625 percentage points if every such cut loses. That still exceeds the 0.5% total field-loss budget under the deliberately extreme all-cuts-lose assumption, but it does not establish that a game is lost when this one attack route is cut off.

A second Heavy Ball reduces the same 14-Basic Prize-only capacity cut to **0.219492%**; this is a mathematical sensitivity, not authorization to alter the 60. The slot cost and matchup value are unresolved. The 2/2 core result in a model that ignores Heavy Ball recovery is not comparable to the 2/2-plus-one-Ball capacity cut.

## Reconciliation of existing reports

- [Agent3, 15 November](agent3-hood-copycat-prize-reliability-20261115.md) correctly calculates raw core-Prize exposure for the two one-of Basic roles, but its phrase “prize-only failure rate” can be misread as accounting for the deck's Heavy Ball. Read its 19.15% as the **no-recovery core-exposure bound**.
- [Agent6, 15 November](agent6-apex-copycat-prize-failure-field-budget-20261115.md) uses the same no-recovery core-exposure event for its 19.15% / 10.79% / 1.69% table and field-budget stress case. Those figures are not the current list's Heavy-Ball-aware Prize min-cut.
- [Agent6, 7 November](agent6-champion-copycat-two-basic-prize-mincut-20261107.md) already models one Heavy Ball's capacity and reports the 2.366909% cut, conditional on a valid opening.
- [Agent21, 7 November](agent21-copycat-prize-access-multiplicity-sensitivity-20261107.md) independently generalizes and reproduces that Heavy-Ball-aware model, including 0.219492% for two Heavy Balls with the same 14-Basic count.
- [Agent50, 13–14 November](agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md) correctly cites Agent21's 2.366909% capacity cut and 0.813625 pp all-cuts-lose field stress.

The 15 November raw-exposure results remain useful as a **no-recovery ceiling** for states where Item access is unavailable (for example, while an applicable Item lock prevents Heavy Ball). The Heavy-Ball-aware cut is the **optimistic Prize-zone floor** when the unprized Ball is accessible and usable. The Prize-zone component ranges between these endpoints depending on Item-lock timing and access; total executable-line failure can be higher because of non-Prize game-state requirements. Neither endpoint is a matchup loss estimate.

## Practical conclusion

For the Hood 60, a policy must distinguish:
- core identity in Prizes;
- Heavy Ball in Prizes versus outside Prizes;
- whether the Item is currently playable under the opponent's lock;
- whether using Heavy Ball is strategically worth the Item/turn/resource cost;
- whether an alternate attack route is available.

Do not mark the Apex→Timeless route dead merely because one core Basic is Prized if a usable Heavy Ball remains. Conversely, do not assume Heavy Ball solves the problem when Budew/Vileplume Item denial is active or when the Item cannot be accessed in time.

This clarification changes no candidate, does not authorize a new test, and makes no 99.5% claim. The unresolved strategic question is whether the fixed 60 can still win reliably when this specific Copycat route is unavailable—not whether the raw Prize exposure number alone predicts a loss.
