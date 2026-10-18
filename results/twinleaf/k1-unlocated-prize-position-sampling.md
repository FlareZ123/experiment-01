# K1 Prize composition with unknown face-down positions: a separate sampling mode

**Agent 18, 18 October 2026.** Research artifact: conditional full-state determinization and a finite-population test. This is not a policy qualification, source-dealt game result, or win-rate estimate.

## Information-set question

A player can know the multiset of their six Prize cards without knowing which identity is in which face-down slot. After an authentic owner-deck search, the remaining deck contents can reveal Prize *membership* by exclusion, but Prize *positions* remain hidden unless individually observed. Hisuian Heavy Ball's full Prize review followed by a shuffle is a particularly explicit instance. The live [root knowledge epoch](agent40-root-prize-knowledge-epoch.md) models known membership and hidden redeals, but its Boolean K1 state alone does not encode Prize position uncertainty.

Two source states with exactly the same Prized card instances in different face-down positions can therefore be indistinguishable to the player. A speculative evaluator that reads their physical positions without re-determinizing them can prefer an action based on inaccessible knowledge. This is a **possible information leak at that evaluator boundary**, with no demonstrated live Aichi policy exploit in this report.

## Opt-in research implementation

Extended [the detached full-state sampler](../../simulation/twinleaf/detached-deck-sampling.cjs) with `shuffleKnownPrizePositions:true`. It requires both `prizeCompositionKnownVerified:true` and `prizePositionsUnobservedVerified:true`. Every Prize slot must be face down. The existing positional-observation ledger is incompatible with this *fully unlocated* option, as is the existing `sampleUnknownPrizes:true` K0 joint deck/Prize membership mode.

The sampler first deep-clones the actual state and checks that no Card object is aliased into the clone. In this new mode it canonicalizes and reorders the already-Prized cards **within Prize positions only**; the deck suffix is independently permuted by the existing method, preserving the verified known-top prefix where applicable. It uses a separate deterministic Prize-permutation random stream so deck-order and Prize-order sampling do not consume one another's random numbers. It never changes which card instances belong to the Prizes versus the deck. Original physical State cards and zones remain unchanged.

This requires affirmative caller-supplied observation evidence. The flags do not validate actual search/review chronology, K1 status, or the correct posterior after a positional peek. It is a bounded diagnostic and is **not automatically activated in a live bot**.

## Falsification tests and exact expectation

[The extended Node test suite](../../tests/twinleaf-detached-deck-sampling.test.cjs) adds:

1. Two physical Prize arrangements with identical card multiset D/E/F, same observed state and same source deck yield identical fixed-seed hypothetical scores. The original State is unchanged.
2. Exhausting all six physical permutations of three distinct unknown Prize positions makes the probability of finding E in the first chosen slot exactly **2/6 = 1/3** while preserving the whole Prize multiset and known deck top.
3. Missing composition/position proof, a simultaneous unknown-membership sampler, a positional-observation ledger, and a face-up Prize slot all fail closed.

**Validation status:** Manual compiled workflow [39141719030](https://github.com/FlareZ123/experiment-01/actions/runs/39141719030), dispatched for main after the new source and tests. Its outcome should be checked against the immutable workflow head before treating these tests as pinned-engine passing. This report makes no claim that natural source-turn Prize decisions were observed.

## Limitations and next integration gate

The current mode models *all* Prized positions as unknown despite exact known composition. A mixture of individually observed Prize positions plus an unlocated residual multiset requires another conditioned sampler. It also assumes uniformly unknown positional permutations. Publicly known selection histories, deliberate manual rearrangements, peek actions, and card-specific effects may break this assumption. Source information must determine whether a policy is entitled to this mode at the **actual root decision**, independently of the engine's physical Prize array.

Next useful test: capture a real source-dealt root decision following a verified owner deck search or shuffled full Prize review, prove the positional-observation ledger is complete, and compare hypothetical action valuations under two indistinguishable physical Prize permutations. Keep proposal values, actual root action, resolved effect and opponent reply separately authenticated. No target Top-32 matchup or 99.5% achievement is qualified.
