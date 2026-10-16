# K0 deck-and-Prize conditional hidden-state sampler

**Agent 18, 16 October 2026.** Evidence: conditional finite-population reasoning, synthetic detached-State regression, manual CI. **No full-game competitive inference.**

## Failure mode addressed

An evaluator that permutes only the physical remaining deck still knows which cards are physically Prized. Before a first deck search and absent independent Prize observations (K0), that membership is inaccessible to the human player. Thus a hidden-order-only determinization cannot be K0-safe by itself. A publicly identical state can have a different source-deck list if an unseen evolution card or Supporter is exchanged with a face-down Prize.

The [experimental detached sampler](../../simulation/twinleaf/detached-deck-sampling.cjs) now supports `sampleUnknownPrizes:true`, guarded by `prizesUnobservedVerified:true`. It collects the acting player's *unobserved* deck suffix and all hidden Prize contents from each completely detached clone, canonically sorts the combined unknown multiset, applies one deterministic seeded permutation per sample, then restores the proper deck-suffix length and individual Prize-slot occupancies. Any known deck-top prefix stays in its observed order only under the separate `knownTopVerified:true` guard. All source Card objects remain isolated from hypothetical scoring.

For genuinely uniform unobserved allocations conditional on the visible cards, this is a finite-population sample over joint deck/Prize membership and order. That uniformity is a **substantive modeling assumption**. The positive caller assertion is a claimed prerequisite, not proof that a real state actually satisfies it.

## Controlled results

[Pure regression suite](../../tests/twinleaf-detached-deck-sampling.test.cjs):

- Two states with the same observed top A and the same unknown multiset B,C,D,E assign B to the hidden deck in one physical State and to an unknown Prize in the other. All corresponding fixed-seed sampled scores agree exactly despite the physical partition difference.
- Exhausting all **24 permutations** of the four unknown card identities, with two unknown deck positions and two hidden Prizes, gives **P(B is the immediate next card) = 6/24 = 25%** and **P(B is Prized) = 12/24 = 50%**. This checks both sampled assignment sides against exact counting.
- The original live State remains unchanged after evaluation. Guard tests reject unverified Prize-status claims and unverified or out-of-bounds known-top prefixes.

The existing manual hidden-information workflow [passed at revision 3b2d57b](https://github.com/FlareZ123/experiment-01/actions/runs/38907365506), including these new synthetic tests and the previously compiled Twinleaf integration steps. The preceding [known-top-only CI](https://github.com/FlareZ123/experiment-01/actions/runs/38906855691) also passed. None of these new K0 tests asserts that a real rank-2 or rank-10 source-turn decision was corrected.

## Remaining blockers

A real deployment must establish the exact observation history: no full-deck search yet, which Prize identities (if any) have been observed, whether remembered deck positions are known, and whether the residual allocation is actually uniform. This API does not infer those facts from physical hidden zones. It also cannot correct *pre-evaluation* deck membership gates such as the earlier [Bunnelby K0 leak](bunnelby-k0-prize-hidden-branch.md), and it does not model hidden opponent information or make the vendor Simulator's clone semantics automatically faithful.

The public whole-match own-deck hook still defaults to K1 and refuses K0 because a static per-game assumption would become wrong after observation-changing actions. The new K0 option is a conditional building block for bounded same-state decision tests and future observation-ledger integration. It is not ready to qualify Aichi games or any 99.5% claim.

## Pinned Store K0-equivalent action-availability probe

[The separate compiled Store audit](../../simulation/twinleaf/k0-detached-bunnelby-audit.cjs) uses the prior Bunnelby PRC / Oddish / Jet Energy / TM: Evolution conditioned board. One hidden allocation holds Gloom UNB in the five-card target deck; the other physically exchanges that Gloom with a face-down Prize. The original `hasBenchEvolutionTarget` predicate returns true/false respectively. The real Store players' recorded public board, hand, visible attached resources, turn and deck/Prize counts remain identical.

Under the new Prize-inclusive detached sampler, both physical allocations produce **identical sampled availability values** with the same twelve fixed-seed conditional deals. The test also verifies that the genuine source Store state, Card identities, hidden deck, Prize arrays and public board remain unchanged. The [manual workflow run 38908384875](https://github.com/FlareZ123/experiment-01/actions/runs/38908384875) passed the full existing hidden-information suite plus this new pinned-State regression, at revision `bf1b800f`.

This strengthens the implementation-level diagnosis beyond plain synthetic objects. The rank-2 side of this particular fixture has a *conditioned five-card target deck* and is not an exact 60-card source deal. Its `hasBenchEvolutionTarget` evaluation is a narrow callback, while the actual Bunnelby tactic runs additional physical-deck gates before scoring. The result remains an action-availability information-set diagnostic, not a complete game-policy correction or a measured matchup.

## Complete published rank-2 60-card source-inventory contrast

A stronger [rank-2 complete-inventory fixture](../../simulation/twinleaf/rank2-full-source-k0-sampler.cjs) reconstructs all **60 physical source printings** of the published Aichi Vileplume deck. It conditions on a Bunnelby PRC Active holding Jet Energy PAL and Technical Machine: Evolution PAR, an Oddish UNB Bench, and a four-card hand of Guzma & Hala CEC, Tag Call CEC, Stealthy Hood UNB and Capture Energy RCL. Exactly 46 hidden deck cards and six face-down Prizes remain. Both alternative allocations conserve every printed source copy while keeping those eight observed resources and all public counts the same.

Both Gloom UNB copies are in the physically hidden deck in one allocation and **both Prized** in the other. The legacy physical `hasBenchEvolutionTarget` returns true versus false. With 16 fixed-seed conditional joint deck/Prize samples, the new detached evaluator returns **equal posterior scores** for the two physically distinct K0 states and leaves actual source zones untouched. The [source-60 tests](../../tests/twinleaf-rank2-full-source-k0.test.cjs) and recorded executable passed [manual CI run 38909283702](https://github.com/FlareZ123/experiment-01/actions/runs/38909283702), source revision `b67b4bc`.

The conditional exact probability that **both** available Gloom lie among the six hidden Prize cards, given the specified eight known cards and otherwise uniform 52-card allocation, is `C(50,4)/C(52,6) = 1.13122171946%`. Thus the exact conditional chance at least one Gloom is in the real deck is `98.86877828054%`. Those are card-location probabilities under a hypothetical state, independent of bot actions. The 16-sample diagnostic is an invariance check, not a high-precision probability estimator.

This is an actual compiled Twinleaf Store graph with a full source-ranked physical 60, constructed by explicitly selecting the eight public resources rather than replaying a genuine deal. It still does not demonstrate actual first-turn access, an automatic full-bot response, item-lock resolution, competitive outcomes or a qualified game.
