# Agent 32: ADP v2 one-copy sensitivity, first-GX physical access versus opponent opening offers

**3 November 2026 | source-printing-preserving hypothetical swaps, exact arithmetic | no native games or competitive wins.**

## Fixed source and decision question

Source is [Agent5's unchanged ADP/Thorton/Regidrago v2](candidates/agent5-adp-thorton-regidrago-60-v2.json), canonical 60 identity **bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b**. The frozen sixty includes **two ADP, three Regidrago V, one Crobat V, one Tapu Lele-GX, two Switch, three G&H, three Quick Ball, four Tag Call and four Double Dragon Energy**. Four DDE and Tag Call already occupy four-copy ceilings. The question is which **single printed-card substitutions** change two independent narrow pregame quantities: (a) owner first-GX resource access by their first ordinary draw going second and (b) expected net original-source optional mulligan bonus-card offers over the same 29 authenticated opponents.

We test **counterfactual sixties only**; no row is promoted to an actual candidate or an improved deck. Each individual JSON inventory is built from the original copy counts and given a freshly computed canonical source hash using the v2 manifest's stated recipe. Every source row stays 60 cards, all modified printings already occur in the source roster, and no printing exceeds four copies. One copy is moved, commonly using the original singleton VS Seeker as a clearly identified donor. This removal has material strategic cost.

## Results

All percentages below are conditioned on a Basic-valid original seven, assume no draw or search beyond the ordinary eighth card and the explicitly modeled ADP/Tag/Quick Ball/G&H/Switch route, and use six-Prize survival. The "net source bonus offers" is expected **source minus candidate optional opening offers**, across 29 authentic opponent sixties with equal rank weighting. A bigger number would imply more *offered* cards to source players, without deciding gameplay.

| Hypothetical one-copy substitution | Physical first-GX access | Change vs frozen v2 | Basic copies | Net source bonus offers |
| --- | ---: | ---: | ---: | ---: |
| **Frozen v2, no swap** | **36.45610%** | 0 pp | 7 | +0.32998 |
| Third ADP for singleton VS Seeker | **44.50509%** | **+8.04899 pp** | 8 | +0.19576 |
| Third ADP for second Field Blower | 44.50509% | +8.04899 pp | 8 | +0.19576 |
| Third ADP for sole Crobat V | 47.24726% | +10.79116 pp | 7 | +0.32998 |
| Fourth Regidrago V for VS Seeker | 34.56448% | −1.89162 pp | 8 | +0.19576 |
| Third Switch for VS Seeker | 39.66303% | +3.20693 pp | 7 | +0.32998 |
| Fourth G&H for VS Seeker | 37.78914% | +1.33304 pp | 7 | +0.32998 |
| Fourth Quick Ball for VS Seeker | 36.89711% | +0.44101 pp | 7 | +0.32998 |
| Second Crobat V for VS Seeker | 34.56448% | −1.89162 pp | 8 | +0.19576 |
| Second Tapu Lele-GX for VS Seeker | 34.56448% | −1.89162 pp | 8 | +0.19576 |
| Cut one Switch for second VS Seeker | 32.90896% | −3.54715 pp | 7 | +0.32998 |
| Cut one ADP for second VS Seeker | 24.89914% | −11.55696 pp | 6 | +0.51270 |

**Interpretation with the denominator exposed.** Adding a third ADP while removing Crobat V keeps seven total Basics and therefore leaves the bilateral mulligan measure unchanged. This gives the **largest first-eight physical-access gain** in this enumerated set, +10.79 percentage points, at the potentially serious cost of eliminating a Basic draw Pokémon from the actual playing deck. Adding ADP while removing a nonbasic yields +8.05 points and eight Basics, which reduces the source-oriented net expected opening offers by about **0.13422 per match** compared with v2. These are direct results of an altered fixed 60-card location distribution and do not establish better game performance.

Adding a fourth Regidrago V or another non-ADP Basic **reduces the conditional first-GX percentage** under this model, even though it reduces mulligan exposure, because the first-GX event needs ADP to reach Active and contains no extra Basic-derived draw effect. That is not evidence a fourth Regidrago V is strategically bad: it may materially improve T2 attacker survival, discard access and non-ADP fallback pressure. Similarly, the fourth Quick Ball's marginal **+0.44 pp** reflects only the specified single-search route; broader decisions and Item payment can change its value.

No tested change eliminates the strong original-source opponent resource exposure relative to a fourteen-Basic reference. Even the eight-Basic options have net source offers **+0.19576** and must still earn decisive hard-source results.

## Evidence and reproducibility

- [Hypothetical one-copy source-preserving exact runner](../../simulation/evaluation/agent32-adp-one-slot-first-gx-sensitivity.cjs) computes all twelve inventories and their **distinct actual 60 hashes**. It rejects an unverified source identity and fifth copies.
- [Seven deterministic printing/count/monotonicity tests](../../tests/agent32-adp-one-slot-first-gx-sensitivity.test.cjs) cover card counts, printed inventory hashes, source-opener Basic counts, conditional access signs, addition/removal controls and bilateral offer changes.
- It reuses the previously verified [first-starter exact evaluator](../../simulation/evaluation/agent32-adp-first-gx-physical-window.cjs), [Switch/tutor extension](../../simulation/evaluation/agent32-adp-switch-first-gx-physical-window.cjs), and [actual 29-source mulligan census](../../simulation/evaluation/agent32-adp-field-mulligan-offers.cjs).
- Actual [GitHub Actions 41555175675](https://github.com/FlareZ123/experiment-01/actions/runs/41555175675) **SUCCESS** at research head **8a8d7e81e94c816015659409b54573a42b9d4406**. All seven scoped tests and the executable's source-29 profile passed in the [existing manual-only card audit](../../.github/workflows/aichi-card-audit.yml). No new continuous CI or native matches were run.

## Adversarial admission and stop conditions

The result is **first-turn physical reachability**, independent of real game-state actions. A useful next registered hard-source comparison can test the frozen v2 and only one structurally justified swap against rank6 Iron Thorns and rank8/11 Absol Garbodor while recording *both* original-source and candidate legal draws, actual Item/Supporter permission, G&H and Quick Ball **owner-discard payment**, genuine ADP Active promotion, enhanced GX, T2 paid Thorton + Regidrago transition, and response. A swap removing Field Blower can lose directly against Garbodor/Temple. Removing VS Seeker may remove future critical recovery, while removing Crobat V removes a draw action. Compare these sacrifices under opponent continuation rather than selecting a marginal-access maximum by itself.

**Project status:** no change to the frozen ADP v2 candidate, no promoted final deck, three missing Aichi original sixties (23/25/28), zero competitively qualified paper games, no demonstrated 99.5% win rate.
