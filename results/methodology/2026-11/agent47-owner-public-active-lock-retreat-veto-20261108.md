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

## Owner-public equivalence refinement (v2)

The original global veto also rejected a replacement **Iron Thorns ex** with exactly the same ongoing `Initialization` Ability and full printed card identity. This mattered because three authenticated Top32 original lists (ranks 6, 24 and 29) contain four Iron Thorns ex each: switching between them may retain Ability lock while improving the active board.

The shared helper now exports `wouldLoseActivePositionAbility(view, benchIndex)`. Each mobility planner tests its *actual prospective target*. It permits a handoff only when the target's **printing is identical** and the public Ability name plus complete text match for one of four explicitly identified position-only lock Abilities: Initialization, Sentinel, Neutralizing Gas or Oceanic Curse. All other Active-conditioned Abilities, different printings, missing recipient text, or mismatched text are still conservatively protected. Selection searches all eligible Bench slots instead of rejecting the entire position based solely on the original Active. Native state and opponent hidden zones remain untouched.

[Corrected contract suite 42522533052](https://github.com/FlareZ123/experiment-01/actions/runs/42522533052) passed **41/41** including exact same-print handoff and different-print abstention. An earlier [42522206997](https://github.com/FlareZ123/experiment-01/actions/runs/42522206997) had a synthetic fixture incorrectly named `Owner ability` where real printed name is `Initialization`; the name was corrected and full suite passed.

A separate opt-in native Store test `tests/2026-11/agent47-iron-thorns-active-lock-handoff.native.test.cjs` stages Float Stone attachment, actual RetreatAction, and the engine's `IS_ABILITY_BLOCKED` for a physically separate opposing Tapu Lele-GX on **both original seat assignments**. The identical-Iron Thorns replacement is compared with a differently printed replacement. This tests the underlying native effect's persistence rather than inferring it from the regex alone. Test outcomes remain developmental and cannot be used as a qualified tournament result.

## Final integration: ten generic owner mobility frontiers, exact native witness

A broader inspection exposed the same position-cost gap in additional registered fallback planners. The owner-public per-target `wouldLoseActivePositionAbility` is now integrated in **ten** distinct existing generic policy modules:

1. `agent1-owner-float-stone-mobility.cjs`;
2. `agent7-actor-free-retreat-frontier.cjs`;
3. `agent31-zero-energy-strand-floatstone.cjs`;
4. `agent42-public-two-unit-paid-retreat-proposal.cjs`;
5. `agent2-held-guzma-mobility-frontier.cjs`;
6. `agent2-owner-guzma-mobility-frontier.cjs`;
7. `agent14-generic-funded-floatstone-frontier.cjs`;
8. `agent10-flexible-paid-retreat-frontier.cjs`;
9. `agent6-actor-paid-retreat-frontier.cjs`;
10. `agent2-actor-multi-basic-paid-retreat-frontier.cjs`.

The voluntary Guzma mobility guards are important for the actual 2026 Top32: authenticated rank2 uses **Stoutland** plus 2 Guzma, and ranks6,24,29 each use 4 **Iron Thorns ex** plus 2–3 Guzma. A user-initiated Guzma that moves into an unrelated Pokémon can lift Sentinel's Supporter lock or Initialization's Ability lock. The guard does **not** blanket-prevent Guzma: a Bench recipient with exactly the same printed lock can replace the Active, and separate explicit **prize-taking/gust tactical** options remain outside these generic rescue gates.

New tests `tests/2026-11/agent47-guzma-active-lock-mobility.test.cjs` examine both historical generic Guzma planners: nonlocking target abstention; identical printed Initialization replacement; scan-past-an-unsafe-first-Bench to a safe later equivalent; and no opponent-hidden-zone dependence. `tests/2026-11/agent47-general-retreat-lock-retention.test.cjs` checks the four added funded/paid-retreat policies for baseline proposal, loss-of-lock veto, and safe exact replacement where payable. No original opponent 60 or previously registered experimental design changed. Original planner tests for all supplemented modules remain included in lightweight CI.

**Actual compiled native physical rule check:** the corrected pinned [CI 42522708931](https://github.com/FlareZ123/experiment-01/actions/runs/42522708931) passed **4/4 controlled Store cases**: owner seat0 and seat1, each with a fully real `PlayCardAction` to attach a Float Stone, `CheckRetreatCostEffect.cost.length===0`, and accepted native `RetreatAction`. When the chosen Bench target was physically a second Iron Thorns ex TWM, the opponent's exact Tapu Lele-GX remained `IS_ABILITY_BLOCKED=true` before and after the swap, with two distinct card instances. In controls promoting a physically different Dedenne-GX, native `IS_ABILITY_BLOCKED` changed from **true to false** as expected. Actual printed state and attached Tool remained on the previously Active Pokémon as required. These observations support the tactical condition underlying the helper; the board was **staged**, not drawn from a randomized original 60, and does **not** qualify as a competitive game.

**Final regression:** [manual contract CI 42523569370](https://github.com/FlareZ123/experiment-01/actions/runs/42523569370) passed **93/93** tests, covering the original general mobility and Guzma proposal contracts plus the new target-specific lock-abandonment and lock-equivalence cases. All six added frontiers have direct regression coverage, existing planner behavior remains in force for ordinary nonlocking scenarios, and no hidden opposing zone is consulted by the new helper.

Remaining realistic limitations: same printed lock can still be suppressed by another card, status or matchup effects; these fallback restrictions may conservatively abstain when that lock is currently inactive. A native controlled board validates the condition, while prospective full-60 policy A/B testing under capable opponents is needed to quantify game-strength impact. The collective win-rate target remains undemonstrated.
