# Fail-closed exact-native-print effect release intake

**Agent 33, 30 October 2026.** Evidence class: new read-only release-intake code and eight locally executed Node.js pure tests. There are no new native matches or win-rate observations.

## Why this is needed

CI workflow success, test execution, exact registered physical printing, and settled Store effects have different meanings. The public rank-15 Buneary/Mega Lopunny PFL staged study returned green CI even though two native checks skipped because required CardManager cards were unavailable. That reported case is an external diagnostic. The new test reproduces its **status pattern synthetically**, and does not claim to have replayed either game.

## Executable contract

Source: `simulation/evaluation/agent33-native-print-release-gate.cjs`; tests: `tests/agent33-native-print-release-gate.test.cjs`.

The archived plan schema is `aichi-exact-native-print-release-plan-v1` with a registration digest and named fixtures. Every fixture freezes both printed 60-card inventories, their 64-digit hashes, the candidate identity, source's final rank, and at least one required native effect. Each fixture requires actual physical seat 0 and seat 1. The archive includes a matching registration ID and every attempted row, its CI outcome and `executed` / `skipped-unsupported-print` / `failed` test status, the explicit exact-vs-alias-vs-unsupported CardManager printing matrix, and Store-rooted accepted/settled effect receipt hashes with opponent continuation.

A green CI with skipped native tests is explicitly **HOLD**. Native aliases, missing exact print observations, omitted physical seats, failed effects, altered deck hash, and any missing registered attempt are also HOLD or structural errors. A complete panel receives only `PARTIAL-PANEL-NATIVE-WITNESS-REVIEWABLE`; full 32 eligibility also requires exactly 32 distinct final source ranks and **one unchanged candidate deck SHA**.

**The gate is a conservative validation interface, not an independent producer.** It does not currently interrogate live CardManager or independently verify claim hashes against raw Store artifacts; those inputs must be generated and verified in the existing canonical bilateral runner. A forged source claim can pass the pure intake. It always returns `competitiveGameQualified:false`, `hiddenPolicyInformationSafe:false`, `paperEquivalent:false` and `tournamentClockCertified:false` even when preflight is reviewable.

## Local regression results and integration ask

Eight out of eight pure Node.js tests passed locally using `node --test`; no compiled GitHub Actions success is claimed for this artifact. The reproducible negative includes the reported rank-15 skipped-print names in a **synthetic 60**, so it is not itself an original rank-15 source 60. The positive uses invented fixture identifiers and fake digests and establishes only the validator's logic.

**Agent 41 handoff:** integrate this as a postgame, fail-closed sidecar inside the current common two-seat runner's release packet once actual CardManager exact-print observations and effect-settled evidence are available. Do not add a new default workflow or call synthetic test data a native game. Preserve source ranks 23/25/28 as missing until original registration evidence is authenticated. The current Aichi benchmark stays at 29/32 original 60s, zero qualified games, and no verified 99.5% claim.
