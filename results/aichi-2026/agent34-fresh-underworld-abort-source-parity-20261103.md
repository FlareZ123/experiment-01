# Fresh rank-1 Underworld Door: recover native-abort source openings without repairing the failed release

**Agent 34, 3 November 2026.** Posthoc **read-only** examination of the preserved preregistered rank-1 original-source experiment. No deck, seed, policy, physical deal, historical error, or denominator was changed. Source research target remains all 32 original Aichi lists, with only 29 authenticated and zero competitively qualified games.

## Frozen evidence and independently reproducible audit

- Original preregistration: [agent34-rank1-fresh-underworld-20261102.json](registrations/agent34-rank1-fresh-underworld-20261102.json), Git blob **`1af4f729c0101483a2295e0df22b9070a8510417`**.
- Original paper-hook symmetric control/treatment runner: [agent34-rank1-fresh-underworld-native-pair.cjs](../../simulation/evaluation/agent34-rank1-fresh-underworld-native-pair.cjs).
- **Preserved failed compiled run [41505123566](https://github.com/FlareZ123/experiment-01/actions/runs/41505123566)** and archived full JSON [artifact 13169513951](https://github.com/FlareZ123/experiment-01/actions/runs/41505123566/artifacts/13169513951). Independent earlier failed run [41503833850](https://github.com/FlareZ123/experiment-01/actions/runs/41503833850) reproduced the same reported failure and counts.
- Independent no-Store archive reader: [agent34-fresh-underworld-abort-pair-audit.cjs](../../simulation/evaluation/agent34-fresh-underworld-abort-pair-audit.cjs), with [six adversarial pure regressions](../../tests/agent34-fresh-underworld-abort-pair-audit.test.cjs). Tested locally with Node's built-in test runner, six passed; the exact original archived JSON was also parsed by the reader, producing the table below. **A compiled CI confirmation of this new reader is pending.**

The original source's hidden opening is compared through its preexisting SHA256 physical-deal fingerprint. Where the ordinary successful row is absent because the *treatment* crashed, the audit checks the native-abort source seat, fingerprint format, entire native root ledger count and SHA256 before admitting **source-only** correspondence. The initial full bilateral deal and verified first-player receipt are **never inferred from a matching seed**.

| Original native evidence quantity | Verified |
| --- | ---: |
| Registered source trials | 16 |
| Actual native control + treatment attempts | 32 |
| Source-deal fingerprints matching control/treatment | **16/16** |
| Fully verified source **and candidate** physical initial deal + first player | **13/16** |
| Source-only recovered from authenticated treatment error | **3/16** |
| Verified source-fingerprint differences | **0/16** |
| Treatment attempts aborted at strict `AttachEnergyPrompt` validation | **3/16** |
| Native original-source Underworld Door effects with completed physical payment + two-card draw + source marker | **32** |
| Above physically complete effects in an ultimately aborted trial | **4** |
| Competitive paper games qualified | **0** |

The three source-only, failed full pairs are:

- `1:3:A:new-moon-lockbreaker-v1`: original-source physical digest recovered from a 227-root cryptographically checked native-abort ledger. The same failed trial previously completed **four** native source Underworld effects.
- `1:0:B:champion-reference`: original-source physical digest recovered from a 64-root checked native-abort ledger; zero source Underworld effects in that failed attempt.
- `1:0:B:new-moon-lockbreaker-v1`: original-source physical digest recovered from a 75-root checked native-abort ledger; zero source Underworld effects in that failed attempt.

All three treatment rows had explicit `engine-error`, `failureStage=strict-prompt-validation` and `pendingPrompt=AttachEnergyPrompt`. The preserved error evidence does **not** identify the exact causal card or show that the Underworld recipient compatibility hook caused these failures, especially in two trials with zero selected Underworld roots.

## Interpretation and release consequence

The historical runner's **`strictInitialDealsMatched:false` remains correct** for the preregistered acceptance test, because three treatment errors lack proven full bilateral initial deals and first-player receipts. Its original `sameSourceDeal:false` for those rows reflected a **missing normal result**, rather than evidence of three *different* source deals. The posthoc audit narrows that uncertainty to 16/16 source-only verified pairs, while deliberately refusing to upgrade the 13/16 complete-pair gate.

Native physical effects counted before a later engine crash are useful evidence of mechanism execution; they cannot become completed match outcomes. The 32 effects are *not* 32 independent games. There is no supported competitive win rate or candidate superiority result.

Future shared release policies should expose a separate, fail-closed `SOURCE_ONLY_NATIVE_ABORT_MATCH` class, retaining `engine-error` status and the original acceptance veto. Investigate the three real prompt failures through owner-visible proposed assignments and clean Store replays before spending more CI on larger field comparisons. Distinguish playable root selection, prompt payment, actual target, full state transition, and opponent response.

**Validation note:** The new reader and synthetic tests ran locally; compiled native CI for this archive-only conclusion is unnecessary because its inputs are the pinned immutable archive and existing SHA256 receipts. Independent CI on the pure reader would nevertheless add reproducibility confidence.
