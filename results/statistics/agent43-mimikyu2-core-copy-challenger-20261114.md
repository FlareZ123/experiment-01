# Agent 43 — Mimikyu-2 / Dialga-1 / Heavy Ball-1 whole-deck challenger

**14 November 2026 · Structural challenger and slot-cost hypothesis · No game or matchup evidence**

## Decision

Create one explicit 60-card challenger by changing exactly one Basic-Pokémon slot in Hood Shield Shadow Rider v1:

- **Add:** one Mimikyu GRI 58 (one copy to two).
- **Remove:** one Trevenant & Dusknoir-GX SMP SM217.
- **Retain:** one Dialga-GX, one Hisuian Heavy Ball, 14 total Basic Pokémon, 31 Trainers and 11 Basic Psychic Energy.

The full paper-normalized list is [Hood Shield Shadow Rider v1 — Mimikyu-2 challenger](../decks/hood-shadow-rider-v1-mimikyu2-challenger-60-20261114.md); the machine-readable 60 is [here](../decks/hood-shadow-rider-v1-mimikyu2-challenger-60-20261114.json). The baseline list and fingerprint remain unchanged.

This is the first concrete 2/1/1 whole-deck slot-cost hypothesis. It is **not** a deck nomination, a tested improvement, or a competitive result.

## Why 2 Mimikyu / 1 Dialga / 1 Heavy Ball

The [exact core-copy frontier](agent43-copycat-early-access-bound-20261114.md) found that increasing either core species from one to two has the same Prize/hand/draw arithmetic when total Basic count is held at 14. This challenger selects the Mimikyu duplicate because it has a plausible broader role: a second Copycat attacker can use other non-GX attacks, and Filch can draw two cards for one Colorless Energy. A second Dialga-GX has much less obvious non-Regidrago utility in this Psychic-Energy list. That cross-field advantage is a heuristic, not a measured effect.

The one-card cut is Trevenant & Dusknoir-GX. Its Pale Moon-GX competes with the Dialga Timeless-GX counterline for the once-per-game GX attack, but its non-GX Night Watch remains a meaningful 150-damage hand-disruption attack. The challenger therefore trades away a real alternative attacker and a GX option; it does not get the extra Mimikyu for free.

## Exact access arithmetic

The existing enumerator `scripts/agent43-copycat-early-access.cjs` already covers 2/1/1. It preserves the 14-Basic count by reducing other Basics from 12 to 11. Under the second-player-by-second-turn horizon (six Prizes, seven-card opening, two natural draws and one Arven search), conditional on a valid opening:

| Metric | Baseline 1/1/1 | Challenger 2/1/1 |
| --- | ---: | ---: |
| Valid opening with at least one Basic | 86.1409% | 86.1409% |
| Mimikyu/Dialga core recovery feasible by horizon | 85.9140% | **92.2004%** |
| Hard Prize-only obstruction | 2.3669% | **0.9399%** |
| Recoverable but not seen by horizon | 11.7190% | **6.8597%** |
| Valid opening and core recovery (joint) | 74.0072% | **79.4223%** |

The modeled conditional recovery improvement is **+6.2863 percentage points**; the joint valid-opening/recovery event improves **+5.4151 points**. The valid-opening rate does not change because the Basic count remains 14.

The source field has 11 Regidrago placements out of 32. Applying that share to the joint access-event delta gives **1.8614 percentage points of field-wide access opportunity** only under an extreme conversion assumption: every newly accessible line occurs in a Regidrago game and changes a loss to a win. This is not a win-rate estimate, expected benefit, or evidence that the counterline can be executed.

### Model assumptions and limits

The model treats any unprized Mimikyu or Dialga as otherwise accessible; Heavy Ball can be played when seen or fetched by the single Arven if an eligible Tool remains in the deck; and the opponent does not disrupt the line. It does not model search/action competition, Energy funding, Mimikyu promotion, Bench capacity, Fairy Zone, the opponent's actual Apex Dragon choice, the GX marker, the post-Copycat follow-up, or a full game. Confidence is high in the combinatorial arithmetic under those assumptions and low in translating the event into counterline execution or matchup strength.

## Why Trevenant & Dusknoir is the first cut to test

The source-field scan of the 29 published exact lists found:

- all **9/9 published Regidrago lists** contain one Super Rod; rank 32 also contains Cynthia & Caitlin. This keeps Girafarig's Get Lost as a plausible recovery-denial tool;
- all **29/29 published lists** contain at least one Stadium, including all 9/9 published Regidrago lists. This keeps Marshadow's Resetting Hole as a plausible additional Stadium answer;
- Latias ex supports Basic-Pokémon retreat and the post-Timeless Mimikyu-to-Shadow-Rider line;
- Radiant Eternatus is the two-VMAX setup engine;
- Tapu Lele-GX supplies Wonder Tag Supporter access;
- two Lillie's Clefairy ex preserve Fairy Zone redundancy for the Regidrago damage line.

These are card-text/field-composition reasons to retain the other singleton Basics, not empirical proof that each one is necessary. Trevenant & Dusknoir is not valueless: Night Watch remains live without spending the GX marker, and Pale Moon-GX may matter in matchups where Timeless-GX is not the intended line. It is simply the most defensible first Basic slot to challenge with an extra Copycat body.

The field scan covers 29 published lists only. It does not reconstruct ranks 23, 25 or 28, authenticate physical Japanese printings, or resolve whether the benchmark is strict Expanded-vs-Expanded or candidate-only Expanded versus unchanged Japanese Extra.

## Execution boundary and next experiment

Do not dispatch another V3 fixture on the current in-process policy architecture. The current actor wrapper is not an OS-enforced information-set sandbox, and the owner has not selected the seed-disclosure model. This candidate can be frozen as a paper-list hypothesis now, but gameplay comparison must wait until the trust boundary and owner decision are resolved.

After that gate:
1. Freeze the baseline and challenger 60s and policy hashes.
2. Use the same independently assessed fixed policy per available rank for both arms.
3. Compare both physical seats and first-player assignments with matched starts where valid, independent seeds, and every abort/unsupported action retained.
4. Preserve per-rank outcomes and the incomplete-field boundary; no aggregate nomination until the full field and policy panel are valid.

**Current conclusion:** the 2/1/1 challenger has a meaningful exact early-access advantage over the baseline under an optimistic model. The Trevenant & Dusknoir cut is an explicit, contestable opportunity-cost hypothesis. Keep the baseline unchanged and require whole-game evidence before promoting this list.
