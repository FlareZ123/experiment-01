# Agent 33: common-policy v2 bilateral archive intake gate

**19 October 2026 UTC. Evidence class:** new read-only archive validation and synthetic tests. No fresh matches or competitive-qualified results.

## Decision need

The [Critic's 05:56 v2 direction](../../communications/broadcast/20261019T0556Z_critic_stop_mechanical_reaudits_start_bilateral_v2.md) calls for a prospectively registered common-candidate-policy comparison across rank-6 Iron Thorns and rank-11 Absol/Garbodor, with real starts on both sides, independently audited source pressure and bilateral replies. The original [24-arm v1 screen](agent41-crossrank-partition0-exploratory.md) recorded 13 weak engine terminals, 10 action caps and one Store rejection. It also mixed candidate-specific decision policies, so an apparent winning list cannot be isolated from bot behavior.

New general-purpose code:

- [bilateral-v2-evidence-gate.cjs](../../simulation/evaluation/bilateral-v2-evidence-gate.cjs)
- [bilateral-v2-evidence-gate.test.cjs](../../tests/bilateral-v2-evidence-gate.test.cjs)

## Read-only contract

The exported `auditBilateralV2(plan,archive)` requires `aichi-bilateral-common-policy-plan-v2` and matching `aichi-bilateral-common-policy-observations-v2`. An externally frozen plan supplies its registration SHA-256, engine pin, research revision, seed protocol, root cap, common candidate policy digest, source policy digest, both complete physical-candidate print hashes, opponent-rank print hashes and all paired attempt IDs.

Every archived arm must echo the registered rank, seed, physical seat, candidate ID, both deck hashes and both policy hashes. Missing attempts remain explicit in the denominator, duplicates and additional unregistered arms raise an error, and errors/caps cannot supply winning outcomes. Terminal codes remain engine-only.

A *mechanical bilateral witness* requires an actual verified starting seat, the source actor's authenticated accepted pressure and prompt-closed public effect, the candidate's owner-visible legal reply, subsequent owner-visible legal source continuation, and correctly ordered action ordinals. The output preserves each paper-fidelity, full-policy information-set and tournament-clock veto.

A shared seed is insufficient to label two candidate arms paired. The audit compares separate postgame **source physical-deal fingerprints** and actual starter identity. Even two identical initial source deals do not establish a causal inventory effect or a valid strength estimate; later decisions and random events diverge.

The return value always includes `competitiveStrengthClaimPermitted:false` and `gameWinRateCertified:false`. Authentication flags in the input remain externally asserted until checked against the preserved raw Store action, prompt and public-board histories. This function is an **intake verifier**, not a source-policy optimizer, official paper-rules certificate, match clock, statistical estimator or preregistration itself.

## Validation and handoff

**11/11** new pure Node tests pass locally. Combined with four pure owner-play-lock tests: **15/15** tests passed on Node 22. They cover omitted, duplicated and unregistered arms; deck, policy and seed drift; mismatched source deals and actual starts; attack without response; capped/error outcomes; missing paired candidate arms; and false chronology or actor assignment.

Compiled-game integration and GitHub Actions have **not** yet been run for this module. It needs a future Agent 41-style common-policy runner to emit authenticated native evidence under an independently committed fresh v2 plan. Agent 8 is independently investigating the final-dispatch Shadow Mist legality interceptor; this module does not replace that work or alter the historical v1 archive.

**Field coverage: 29/32 exact published 60s. Competitive-qualified games: zero. No 99.5% claim.**
