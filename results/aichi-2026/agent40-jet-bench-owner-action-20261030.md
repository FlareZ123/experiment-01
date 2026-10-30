# Agent40: owner-visible Jet Energy Bench switch funding, development proposal

**30 October 2026 | Normal research mode (RNG 6) | Agent 40 | Original Aichi Top32 paper Expanded**

## Independent gap

The existing `agent17-public-context-special-energy.cjs::choosePublicContextSpecialEnergy` deliberately declines a Jet Energy attachment to a Benched Pokémon, because Jet's mandatory switch demands a separate Active-position decision. The existing `actor-energy-payability.cjs` already represents Jet's Colorless unit, and the canonical `agent34` actor dispatch already supports a typed `attach-special-energy` with `slot:'bench'`. This work adds a small missing action proposal and **reuses** the existing payability and action machinery rather than adding a second Energy model or a new simulator.

There are **five Jet Energy copies** across the authenticated rank-2 and rank-15 original field sources, per the [29-source Special Energy census](agent41-paper-field-special-energy-numeric-coverage-20261030.md). A named card's presence proves neither a playable root nor a beneficial line.

## Executable contribution

- [`agent40-public-jet-bench-frontier.cjs`](../../simulation/twinleaf/agent40-public-jet-bench-frontier.cjs) proposes one real held Jet card to an actual Bench index if the Active has no known payable printed attack and the Bench target gains a publicly payable, positive-*printed*-damage, non-GX attack with that Colorless unit.
- The proposal screens visible Energy quotas, played-this-turn restrictions, public attack-lock and status flags, and Temple of Sinnoh's suppression of the forced switch. It considers only the acting player's own hand and two public boards, using the existing `publicSpecialAttackPayable` cost model.
- [`agent34-actor-only-root-policy.cjs`](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) calls it **before the generic Basic Energy attachment** only with `jetBenchSwitchRoot:true` or `AGENT40_JET_BENCH_SWITCH_DEV=true`. **Default behavior is unchanged.** The existing typed `attach-special-energy` action constructor supplies the physical Bench target to the genuine native Store.
- The [nine pure regression tests](../../tests/agent40-public-jet-bench-frontier.test.cjs) cover a selected Bench position and hand index, paid Energy quota, lock, Temple, no positive printed damage, printed GX attack exclusion, preserving an already payable Active attack, hidden-zone perturbation and the default-off integration into the actual actor root with the existing symbolic Energy matcher.

The initial eight isolated pure tests **passed locally** in Node. The ninth shared-root integration test was subsequently **executed and passed** together with the other eight under the existing manual-only [Aichi benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml), [Actions run 41135017827](https://github.com/FlareZ123/experiment-01/actions/runs/41135017827), job `test-benchmark`, step `Check default-off owner Jet Bench switch proposal and shared symbolic Energy matcher`. This test was observed to run, not skipped; it still uses synthetic, detached actor data and does **not** settle Jet's native card effect. No on-push workflow was introduced.

## Qualification and limits

**This is a candidate policy action family, not a settled Jet switch, attack, or performance experiment.** The following remain unverified: native Store's acceptance of the Bench attach on an authentic physical original-source deal; resolution of Jet's forced switch; the selected Pokémon occupying the Active Spot after prompt completion; the next actual attack, damage and Prize transitions; a subsequent opponent response; repeatability against both source seats and competing policy alternatives.

The action policy uses a coarse printed-damage threshold and excludes GX and complex attack effects deliberately. It does not certify tactical value, rule-equivalence of every source printing, or opponent competence. In particular, a known payable Active attack is conservatively retained; an optimal strategy may differ. The existing common actor and fallback are still **not certified owner-information-safe for every branch**.

The current benchmark remains **29/32** authenticated original final-rank 60s (ranks **23,25,28** unresolved), **zero competitively qualified games**, no established single winning 60 and **no demonstrated 99.5% game win rate**.

## Required next integration witness

In the one canonical bilateral runner, opt in the same `AGENT40_JET_BENCH_SWITCH_DEV` root for **both physical players**. On a prior-registered exact source deal, count held Jet owner roots → structural candidates → proposed typed attach → Store accepted → forced switch resolved → later owner attack root → native attack settlement → source response. Archive both successful and censored/failed arms; compare against default-off and competing moves without inspecting concealed opposing cards. Until this witness exists, keep the Jet lane development-only.

**Commits:** [selector](https://github.com/FlareZ123/experiment-01/commit/172b4e567a86f094d9a8578306f392ba22fa1737), [pure tests](https://github.com/FlareZ123/experiment-01/commit/3cb6ec676b7afb39fa5efcc8209f6f99590afb3a), [shared opt-in](https://github.com/FlareZ123/experiment-01/commit/4c7ba034ae106814737c78110424497e192d1e5f), [integration test](https://github.com/FlareZ123/experiment-01/commit/67837dc879cf704ccc4f5ee3d55f4449f225a023).
