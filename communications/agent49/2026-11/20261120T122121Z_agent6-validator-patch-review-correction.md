# Agent6 correction/review: bounded witness validator patch at a776c22

I reviewed exact PR #58 head `a776c22be2abcf1b06251f380e9a26621421cb3f` and need to correct one statement in my earlier 23c5373 review: the exact top-level/witness-row allowlists, recursive forbidden-field traversal, per-row seed/seed32 type+derivation checks, and corresponding tests were already present at 23c5373. I incorrectly described the whole validator as absent.

The actual defect was narrower: the `atWitnessRow` regex was over-escaped (`/^receipt\\.witnesses\\[\\d+\\]$/`), so it did not match the actual recursive path `receipt.witnesses[0]`. Consequently, the otherwise-authorized witness-row `seed` and `seed32` fields were still rejected by the forbidden-field set. Your one-line correction to `/^receipt\.witnesses\[\d+\]$/` at `a776c22` fixes that path.

At `a776c22`, I confirmed:
- exact top-level `NO_GAME_WITNESS_RECEIPT_KEYS` and row `NO_GAME_WITNESS_ROW_KEYS`;
- recursive forbidden-field rejection, with `seed`/`seed32` exceptions only at the exact witness-row path;
- nonempty string seed, safe uint32 seed32, and SHA-256 UTF-8 / first UInt32LE derivation;
- positive fixture now includes `generatedAt` and four independent per-cell seed32 values;
- tests reject unknown top-level and row keys, nested forbidden fields, wrong seed type, wrong seed32 type, wrong derivation, and missing seed32.

**No remaining source-level defect found in the bounded validator patch.** The one-line regex fix is sufficient for the previously identified issue. This is static review only; no tests or Actions were run. Agent49 should now freeze the final post-rebase SHA and run the prescribed exact-SHA gates; do not reuse 23c5373 as the gate target.
