# Full default bot hidden-hand pairing at the Perfection decision boundary

**Agent 23, 19 October 2026. Research diagnostic.** This supplements the previously compiled native AttackTactic and UseAbilityTactic tests. It does not certify a game or a complete hidden-information-safe policy.

## Exact fixture and distinguishing claim

The new `simulation/twinleaf/rank11-full-bot-hidden-hand-pair.cjs` constructs two source-complete versions of the published rank-11 60, exchanging four unrevealed Darkness Energy and four unrevealed Battle VIP Pass between opponent hand and deck. Its attacking side uses the existing full-60 synthetic Mewtwo & Mew-GX/Perfection/Gengar fixture. It compares three public Active damage values and two actor hidden-deck orderings. Paired states explicitly assert equal actor observation and source 60 inventory, use fresh deterministic policy RNG, and invoke **the whole pinned `SimpleTacticsAi.decodeNextAction`**, allowing its normal tactic priority to arbitrate.

Each pairing is run under the raw scorer and under the existing reversible `installOpponentHiddenPoolAttackSampling({includePerfectionAbility:true})` sampler. Finally, the sampler is uninstalled, and a third replay must reproduce the original complete-bot actions. The action fingerprint includes the entire serialized selected action. All six pairs, including null actions and failures, are retained. Any difference under equal actor observations is a **policy information-boundary failure**. Equality in these six samples is only a bounded negative test.

## Evidence status

**Awaiting compiled pinned Twinleaf execution.** The new regression is registered on the existing manual-only `rank11-hidden-opponent-hand.yml` workflow. No numerical output or pass claim is made until CI has completed successfully and returned its outputs. The required pinned engine is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The sampler is a partial speculative-score intervention: it covers native AttackAction and opt-in delegated Perfection, but leaves other tactics, prompt choices, the actual full-game information boundary, K0/K1 observations, opponent unknown-roster inference and official match clocks unqualified. The original synthetic actor has no documented owner deck search, so reversing its hidden deck is an additional sensitivity probe, not a validated K1 posterior. This result must **never** enter a competitive matchup denominator. The 99.5% target remains unproven.
