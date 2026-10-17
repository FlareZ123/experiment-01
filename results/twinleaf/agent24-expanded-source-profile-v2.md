# Source-aware Expanded policy composition v2

**Agent 24, 17 October 2026.** This report concerns *automated decision fidelity*, not a candidate deck win-rate estimate. The only intended objective is stronger, more honest evaluation of one fixed 60-card list against all 32 Aichi opponents.

## Artifact and scope

A separate, opt-in profile in [policy-profiles.cjs](../../simulation/twinleaf/policy-profiles.cjs) is named `expanded-source-k0-stage-gh-v2`. The earlier `expanded-action-fidelity-probe-v1` profile is preserved verbatim for comparisons. The source-aware profile uses existing headless options `bunnelbyK0SafeEvolution`, `bunnelbyTargetAwareEvolution` and `bunnelbyGuzmaHalaMode1` together, plus previously versioned Supporter decision guard, mandatory-option fallback, Tool-aware attack tactic, Temple response and Double Dragon attachment.

The new profile explicitly omits the older global Bunnelby tactic, then configures one per-seat Bunnelby policy using each seat's **known physical printed source 60**. At K0, tactical possibility and target selection subtract visible cards from that source inventory without reading actual hidden deck and Prize contents. It intentionally leaves the optional observed K1 gate off, because full information-set equivalence, clone noninterference and policy competence remain unqualified.

The new profile also conditionally prefers Guzma & Hala mode one when the owned/public state plus original printing inventory suggest a plausible Bunnelby, Stage, Tool or Jet Energy line. This preference does not prove that two discardable cards exist, that the Supporter is the optimal use of the turn, or that the full ALS executes.

## Compiled verification

[Manual GitHub Actions run 39036614402](https://github.com/FlareZ123/experiment-01/actions/runs/39036614402), head SHA `b829a28a852e4806eec2c317454ce05225bb4830`, compiled the pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` dependency and passed **39/39 tests** with zero failures in the expanded Supporter/manual-prompt suite.

The run includes:
- `tests/expanded-policy-profile.test.cjs`: separate profile name; the K0 profile's both-seat flags; its recorded policy provenance; restoration of shared compiled tactic/resolver arrays; a bounded real engine smoke.
- `tests/bunnelby-guzma-hala-mode.test.cjs`: genuine Store Guzma & Hala mode-one prompt, mandatory discard-two, TM Evolution and Jet Energy search, and K0-invariant Prize layouts.
- `tests/bunnelby-tm-target-selection.test.cjs`: conditioned printed-rank-2 Bench target comparison and invariance over paired hidden Gloom Prizes.
- `tests/bunnelby-k0-source-inventory.test.cjs`: source-60 inventory behavior.
- Previous Supporter proposal, mandatory-option, Lost Vacuum and printing-resolution regressions.

The workflow remains **manual-only**. No workflow runs on every commit.

## Evidence boundary

This qualifies **unit/integration behavior for these explicitly tested paths**. It does not qualify:
- any competitive match or all 32 individual opponent matchups;
- game-strength benefits of new policy versus legacy or competent human responses;
- full closure/reducer replay or cloned hypothetical action equivalence;
- all card-printing semantics and every game-state legality interaction;
- whether source-possible Stage, Jet or Tool is truly present after unknown Prize placement;
- downstream discard-resource opportunity cost, K0-to-K1 timing or actual complete first-going-second ALS.

**Qualified competitive games: 0. Demonstrated win rate: none.** The rank-1 Shadow Rider reference remains unchanged. See [the project decision board](../aichi-2026/critic-qualification-critical-path.md) for acceptance requirements.

## Next experiment

Use both profiles with the exact rank-2 and rank-1 60-card source lists under the same predeclared physical seats and random seeds, preserving the opening provenance and recording action-level differences. Any action-limited weak-bot trace is a diagnostic only. After a reproducible decision difference, independently inspect genuine Store prompts, strategic discard availability, opponent replies and K0 information-set noninterference. Do not promote a deck or quote a competitive win-rate from these probes.
