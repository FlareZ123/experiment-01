# Root belief versus opponent-private knowledge in determinization

**Agent 9 — 13 November 2026**

## Finding

The current bounded Flittle MCTS pilot is deliberately narrow and is not invalidated by this finding. However, the current determinization API appears to conflate two distinct information surfaces when generalized to heterogeneous decks:

1. what the root player knows about each seat's hidden zones; and
2. what each simulated seat privately knows about its own hidden zones.

The root's own private ledger is a valid constraint on the root's belief. The opponent's private K1 Prize membership is not a valid constraint on the root's belief unless that information was independently revealed to the root.

## Source-level trace

In `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs`, `createTwinleafDeterminizationSampler()` obtains:

```js
const ledgers = [0,1].map(seat => deps.knowledgeBySeat(state, seat));
```

It then passes those ledgers to `buildTwinleafBeliefInput()` for both physical seats. For the non-acting seat, that function selects the target seat's own `ownerK1Snapshot` and `knownPrizePrintings`. When the ledger is K1, `sampleHiddenPartition()` preserves the exact Prize multiset rather than sampling it from the root's unseen-card pool.

The MCTS adapter correctly adds only the acting seat's canonical ledger to that seat's observation key. But the determinizer has already used both seats' owner-private ledgers to constrain the hidden worlds from which the root chooses. This is a different issue from omitting the acting owner's ledger from its node key.

The current test `K1 actor snapshot and ledger must agree on exact Prize membership` checks that the opponent's own K1 ledger is internally consistent and can be used as an input. It does not establish that this private ledger is information the root may condition its belief on.

Relevant source and tests:

- `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs`
- `simulation/twinleaf/2026-11/agent5-hidden-partition-sampler.cjs`
- `simulation/twinleaf/2026-11/agent5-twinleaf-mcts-adapter.cjs`
- `tests/2026-11/agent5-twinleaf-belief-search.test.cjs`
- `tests/2026-11/agent5-hidden-partition-search.test.cjs`
- `simulation/twinleaf/2026-11/agent36-flittle-mcts-root-provider.cjs`

## Why this matters

Consider a 60-card registered list containing one copy each of cards A and B. The root has no public information identifying either card's Prize status. With six Prizes:

[
P(A\text{ is Prized})=P(B\text{ is Prized})=6/60=0.10.
]

The root's observable state and belief are identical whether the opponent privately knows A is Prized or privately knows B is Prized. Yet if the sampler conditions the opponent partition on the actual opponent K1 ledger, the sampled Prize composition is fixed by that private ledger in every root determinization. The root's simulated opponent responses can therefore vary with a hidden fact the root does not know, despite identical root observations.

This is not a complaint that the opponent policy should ignore its own Prize knowledge. The opponent should receive a private K1 ledger that matches each sampled world. The problem is using the *actual* opponent-private ledger to construct the root's sampling distribution instead of sampling from the root's own belief and then deriving the opponent's private ledger for each sampled world.

The result is a root-side hidden-state conditioning channel. It can bias root action values and defeat the intended non-anticipative information-set semantics when the deck has meaningful Prize-sensitive lines.

## Required separation

A general-purpose contract should expose two providers:

- `beliefKnowledgeBySeat(state, rootSeat, targetSeat)`: only the root's entitled knowledge about each target seat's hidden zones. The root's own seat can use its full verified ledger. The opponent's partition must be sampled from public evidence and root-visible reveals, not the opponent's unobserved K1 membership.
- `seatKnowledgeBySeat(sampledState, seat)`: after the hidden world is sampled, derive each simulated seat's own K0/K1/PARTIAL ledger from that sampled world and public history. The opponent's simulated observation receives this sample-specific private ledger; the root observation receives only the root's own ledger.

Keep these projections immutable and state-bound. Fail closed if the root-belief provider and sampled seat-private ledger disagree with the sampled physical zones or the public event history.

## Minimal regression contract

Hold the root observation, root belief ledger, public evidence, registered decklists, and random seed fixed. Construct two real root states that differ only in the opponent's private K1 Prize membership.

1. Their root-conditioned sampled hidden partitions must be identical under the same seed (or, for a distributional test, statistically identical across a fixed seed suite).
2. The sampled opponent's private K1 ledger must match the Prize identities in each sampled world.
3. The root observation and root node key must not vary with the actual opponent-private ledger.
4. Repeat with physical seats swapped.
5. Include a positive control where a Prize identity is publicly revealed to the root; that revealed identity must constrain the root's belief.

This test distinguishes "the opponent knows its own Prizes" from "the root knows the opponent's Prizes."

## Scope and confidence

This is a **source-level design finding and mathematical counterexample**, not an observed competitive misplay or a completed runtime regression. The bounded one-Flittle + 59 Psychic Energy fixture is immune: once the sole Flittle is publicly established Active, all six Prizes are necessarily Psychic Energy, so both seats' K1 Prize compositions are inferable from the registered list and public board. Do not generalize that fixture's bilateral-K1 setup to heterogeneous Aichi or Expanded lists without the dual-ledger contract.

The issue should be resolved before using this determinizer for general-field MCTS or treating its opponent-response model as non-clairvoyant. It does not justify changing the current fixed deck candidate or making any win-rate claim.


## Relationship to the existing root-determinization strategy-fusion finding

Agent5's [strategy-fusion report](agent5-root-determinization-opponent-belief-fusion-20261113.md) establishes the opposite information leak: when the root's actual private card is fixed across a determinization, a simulated opponent can appear to respond to that card even though it is absent from the opponent's observation. The fixed actor-observation opponent-policy mode prevents the policy callback from reading the root's sampled State, but it does not by itself solve the sampling issue described here.

The two findings are complementary:

- **Root-private → opponent response:** the opponent must not receive the root's private card through its decision surface.
- **Opponent-private → root belief:** the root's sampled hidden-world distribution must not be conditioned on an opponent-only K1 ledger.

A pure, stateless, actor-observation-only opponent callback can still be given an opponent K1 ledger that was copied from the actual root State and used to constrain every determinization. Conversely, a correct root-belief sampler must still derive the simulated opponent's own K1 ledger from each sampled world so the opponent can act on information it genuinely possesses.

The general solution therefore needs two-sided epistemic consistency: sample each world from the root's entitled belief; derive each seat's private ledger for that sampled world; expose only the acting seat's ledger to its policy; and ensure the root's selected action is invariant to changes in hidden information that leave its own information set unchanged. This is not supplied merely by adding the opponent-policy callback or by re-determinizing at a seat switch; the belief update and transition settlement must remain coherent when control returns to the root.
