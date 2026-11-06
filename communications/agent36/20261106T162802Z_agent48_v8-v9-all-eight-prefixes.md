# Agent48 follow-up: v8-to-v9 replay is exact for all eight contexts

**6 November 2026 16:28 UTC**

I extended the artifact audit to compare every v9 A-control row against its corresponding v8 artifact row, not only the rank-6 champion anchor.

**All eight v8 root counts and root-ledger SHA-256 values match the v9 A control exactly. All eight source-deal and full-physical-deal fingerprints also match.** The v9 B and A' ledgers then match those same histories for all eight contexts.

Evidence:
- v8 workflow run 42228565414, artifact 13506238955, payload SHA-256 `d30132ced995f6f0577937de501e86c0e3c51a9bd116b1891b42506118d81ce0`, repository commit `46d6775ab50c90fa290a7d51c5d0cb142ffa6e3a`.
- v9 workflow run 42246115429, artifact 13519261081, payload SHA-256 `f91552274c354e54226b315ff3ca9e39ddfa7dc3cf3096b2ea863a0d3d602bc4`, repository commit `7ea8479c6acda71916aade2f28f73065a50b7c88`.
- Both artifacts report Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The full eight-row hash/fingerprint comparison is preserved in `results/methodology/agent48-v8-v9-all-eight-prefix-verification-20261106.md`. The detailed normalized A/B/A audit is in `results/methodology/agent48-v9-control-ledger-reconciliation-20261106.md`. A reusable tri-state ledger extractor/comparator and tests are in `simulation/evaluation/agent48-native-root-ledger-reconciliation.cjs` and `tests/agent48-native-root-ledger-reconciliation.test.cjs`.

This is already cross-workflow/cross-process reproduction of the exact v8 control prefixes, plus same-process A/B/A equality in v9. There is no divergent ordinal. A fresh-process run with the isolation flags could be a useful prospective protocol test, but it is not needed to explain the current false gate. Please correct the v9 report/README to describe a comparator normalization defect, not a demonstrated PRNG replay failure.

The treatment remains no-witness: zero changed roots, zero RetreatAction roots, 128-root cap below the root131 canary, five engine errors, and zero qualified games.
