# Native printed-card and required-fixture release gate (Agent 49, 30 October 2026)

## Problem and intervention

A completed green CI job is not proof that a native test executed, settled a printed effect, or demonstrated a competitive game. The 30 October Critic [release veto](../../communications/broadcast/20261030T2053Z_critic_green_ci_native_print_skip_release_veto.md) identified the rank-15 Buneary / Mega Lopunny printed-card test as a regression case in which required printings were reportedly unavailable during prior pinned Store tests. The upstream test has since changed its behavior; this report makes **no claim** that the current pinned fixture still skips.

Added the pure, versioned, fail-closed [release checker](../../simulation/evaluation/agent49-native-print-release-gate.cjs), with [eight independent synthetic Node tests](../../tests/agent49-native-print-release-gate.test.cjs).

The checker joins canonical original printed 60s to the existing `reportCoverage(manifest)` result, then to actual `planAichi` resolved opponent rows. It emits **all 32 placements**, including explicit `MISSING_ORIGINAL_60` rows, full printed-card identifier statuses, modification records, and `PAPER_EQUIVALENCE_UNVERIFIED` even when a native identifier exists.

A separate required-fixture gate distinguishes **REQUIRED_TEST_MISSING**, **TEST_SKIPPED_UNSUPPORTED_PRINT**, **TEST_FAILED**, **NATIVE_EFFECT_NOT_SETTLED**, **NO_BILATERAL_FOLLOWTHROUGH**, **PAPER_EQUIVALENCE_UNVERIFIED**, and **REQUIRED_NATIVE_WITNESS_COMPLETE**. It requires a nonempty preregistered required-fixture list. Native acceptance alone never passes it. The combined release gate requires all 32 original lists, exact native IDs, an attested unchanged native candidate 60, all required native effect/reply/printing witnesses, an identical two-seat owner-information-safe frozen policy, and paper-event clock qualification.

**Tests:** eight of eight pure Node tests passed locally, including a simulated rank-15 skipped fixture that remains rejected even if CI completed. Tests use miniature constructed data, not native game states. New test command was appended to the existing **manual-only** `.github/workflows/aichi-benchmark-stats.yml`, with no on-push workflow.

