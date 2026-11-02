# Rank26 source firstturn post-Compressor root gates: 24-pair v2.1 replay with settlement audit anomaly

**Agent 3 | 2 November 2026 | no new independent games; diagnostic read-only replay of exact v2.**

## Execution status and frozen cohort replay

The [v2.1 retrospective registration](registrations/agent3-rank26-compressor-postitem-gates-v21-20261102.md) froze source original rank26 60, original opponent rank6 60, seed base 20261106, repeats 72..83 both physical seats, 48 paired native arms, the original v2 source-held Battle Compressor-only treatment, and a reversible Store dispatch read-only source-gate wrapper. The first manual [CI 41414786379](https://github.com/FlareZ123/experiment-01/actions/runs/41414786379) failed before any native gameplay due an eager compiled-module import in pure tests, corrected to load the runner lazily. The corrected immutable [CI 41414971038](https://github.com/FlareZ123/experiment-01/actions/runs/41414971038) **passed** all tests and the complete native replay at source head 9d25a262fdb0d580e06f27d044c4ba98664eda64. Artifact [13127801355](https://github.com/FlareZ123/experiment-01/actions/runs/41414971038/artifacts/13127801355), ZIP SHA256 a8c8948e70cf47b192831d22ef11858f41b2214368cc9d1e558d0c7b720e9a4a.

The new code asserts exact reproduction of all previously published v2 aggregate values before reporting any new snapshot. All assertions passed: **24/24** original physical starts matched, **48** arms, **14** original rank26 source-first, **0 baseline / 8 treatment** firstturn Battle Compressor PlayCardAction, **11 baseline / 11 treatment** full-run positive owner Compressor settlement cases, **25 treatment all-turn Lightning moves**, **17 treatment all-turn Exeggcute moves**, **0** additional firstturn Crisis Punch, and **3/3** unqualified engine terminals.

## Novel source-visible root gate findings

Among the **same 14 actual source-first original deals**, the additional native root observer captured the following *any first global turn owner action root*, with all owner-only hand/board resources and public opposing Active/Prize state:

| Necessary observed gate | Baseline deals with >=1 root | Treatment deals with >=1 root |
| --- | ---: | ---: |
| At least **two** Lightning in own discard | 0 | **6** |
| Benched Meloetta ex | 1 | 1 |
| Benched Tapu Koko Prism Star | 3 | 3 |
| **Both** Meloetta and Koko Benched | **0** | **0** |
| Held Canceling Cologne | 0 | 0 |
| Native Cologne in discard | 0 | 0 |
| DCE held or already on Meloetta | 2 | 2 |
| Meloetta Active | 3 | 3 |
| Crisis Punch TM attached to Meloetta | 1 | 1 |
| Opponent had exactly **one** Prize left | **0** | **0** |
| Koko moved to own Lost Zone | 0 | 0 |
| Complete registered Meloetta attack witness | 0 | 0 |

The original v2 treatment's eight firstturn BC plays therefore move a *narrow upstream resource gate* without automatically obtaining Koko/Meloetta Bench pairing, Cologne, or the self-KO Prize requirement. These are correlated prerequisite snapshots and cannot be added together into a match/game rate.

**Important correction discovered after freezing this diagnostic:** [official Japanese Koko FAQ](agent3-rank26-koko-single-lightning-paper-ruling-20261102.md) shows **one**, rather than two, Lightning in discard suffices for Koko to attach one to Meloetta. Thus the table's >=2 Lightning gate is a conservative old hypothesis, and its failure is not itself a legal impossibility. The full JSON retains **discardLightningCount** per root so later analysis can apply the paper-correct >=1 gate without changing the preregistered first run.

## Physical receipt first-turn anomaly: unresolved; do not use as proof of early movement conversion

Retrospectively filtering the physical settlement observer's records to globalTurn===1 and native accepted positive minimum gave:
- **8/14 baseline** and **8/14 treatment** games with at least one firstturn positive source Compressor prompt settlement.
- Baseline/Treatment Lightning movement **20/14** and Exeggcute movement **2/8** respectively.
- At least two *distinct Lightning ID objects* physically selected in **2 baseline** versus **6 treatment** games.

These values **cannot be reconciled yet** with the independently preserved firstturn decision trace showing **0 baseline** versus **8 treatment** Battle Compressor native PlayCardActions. Especially, the baseline records 20 firstturn Lightning movements across only eight positive-prompt games despite the printed source 60 containing **only two** Basic Lightning per game. Possible explanations include repeated recycling of the same physical cards within a turn, a Store-versus-headless turn clock or prompt-ownership attribution discrepancy, card duplication inside the engine, or an observer classification bug. We have **not** isolated which. Until a per-case action-ordinal and physical-ID reconciliation proves otherwise, **do not interpret the 8/8 physical receipts as genuine firstturn card-effect success or infer a baseline improvement**. The earlier source firstturn PlayCardAction count (0→8) is a separately measured decision-trace fact; its causal linkage to physical move receipts is **unresolved**.

This anomaly is worth a dedicated fail-closed native Store/decisionTrace join. Adding more broad small-sample game replay without resolving it would generate precise-looking but untrustworthy resource-conversion claims.

## Reproducibility and qualification

- [Read-only v2.1 diagnostic and full per-case roots](../../simulation/twinleaf/agent3-rank26-post-compressor-gate-v21.cjs).
- [Pure scope and no-opponent-private inspection tests](../../tests/agent3-rank26-post-compressor-gate-v21.test.cjs).
- [Original 24-pair prospective result](agent3-rank26-compressor-physical-v2-native-20261102.md) and [official one-Lightning ruling correction](agent3-rank26-koko-single-lightning-paper-ruling-20261102.md).
- All 48 native arms remain developmental. This is an identical-seed replay; do not double sample size to 48 physical deals or 96 independent arms.

**Benchmark remains:** 29 of 32 authenticated original 60 opponents, 0 competitive-qualified game outcomes, no demonstrated 99.5% single fixed 60.
