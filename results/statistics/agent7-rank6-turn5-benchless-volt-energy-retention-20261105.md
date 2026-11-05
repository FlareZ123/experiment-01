# Agent7: original rank6 turn-five Benchless Volt Cyclone may preserve all Energy for repeated attacks

**5 November 2026 | rule-derived conditional interaction plus targeted pinned-native regression.**
Zero native turn-five attacks in this target game, zero paper-qualified matches, no win-rate estimate.

## Rule-text proof and the distinct board condition

The archived original rank6 paper deck `results/aichi-2026/full-decklists.json` has four Iron Thorns ex, one Double Colorless Energy, four Speed Lightning, two Capture and one Spiky Energy, two Guzma & Hala and one Thunder Mountain Prism Star.

[Iron Thorns ex TWM77](https://limitlesstcg.com/cards/en/TWM/77) has a **Lightning + Colorless + Colorless** attack, *Volt Cyclone*, dealing **140 damage**, followed by an instruction to **move one Energy from this Pokémon to one of your Benched Pokémon**.

The repository's `resources/manual/EN_advanced_manual-2025-transcription-structured.md` states under section II.A that an attack can be used when part of its instructions cannot apply, and to apply only the parts possible. Section II.C-10 states that if no Pokémon matches the specified receiving Pokémon, the Energy cannot be moved. Because moving is unconditional and lacks any `if you do` dependence on the damage, **a fully funded Iron Thorns attacking with no Benched Pokémon deals its 140 base damage while keeping the exact Energy in the Active Spot**. The statement concerns the attack's effects before opponent-specific damage modifiers and locks.

**Pinned-engine cross-check, independent of the unrun new test:** The checked-out Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` has an implementation of [Iron Thorns ex's `AfterAttackEffect`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex.ts) that explicitly computes `hasBench=player.bench.some(b=>b.cards.length>0)` and returns the existing state immediately if it is false. The `AttachEnergyPrompt` and `MOVE_CARDS` operations appear only in the subsequent nonempty-Bench branch. This is source-code evidence that the pinned card implementation intentionally skips movement with no Bench, consistent with paper manual II.C-10. It is still not a newly compiled execution of the original frozen T5 source state.

This is structurally different from compiled **Agent36 v10** original source turn2 attack cases in `results/methodology/agent36-v10-rank6-settled-volt-reply-20261105.md`. In those, the source had a Benched Iron Thorns, so the one physical DCE was moved from Active to Bench after dealing 140. Those attacks could not immediately repeat on their original Active without acquiring additional Energy or changing the Active attacker. The native v10 evidence does **not** answer the Benchless T5 position.

## Historic original source turn-five candidate

Compiled native original rank6 trial `6:100:A:champion-reference`, source seat1 global T3 paid Plumeria with Enhanced Hammer plus one Mail to discard candidate Active Psychic. Candidate T4 used Pass. At source T5, its owner T5 held G&H, retained Mail and other cards, had 42 deck cards and a previously attached Speed Lightning. See `results/aichi-2026/2026-11/agent7-rank6-plumeria-payment-mail-vs-enhancedhammer-native-20261105.md` and [native CI 42084142754](https://github.com/FlareZ123/experiment-01/actions/runs/42084142754). 

**The precise T5 zero-Bench precondition must be independently asserted in the native owner snapshot.** The preserved `withPlumeriaTurnFrontier` observer already captures `ownBenchOccupied`; newly added assertions in `tests/agent7-plumeria-payment-original48-pair.native.test.cjs` require that it equal zero in both prior physical payment arms. These assertions have been committed but **not yet executed** on latest-head compiled native CI. Do not substitute an observed T3 empty Bench for a missing independent T5 receipt.

If the no-Bench condition and remaining turn quotas are both native-confirmed, a direct owner-held Guzma & Hala paid search may fund Volt Cyclone as follows:

1. If the singleton DCE remains in the deck, obtain DCE with G&H's optional Special Energy search; the existing Speed Lightning provides Lightning and newly attached DCE provides two Colorless. With no Bench, both original Energy cards stay Active after attacking.
2. If DCE is Prized but Thunder Mountain is in deck, G&H can fetch Thunder Mountain and any remaining Special Energy; Thunder Mountain removes the Lightning attack-cost symbol, and Speed plus the newly attached Special Energy supply two Colorless. There are six remaining printed one-unit Special Energy copies among 48 unseen cards; all six cannot fit into the five remaining Prize slots when DCE is Prized. No Bench means no Energy relocation.

The separate conditional two-singleton source-zone envelope in `results/statistics/agent7-rank6-held-ghala-turn5-prize-competitor-20261105.md` establishes `P(DCE or Thunder available in deck) >=371/376` **only** under uniformly distributed unknown six-Prize composition and the documented 12-card out-of-deck observations. It does not establish Supporter payment, access to the selected printed card, current public Stadium effects, actor strategy, successful attack declaration, damage, or a win. In particular, after a successful funded Benchless attack, that exact Energy could **remain attached for a later attack**, contingent on continued empty Bench, unaltered resource effects, and attack eligibility on later turns. No repeat attack has been observed.

## New native falsification gates

- Extended existing conditional real-Store fixture `simulation/twinleaf/iron-thorns-guzma-hala-line.cjs`: when its injected source-representable hand has retrieved DCE, attached it to Active, and Bench is empty, it already asserts opponent Active took 140. Now it **also asserts** that the same original physical DCE object remains attached to Active after attack. Its result reports `exactDceRetainedAfterNoBenchVoltCyclone`.
- New pinned native test `tests/agent7-thorns-nobench-volt-retains-energy.native.test.cjs` requires `damage===140`, `noBenchedPokemon===true`, and `exactDceRetainedAfterNoBenchVoltCyclone===true`. This is a constructed fixture, not the original initial-deal execution.
- Extended `tests/agent7-plumeria-payment-original48-pair.native.test.cjs` to require the **actual old archived source T5** native owner observation `ownBenchOccupied===0` under both same-deal physical Plumeria payment arms.
- Both new checks will run under the existing manual `.github/workflows/twinleaf-completion.yml` Plumeria experiment switch. No new workflow created. Actual latest-head native execution and confirmation are **pending**.

## Strategic consequence and next required evidence

This conditional mechanic may reverse the tempo objection in the recent v10 report. If no own Benched recipient is present at original T5, the source's attack can retain the one DCE it has, allowing a plausible second attack next source turn while keeping Active Iron Thorns Ability lock. A generic source policy must weigh adding more Iron Thorns to Bench against removing its own potential Energy-retention advantage. Even a valid two-hit plan remains vulnerable to KO, bench changes, opponent counteractions, attack lock, or card effects that change Energy/turn resources. There is no verified two-hit line from this historical original seed.

Highest-value next experiment: compare **actual owner-held G&H** to **Mail after Pass** to **Pass** in the exact original turn-five physical deal, enumerate all eligible owner-visible payments and competing Supporter uses, then run real native G&H stadium and Energy searches, attach, AttackAction, empty-Bench Energy custody, and independent next opposing reply. Retain every original registered cap/error arm. Do not elevate any one special-case intervention to selected shared policy without identical actor-only rules on both seats and independent full-game release tests.

**Qualification:** rule-derived conditional card effect; pending genuine compiled native fixture verification; historic original T5 no-Bench receipt pending new assertion. **0 competitively qualified games, 29/32 original 60s authenticated, 99.5% objective unproven.**