**Manual CI:** [run 41128218282](https://github.com/FlareZ123/experiment-01/actions/runs/41128218282) completed **SUCCESS** at checked-out head `e4c970f`. Its `test-benchmark` job step 12, **Fail closed on skipped native printed-card fixtures before competitive release**, explicitly completed **SUCCESS**. This executes the eight pure release-gate tests on GitHub Node 22; no pinned native Store effect was run by this new test step. Other optional workflow jobs were separately skipped and are not claimed as covered.

## Explicit limitations

The new module is a release/audit boundary, **not a repaired actor chooser**, and is not yet wired into Agent 41's canonical match runner. Its caller must supply real pinned CardManager coverage, original field identity, native Store fixture outcomes, and reviewable evidence artifacts. Claimed native/paper flags must be independently verified against those artifacts; the checker itself does not prove real-world game-rule equivalence. No actual native rank-15 card attack was executed in this contribution. No win rate or fixed-deck tournament strength is inferred.

The current field remains **29/32 original exact 60-card lists** (ranks 23, 25, 28 missing), **zero competitive-qualified games**, and **no demonstrated 99.5% field win rate**.

## Integration next step

The canonical integration owner can attach a release packet after an actual pinned Store run using `auditSourcePrintings(sourceManifest, reportCoverage(sourceManifest), planAichi(...))` inputs and a frozen required native-fixture list. Preserve all skipped and unexecuted tests as machine-readable negative cells. A future integrated release must independently supply actual owner-root and prompt ledgers, action acceptance, settled effects, later own-root continuation, and opponent response. Do not infer those fields from a green workflow status.

## Actual pinned CardManager 29-source census (completed)

The manual-only `native_print_release_census` arm was added to the **existing** [card-audit workflow](../../.github/workflows/aichi-card-audit.yml). Its [native script](../../simulation/evaluation/agent49-pinned-source-print-census.cjs) compiles the genuinely pinned Twinleaf server source, resolves the original frozen Aichi 60s with separately named native proxy permissions, and archives every source card/print and native resolution state. It performs **no gameplay**.

[First complete native run 41128693983](https://github.com/FlareZ123/experiment-01/actions/runs/41128693983) compiled pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and recorded **29 published original source 60s / 1,740 physical original card copies**, plus absent ranks 23, 25, 28. Among 1,740 original copies, pinned CardManager catalog had **1,602 exact name+set+number matches, 12 uniquely resolved Prism-glyph aliases, and 126 unsupported or ambiguous original print copies**. Under the deliberately strict **exact native ID, no substitution** condition, rank **5** is the only currently complete published opponent 60; the other 28 need explicitly tracked source-print remapping or disambiguation. This is a printing-fidelity result. A native proxy-deck may still be executable after transparent, paper-appropriate substitutions.

[Independent round-trip run 41128979521](https://github.com/FlareZ123/experiment-01/actions/runs/41128979521) invoked `manager.getCardByName(nativeFullName)` on all exact catalog rows. Of **989 distinct original-printing rows**, **949** returned the correct name, set and normalized collector number; **40** lacked an unambiguous exact original native ID. The audit found no wrong-print or missing-ID lookup among those 949. It does **not** certify printed attack or Trainer behavior.

[Classification run 41129391357](https://github.com/FlareZ123/experiment-01/actions/runs/41129391357) separately classified all **126 nonexact original card copies** with **zero other categories**:

| Native-exact-print blocker | Original physical copies | Why separated |
| --- | ---: | --- |
| `MEE` basic Energy printed-number/identifier differences | **120** | Printed basic Energy same-name equivalence may be established separately under the Energy rules; currently still flagged as a changed printing |
| `Player's Ceremony` `SP #127` | **5** | Japanese promo absent in upstream, requires research-owned implementation hook and separate behavioral verification |
| `Electrike` `PRC #60` | **1** | Catalog has ambiguous same-print variants; the Omega Barrier ancient-trait variant must be discriminated, not silently picked |
| **Total** | **126** | Full partition of all unsupported/ambiguous catalog copies |

The actual original rank-15 source `Buneary PFL #83` and `Mega Lopunny ex PFL #84` are discoverable in the pinned catalog through native lookup names **`Buneary M2`** and **`Mega Lopunny ex M2`**; the strict name+set+number reverse lookup passed. Thus a native test searching literal `Buneary PFL` can skip due to a namespace alias even though the printed-definition candidate exists. Separate native Store action acceptance and effect-settlement tests remain necessary.

The complete machine-readable rank-by-rank and printing-by-printing [compiled artifact 13012676225](https://github.com/FlareZ123/experiment-01/actions/runs/41129391357/artifacts/13012676225) includes negative rows, modifying identifiers, mechanism-unverified flags and the exact pin. The all-ranks receipt must not be treated as 29 verified native gameplay implementations. The status remains **29/32 authentic original sixties and zero competitively qualified games**.

A subsequent `evaluateRelease` safety change ensures it **never labels a native-printing audit as a competitive-qualified game**. Clearing its printing and fixture prerequisites yields only `nativePrintingReleaseGatePassed`; an independently adjudicated actual game is required to claim any win. The extra pure regression explicitly verifies this even with all synthetic structural flags set.

## Original Store Player's Ceremony and public Stadium attack-cost repair

A new exact in-play **native Store** regression `tests/agent49-native-players-ceremony-store.test.cjs` stages the Japanese S-P 127 research hook in both physical seats and verifies the actual `UseStadiumEffect` draws two, uses the Stadium for the turn and executes `EndTurnEffect` while leaving the opposing hand intact. A third test isolates the card-specific reducer when the Stadium is absent, rather than conflating it with generic Store's own fallback Stadium-use accounting. The first CI attempt [41130050562](https://github.com/FlareZ123/experiment-01/actions/runs/41130050562) correctly **failed** one negative assumption about generic Store `stadiumUsedTurn`, after its two positive actual Store tests passed. The corrected, explicitly reducer-scoped third case passed in [compiled pinned run 41130414234](https://github.com/FlareZ123/experiment-01/actions/runs/41130414234); all three tests **executed** and passed. This is pinned **staged effect settlement**, not evidence of any natural card access, policy choice, paper equality or completed game.

Agent8 previously found a real public Wondrous Labyrinth cost bug in the shared `agent34` root: after attaching one Lightning and DCE, a non-Fairy Iron Thorns Volt Cyclone could be falsely marked payable under Wondrous despite the additional Colorless tax. `simulation/twinleaf/agent17-public-context-special-energy.cjs` already has separately tested `effectiveNativeAttackCost` for Thunder Mountain, Dimension Valley and Wondrous. We switched `simulation/twinleaf/agent34-actor-only-root-policy.cjs` to that shared numeric public-cost resolver before evaluating `payable`, failing closed on unknown Fairy exemption. This removes the redundant raw-cost+Thunder-only code, while leaving genuine pinned Store as attack legality authority. Changes were committed via Git tree+blob (GitHub contents API refused the large file; the final verified main head is commit `5378a83acc474505720ea6bd87bee1dc76f8ca9a`). Added five actor-only public root tests `tests/agent49-wondrous-root-payability.test.cjs`: Wondrous from either public Stadium location, printed Fairy exemption plus missing-type fail closed, Dimension Valley reduction, Thunder Mountain reduction, and secret-zone invariance. [Manual CI 41130600231](https://github.com/FlareZ123/experiment-01/actions/runs/41130600231) executed all new tests plus existing agent34 root and agent8 Stadium tests, all green. **These are pure policy tests; no real native attack was executed for this particular cost repair.**

The printed original 29-source `planAichi` permissive resolver compiled census now reports **29/29 published sources as native deck `ready`** after explicit mappings (120 same-set Basic Energy, 5 research-only Japanese promo, 12 glyph aliases, 1 PRC60 variant). Strict original-print exact ID coverage still remains only rank5. [Compiled run 41129830409](https://github.com/FlareZ123/experiment-01/actions/runs/41129830409) is the native source for this important distinction. A native deck constructor being `ready` does not imply implementation parity, advanced policy correctness, or a competitive qualified game.

**Integrated release remains closed:** 29/32 original sources, no qualified win data, no 99.5% claim.
