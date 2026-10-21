# Guzma-connected source Energy staging reverses the rank11 native outcome

**Agent 50 | 21 October 2026 UTC | single retrospectively selected same-deal original Store experiment.** This result tests the opponent decision policy under the unchanged source and candidate decks. No competitive-qualified game or paper win rate results.

## Preregistered causal comparison

Prior native source-first Aichi rank11 Mega Absol/Garbodor vs New Moon Lockbreaker v1 showed the source retained Guzma after a real T7 Marnie redraw, executed that Guzma T9 when prompted, yet failed to deliver any attack. The next question was whether **Darkness Energy placement**, rather than simply choosing a Supporter, prevented recovery. The preregistration [`agent50-guzma-energy-route-counterfactual-20261021.md`](https://github.com/FlareZ123/experiment-01/blob/agent50-sourcefirst-marnie-rescue-20261021/results/aichi-2026/registrations/agent50-guzma-energy-route-counterfactual-20261021.md) fixed the original source deck, candidate deck, first-turn order, both physical seats, seed, canonical native root policy, source-only Marnie and Guzma, native prompt-choice baseline, and paper Supporter quota guard. Only the **owner-visible source-seat0 Energy recipient preference** was toggled.

Pinned Twinleaf submodule commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Frozen source rank11, seat0 first; candidate New Moon seat1; seed `482443328`; identical source initial physical deal fingerprint `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`. The control was required to reproduce exact source Marnie+Guzma game ledger SHA256 `b6ccc668fa4bf99058e57606e4efe7b01e629a9c7505cb2f897b9ea1b6357468` before any outcome was considered. It did.

The existing near-term damage heuristic prefers a shorter damaging Bench attack if a held **Switch** or **Escape Rope** offers future mobility. The treatment admits held **Guzma BUS** as a *future* mobility connector when the opponent visibly has a Bench, and applies the option only to the source physical seat0. It does not assume Guzma can be played on the same turn as Marnie or read concealed cards. The actual proposed recipient is chosen dynamically by the public attack-cost optimizer and native Store validates every card.

## Exact original native Store result

| Measure | Control with standard source Energy planner | Source Guzma-aware Energy staging |
| --- | --- | --- |
| Initial physical source deal | Same verified SHA | Same verified SHA |
| Decklists, player seats, starting order, RNG seed | Frozen | Frozen |
| Source T7 Energy | Active Garbodor BKP | **Benched Crobat V DAA** |
| Source T9 Energy | Active Garbodor BKP | **Benched Crobat V DAA** |
| T7/T9 Energy root Store receipt | Confirmed | Confirmed |
| Source T9 played Guzma | Yes | Yes |
| Longest equal *root action label* prefix | 144 | 144 |
| First different root **action label** | Source T29 Pass | Source T29 **Venomous Fang** |
| Source settled attacks | **0** | **7** |
| Candidate settled attacks | 9 | 4 |
| Final source/candidate Prize cards remaining | **[6,0]** | **[0,3]** |
| Engine winner | Candidate seat1 | **Source seat0** |
| Accepted native root-action count | 181 | 202 |
| Native root-action SHA256 | `b6ccc668fa4bf99058e57606e4efe7b01e629a9c7505cb2f897b9ea1b6357468` | `1fe3df677e5f9204e8675171e31dcc1302ddadf310811e41040f146e63cc5434` |

**Crucial trace interpretation:** The first different *action label* is at native root ordinal 144, source T29, because the compact root-action ledger records `PlayCardAction Darkness Energy` but omits its targeted Active/Bench slot. The actual physical causal change happened **at source T7 root49** and again at **source T9 root64**: native actor intents and real Store public receipt identify destination `{slot:'bench',index:1}`, attack `Venomous Fang`, gap from2 to1 then from1 to0. The control instead records destination `{slot:'active',index:0}`, `Offensive Bomb`, gaps4→3 and3→2. Later T28 promotion makes the previously funded Crobat V able to use its real attack at native source T29, T31, T33, T35, T37, T39 and T41. All seven source attacks are **settled attacks under the actual pinned Store**, and the source wins its sixth Prize by natural engine terminal. The candidate in the treatment had three Prize cards left.

The optimizer selected **Crobat V**, despite the initial motivation considering an Oranguru V route: Crobat's attack has a shorter visible deficit after one Darkness, while Oranguru remained a plausible but less immediately reachable attacker. The real selection is important evidence that searching over board-accessible attacks can find interactions the motivating hypothesis did not preidentify.

## Evidence, validity, and reproducibility

- Completed run [39691152188](https://github.com/FlareZ123/experiment-01/actions/runs/39691152188), native paired step and all actor pure tests **passed**. [Original full JSON source Marnie, Guzma and Energy comparison: artifact 12388702681](https://github.com/FlareZ123/experiment-01/actions/runs/39691152188/artifacts/12388702681), zip SHA256 `36e97ea21f89bf1781cb4f18c19f2b6f15082212d2fee71fd41b3864be064112`. The artifact includes all three paired JSON files, source-attached Energy intent, real Store physical confirmations, each accepted root ledger, prompts and terminal outcomes.
- Experimental implementation isolated on [branch `agent50-sourcefirst-marnie-rescue-20261021`](https://github.com/FlareZ123/experiment-01/tree/agent50-sourcefirst-marnie-rescue-20261021), program `simulation/evaluation/agent50-sourcefirst-guzma-energy-staging-pair.cjs`, root `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, Energy recipient `simulation/twinleaf/agent44-actor-energy-recipient.cjs`, pure `tests/agent50-guzma-energy-staging.test.cjs`. Option `AGENT50_GUZMA_ENERGY_STAGING_DEV` plus physical source owner seat flag is **off by default**.
- Exact control root SHA and source deal equality are assertion gates. The treatment and control completed naturally, with no game-state error or prior code branch abort. The generic source opponent still inherits known weak first-legal native Pokémon choice and other root-decision gaps.

This is an instructive **counterexample to interpreting native source-stranding as a robust matchup win**. On a single unchanged deck and deal, a source policy improvement that allocates the very same Basic Darkness cards to an accessible damaging Pokémon reversed the native winner, increased settled source attacks from zero to seven, and cut candidate settled attacks from nine to four. It demonstrates policy sensitivity and a testable path toward stronger source adversaries. **It does not demonstrate a real tournament win rate or establish that either policy is human-competitive.** The slow 41-turn source victory especially requires paper match-clock calibration, independent seeded trials, the full 32 authenticated opposing lists, and a balanced opponent policy before tournament-strength comparisons. Benchmark remains **29/32 exact lists, zero competitive-qualified games and no demonstrated 99.5% fixed-deck win rate**.
