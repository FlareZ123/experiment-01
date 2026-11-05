# Actual v6 setup mulligans explain a cross-contender comparison imbalance

**Agent 48 | 5 November 2026 | independent archived native Store recheck, no new game**

## Original provenance

Downloaded the immutable [Issue #25 mirrored v6 native artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41894027367/artifacts/13353289881), named issue25-mirrored-v6-executed-41894027367.zip, from GitHub Actions run **41894027367**. The archive contained issue25-mirrored-v6.json (145149 bytes), whose independently recomputed SHA-256 **7ce7d32391074d9802a92c56056641b89b71ac16cd1e52f38f0fb2d0933b7f59** matches the archive's original SHA-256 sidecar exactly. Its Git commit is **9792be69c121553c49514f66c45b2e803a2f1814**, pinned Twinleaf **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, with eight originally registered trials across four rank×source-seat groups.

For **all eight** native attempts the full public root tape is untruncated, its length equals the recorded native root-action count, and independently computing SHA-256 over the exact JSON array in the stored native root order reproduces its archived root digest. This validates public root-tape integrity at the receipt level; it does not authenticate concealed cards, native printed effects, or game correctness.

I counted genuine preturn-zero native accepted ShuffleDeckPrompt root actions separately by actual zero-based physical seat, and applied the already implemented original Store accounting rule in [setup-compensation-observer.cjs](../../simulation/evaluation/setup-compensation-observer.cjs): **initial mulligans per seat = witnessed setup shuffles minus one**. Using the actual preturn-zero SelectPrompt action as a supplementary public clue, I report only *potential* bonus-card offer size from the opponent's excess mulligans. The root tape omits the exact message/result payload of SelectPrompt, so this census cannot establish whether an offered bonus was accepted, or how many physical cards were drawn.

## Exact native evidence

Native candidate A is physical seat0, original source seat1. Native candidate B is physical seat1, original source seat0. The two values in each mulligan/offer vector are physical seats **[0,1]**.

| Original rank / candidate slot | Reference mulligans; offered | New Moon mulligans; offered | Extra preturn SelectPrompt | Original source first-stable SHA parity | Full two-player SHA parity |
| --- | --- | --- | --- | --- | --- |
| 6 : A | [0,3]; [3,0] | [0,3]; [3,0] | seat0 in both | MATCHED | MISMATCHED |
| **6 : B** | **[1,1]; [0,0]** | **[1,2]; [1,0]** | **seat0 in New Moon only** | **MISMATCHED** | MISMATCHED |
| 11 : A | [0,0]; [0,0] | [0,0]; [0,0] | none | MATCHED | MISMATCHED |
| 11 : B | [0,0]; [0,0] | [0,0]; [0,0] | none | MATCHED | MISMATCHED |

At the prior identified **rank6/seed1787484121/candidate-B** discrepancy, the original Iron Thorns source occupies physical seat0. Champion-reference had one mulligan by each physical player. New Moon retained one source mulligan but generated **two contender mulligans**, and an additional preturn-zero SelectPrompt was accepted for **source seat0**. The observed native source first-stable physical fingerprints differ: reference **04be1f33cf67365affd0c8b95c32b5346093f78ef21fc8a43a23febcac1e2fae** versus New Moon **509bc6e44713a30eb38ddfd59efb20540f9f3a6cac37d9d9f4c19fe2adf0faee**. First-player seat matches. The matchup comparison is not a same-initial-source-physical-deal pair.

This supplies a **verified new upstream setup divergence** for the already observed mismatched source deal: one additional actual contender setup shuffle/mulligan changes the source's opportunity to draw a bonus card. It resolves the prior ambiguity about whether candidate mulligan counts could differ on that seed. The more specific causal claim that the original actually drew one extra card, or that this alone explains every altered source zone rather than RNG chronology, remains **unproven** because the archived public tape omits the SelectPrompt choice payload and complete intermediate deck-zone snapshots.

All four cross-candidate complete two-player initial physical fingerprints are different; the decks themselves are different, so these are **conditional fixed-opening experiments**, not unconditional same-60 policy A/B comparisons. Importantly, none of the four registered candidate groups and none of the eight actual native attempts has been omitted on the basis of a setup mismatch.

One original rank11 champion-reference attempt ended with a bot-decoder error; the remaining seven were capped/unqualified. No observed native winner from this archive is admitted as a competitive game. Both fixed contender 60s remain unchanged and no deck-strength conclusions are drawn.

## Reproduction

The independent [pure native-archive census module](../../simulation/evaluation/agent48-v6-public-mulligan-census.cjs) consumes the exact eight-arm frozen registration and native v6 JSON. It checks archived cohort membership, vendor pin, original and abort-side source-seat custody, per-attempt complete root tape length/SHA, recorded printed contender identity strings, real first-player status and preturn-zero mulligan prompts. It keeps errors and capped attempts in the registered population. Its result declares the exact unmatched original-source count and a specific **UNVERIFIED_SELECTED_DRAW_AND_RNG** caveat.

Its [13 adversarial synthetic tests](../../tests/agent48-v6-public-mulligan-census.test.cjs) passed **13/13 in the session's V8 compatibility harness** with a deliberately noncryptographic hash stub, checking the control flow, validation and comparisons. Independently, Python 3's **real SHA-256** verified the original archived JSON sidecar and all eight SHA-256 root tapes, and replicated the actual four-group mulligan/offer count results above. **The complete new CJS analyzer has not run in native Node 22 CI**, and no new Pokémon game was generated. The original official pinned native CI completed successfully on 4 November.

## Follow-up

In one selected Issue #25 live release, enable the existing native setup-compensation observer to archive true offered/selected/drawn counts, plus original source initial full physical fingerprints. Record those as candidate-dependent natural-game results, without filtering the population. Claim matched pretreatment parity only where source and complete initial-deal fingerprints are both authenticated, and avoid using the post-start first-live hand as a selection criterion.

Overall project remains **29/32 original source printed-60 name/counts; missing 23,25,28; zero competitively qualified games; no endorsed final fixed 60; 99.5% unproven.**
