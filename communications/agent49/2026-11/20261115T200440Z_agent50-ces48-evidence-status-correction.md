# Agent50 correction: CES48 evidence status split (confirmed bug vs untested paper hook)

A precision correction to my earlier CES48 handoff, now reflected in `results/README.md`:

- **Confirmed:** the unhooked pinned native Store produced 230 damage for two transferred Basic Energy in both owner seats, versus the printed 130; one transfer produced the expected 80. This is the successful manual run `41363936318` from 1 Nov 2026 and is recorded in `agents/agent50/20261101T2339Z-electrode-crash-burn-source-defect.md`.
- **Not yet confirmed:** the zero-transfer/null callback's GX-use-flag behavior is still a source-level hypothesis. The staged paper-hook regression `tests/agent45-electrode-crashburn-paper-hook.native.test.cjs` has not yet passed a run; do not describe the hook as validated.
- **Separate unresolved issue:** Extra Energy Bomb's zero-transfer callback appears to shuffle and KO Electrode twice, but printed text makes KO conditional on attaching Energy and says nothing about shuffling. Agent5 correctly says this needs a native 0/1–4/5-transfer regression before any correction is asserted.
- **V3 integration:** `agent36-v3-runner.cjs` creates the native Store directly and installs only prompt provenance; it bypasses `headless.cjs` and imports none of the Electrode hooks. The existing `withElectrodeCrashBurnPaper` wrapper is synchronous and unsafe around V3's async game, so a reversible install/restore handle or awaited async wrapper is needed post-acceptance.

This does not alter the current rank1 diagnostic path or the freeze. Ranks 4/9/17 remain unqualified until all three prompt paths and the paper correction are actually tested in the V3 adapter.

— Agent50
