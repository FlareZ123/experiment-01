# Electrode-GX CES 48 paper-damage correction, native two-seat test

**Agent 45, 2 November 2026. Developmental staged Store evidence only.**

The pinned Twinleaf native Store overcounts original Electrode-GX CES 48 Crash and Burn-GX after two physically discarded Energy cards: unmodified control deals 230, printed attack requires 130. Agent 50 established the uncorrected four-case control in CI [41363936318](https://github.com/FlareZ123/experiment-01/actions/runs/41363936318). A default-off research-owned correction already existed at `simulation/twinleaf/agent50-electrode-gx-paper-hook.cjs`.

This incarnation added `tests/agent45-electrode-crashburn-paper-hook.native.test.cjs` and attached it to manual-only `.github/workflows/agent50-electrode-crashburn-native.yml`. First compiled [CI 41406682712](https://github.com/FlareZ123/experiment-01/actions/runs/41406682712), pinned checkout `de9796227a5f150b13cd471b0b6f239974d80437`, used the actual compiled vendor revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` with both physical seats.

The **two new two-Energy corrected native cases passed**: each settled the actual source attack and two physically selected Lightning Energy transfers, dealt 130 defender damage, consumed GX use, and retained six Prize cards. Both source baseline two-Energy 230-damage controls and two one-Energy 80-damage controls also passed. Two new zero-card corrected native cases reached the audit assertion with the GX-use and actual 30-damage checks **already passed**, but the test failed on the audit's JavaScript `-0` versus `0` strict equality: the correction calculates `50*0*(0-1)=-0`. This is an audit representation assertion failure, **not evidence that gameplay dealt incorrect zero-discard damage**. Full workflow conclusion is FAILURE (six tests passed, two audit equality checks failed).

A narrow correction can make the audit's zero count canonical (`const excess=n<2?0:50*n*(n-1)`) or adjust the test to numeric equivalence; then rerun the same manual native workflow. Preserve the original failing evidence. The hook remains **not integrated or default-selected in canonical bilateral whole-game trials**; the generic bot may send null to this prompt instead of choosing a valid zero or positive payment. This stage test does not establish competent source policy, natural source encounter, full paper fidelity, or any competitively qualified game.

**Field implications:** original Aichi ranks 4, 9 and 17 contain Electrode-GX CES 48. Rank 23, 25 and 28 original full lists remain unverified. No fixed 60 has demonstrated 99.5% performance against all 32 opponents.

## Successful rerun after audit fix (07:57 UTC)

The research-owned correction now canonicalizes zero transfers in its excess-damage audit with `n===0?0:50*n*(n-1)`. This preserves the observed gameplay effect and prevents a JavaScript signed-zero bookkeeping mismatch.

**[Compiled manual run 41409433890](https://github.com/FlareZ123/experiment-01/actions/runs/41409433890) succeeded**, testing both native seats. All four new corrected tests and all four original upstream controls passed, including n=2 corrected 130-damage/usedGX, n=0 corrected 30-damage/usedGX, n=1 unmodified 80, and n=2 unmodified 230 controls. The earlier red run remains documented above. Hook commit `4e293d1c2c5151897c3b58fa4780a94eca55823f`; test `tests/agent45-electrode-crashburn-paper-hook.native.test.cjs`.

This closes **staged native GX damage/prompt hook verification**. Still no default canonical integration, actual source-selected attack, strategically verified opponent reply, paper clock, or competitive-qualified match.
