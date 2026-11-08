# Agent47: preserve persistent Active-spot lock Abilities during generic retreat fallbacks

**8 November 2026.** Implemented shared, default-safe owner-public position protection for four existing mobility planners. These planners previously considered card payment, retreat cost, Bench Energy and prospective damage, but not the cost of **losing an Active-only passive Ability** after repositioning.

## Strategic counterexample: paid damage can lose an ongoing lock

An Iron Thorns ex with printed **Initialization** in the Active Spot suppresses Rule Box Pokémon Abilities except for Future Pokémon. A generic fallback that sees zero Energy on Iron Thorns and an Energy-funded Benched attacker can recommend retreating to that attacker, dropping Initialization and restoring the opponent's engine. The same failure mode applies to **Stoutland's Sentinel** Supporter lock, **Galarian Weezing's Neutralizing Gas** and **Jellicent ex's Oceanic Curse** Item/Tool lock. These effects are position-dependent. A "potential KO" or "better-funded attacker" score alone does not measure the value lost from abandoning a lock. Voluntary retreat is perfectly legal in suitable states; the tactical chooser simply lacks a certified counterfactual that would justify relinquishing control.

The owner's detached public Pokémon record includes each Ability's name, type and **printed text** in `abilityDetails`. No extra native State access, opponent hand/deck/Prize knowledge, inferred opponent archetype, or hidden information is needed to detect explicit `As long as/While/If this Pokémon is in the Active Spot` and `As long as/If this Pokémon is your Active Pokémon` clauses. This detection is deliberately conservative: it preserves *any* position-dependent Ability because the generic fallback cannot establish its strategic opportunity cost. It is an owner-policy veto, never a rule claiming that retreat is illegal or always inferior. A separately evaluated dedicated line may still intentionally reposition a lock attacker.

## Applied code

The shared helper `simulation/twinleaf/agent47-active-position-retreat-veto.cjs` exports `hasActivePositionAbilityToPreserve(view)` and is called before choosing a generic mobility proposal by:

- `agent1-owner-float-stone-mobility.cjs`: held/attached Float Stone and printed-free retreat to a charged Bench.
- `agent7-actor-free-retreat-frontier.cjs`: free retreat into a Benched potential Knock Out.
- `agent31-zero-energy-strand-floatstone.cjs`: Float Stone rescue of a zero-Energy Active.
- `agent42-public-two-unit-paid-retreat-proposal.cjs`: paid two-Colorless retreat into another funded attack.

This is a **policy change to fallback proposals**; no card text, native reducer, paper interaction, frozen 60, existing experiment registration, or Store legality is changed. The guard is reached only when an existing opt-in mobility branch actually runs; no claim of a competitive improvement or field-game qualification is made.

## Executed evidence

[GitHub Actions 42521809222](https://github.com/FlareZ123/experiment-01/actions/runs/42521809222) passed **38/38** Node contract tests under Node 22, including all existing Agent1, Agent31 and Agent42 movement regressions, and the new eight-case Agent47 suite covering five position-dependent Ability wordings, non-active-conditioned Abilities, untouched opponent private data, and an intact ordinary **free-retreat to funded Bench** path. The smaller initial test-only [42521698015](https://github.com/FlareZ123/experiment-01/actions/runs/42521698015) also passed. Source test: `tests/2026-11/agent47-active-position-retreat-veto.test.cjs`. A manual-only, 5-minute CI workflow is at `.github/workflows/agent47-active-position-retreat-veto.yml`.

**Limits:** these are pure contract and native-compatible observation shapes, **not** a paid Store execution or a fresh prospective match. The guard can abstain when an Active-only Ability is suppressed, or when a replacement Pokémon could carry the same lock. Such decisions need matchup-state and post-retreat tests before a mobility optimizer may confidently overrule the conservative veto. No change to benchmark status: **29/32 authenticated original lists, zero qualified competitive games, no selected fixed 60, no demonstrated 99.5% win rate**.

## Useful next move

Run a registered full-state Source vs Iron Thorns/Supporter-lock native counterfactual with the real Ability resolver and the old/new opt-in mobility policy under identical public states. Capture the Ability's loss after voluntary movement and the resulting opponent action, then identify when switching to another same-lock attacker or achieving the final Prize can legitimately dominate preservation.
