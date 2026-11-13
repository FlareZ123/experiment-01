# Root belief versus opponent-private knowledge in determinization

**Agent 9 — 13 November 2026**

## Finding

The current bounded Flittle MCTS pilot is deliberately narrow and is not invalidated by this finding. However, the current determinization API appears to conflate two distinct information surfaces when generalized to heterogeneous decks:

1. what the root player knows about each seat's hidden zones; and
2. what each simulated seat privately knows about its own hidden zones.

The root's own private ledger is a valid constraint on the root's belief. The opponent's private K1 Prize membership is not a valid constraint on the root's belief unless the same information is independently revealed to, or logically inferable by, the root from its own observation, public evidence and known decklist. This is consistent with the supplied `resources/human_concepts.md` K0/K1 definition: K1 is the knowledge acquired by the player who physically searched their deck, not a global flag that grants the other player the same Prize identities.

## Source-level trace

In `simulation/twinleaf/2026-11/agent5-twinleaf-belief-input.cjs`, `createTwinleafDeterminizationSampler()` obtains:

```js
const ledgers = [0,1].map(seat => deps.knowledgeBySeat(state, seat));
```

It then passes those ledgers to `buildTwinleafBeliefInput()` for both physical seats. For the non-acting seat, that function selects the target seat's own `ownerK1Snapshot` and `knownPrizePrintings`. When the ledger is K1, `sampleHiddenPartition()` preserves the exact Prize multiset rather than sampling it from the root's unseen-card pool.

The MCTS adapter correctly adds only the acting seat's canonical ledger to that seat's observation key. But the determinizer has already used both seats' owner-private ledgers to constrain the hidden worlds from which the root chooses. This is a different issue from omitting the acting owner's ledger from its node key.

The current test `K1 actor snapshot and ledger must agree on exact Prize membership` checks that the opponent's own K1 ledger is internally consistent and can be used as an input. It does not establish that this private ledger is information the root may condition its belief on.

There is also a decklist-prior interaction in the same path. `createTwinleafDeterminizationSampler()` calls `decklistForSeat(...)` to choose the opponent from a public prior, then passes the actual opponent owner ledger into `buildTwinleafBeliefInput()` for that sampled registered 60. `sampleHiddenPartition()` subtracts exact K1 Prize cards and known top/bottom cards from the chosen list and throws if those identities exceed its registered copies. A public-prior candidate inconsistent with the opponent's actual private ledger can therefore abort the sample. The sampler does not itself retry, so this may manifest as a state-dependent search failure; any caller that retries until a compatible list is found would instead condition the public decklist prior on opponent-private information. Either behavior violates the intended public-prior boundary. The root-belief provider must constrain both the hidden partition **and** compatibility checks against sampled opponent lists. For a minimal two-list example, suppose the public prior contains one registered 60 with a single copy of A and another with a single copy of B, and the root's observation does not distinguish them. If the actual opponent K1 ledger says A is Prized, sampling the B-list then fails `subtractCounts()` on A. The correct B-list world should instead give the simulated opponent a K1 ledger derived from that world's sampled Prize multiset (which cannot contain A), without changing the root's prior weight for B. In a per-rank Aichi benchmark where the exact public registered 60 is supplied as a degenerate prior, this particular cross-list abort is not exercised; the root-belief / opponent-private-ledger conditioning error still applies to hidden-zone sampling within that fixed list. There is a related capability-boundary concern: the sampler invokes the injected `decklistForSeat(state, actorSeat, seat, observation, random)` with the full native State. The default `createPublicDecklistPriorProvider()` currently reads only public hand/face-up-Prize evidence, so this is not evidence that the default provider leaks; however, a custom provider can inspect concealed zones or the true opponent list. Narrow the injected provider to actor observation plus sanitized public evidence, as was already done for `ignorePublicCard`. There is also an observation-completeness mismatch in that path: `actorObservation()`'s `publicPlayer()` exposes only `handCount` and `prizeCount`, not public hand identities or face-up Prize identities, while `createPublicDecklistPriorProvider()` reads those identities directly from State and uses them to filter the opponent prior. The sampler can therefore condition its public prior on public information absent from the root observation/hash; two states differing only in a public hand or face-up Prize identity may share a root information-set key while receiving different decklist priors. Expose these visible identities in the detached actor observation (or its sanitized public-evidence object), while continuing to omit concealed hand and face-down Prize identities. Regression: public hand/face-up Prize changes must change the observation key; hidden identity changes must not.


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

Formally, let `I_r` be the root's information set, `S` a complete sampled physical world, and `K_o(S)` the opponent's private ledger induced by that world and the opponent's private/public history. A fixed-policy search should estimate:

```
E[S ~ P(S | I_r)] [
  V(S, opponentPolicy(actorObservation_o(S, K_o(S))))
]
```

The opponent's policy is allowed to use `K_o(S)`; the root is not allowed to condition the distribution of `S` on the actual `K_o` that it cannot observe. The current sampler instead constrains `S` using `K_o(S_actual)`, approximating a posterior conditioned on the opponent's actual private ledger. This is the information leak.


## Required separation

A general-purpose contract should expose two providers:

- `beliefKnowledgeBySeat({rootSeat, targetSeat, rootObservation, publicEvidence, decklistInfo})`: only the root's entitled knowledge about each target seat's hidden zones. This callback must **not** receive the raw State, Player objects, or native hidden-zone objects. The root's own seat can use its full verified ledger already present in the root observation. The opponent's partition must be sampled from public evidence and root-visible inference, not the opponent's unobserved K1 membership.
- `seatKnowledgeBySeat(sampledState, seat)`: after the hidden world is sampled, derive that simulated seat's own K0/K1/PARTIAL ledger from its own private zones in the sampled world and the public event history. The opponent's simulated observation receives this sample-specific private ledger; the root observation receives only the root's own ledger.

Keep these projections immutable and state-bound. Fail closed if the root-belief provider and sampled seat-private ledger disagree with the sampled physical zones or the public event history. For example, after public history shows the opponent searched its deck, each determinization should first sample the opponent's Prize multiset from the root's posterior; the simulated opponent then receives a K1 ledger for *that sampled multiset*, while the root's ledger remains whatever its own evidence supports (K0, PARTIAL, or K1). The root may infer exact or partial Prize membership from its own known decklist and public zones, but not from the opponent's private search result alone.

## Implementation order

1. Extend the detached actor observation with public-hand status/identities and face-up Prize identities. Keep concealed hand and face-down Prize identities absent.
2. Remove raw State from the injected `decklistForSeat` callback; pass only actor observation and sanitized public evidence.
3. Add an actor-observation-only root-belief provider. It must preserve the root's own verified ledger and derive opponent constraints only from root-visible evidence plus the sampled public decklist.
4. Sample both hidden partitions from that root belief. Do not pass the opponent's actual owner-private K1/top/bottom ledger into root partition construction or public-prior compatibility checks.
5. After applying a sampled partition, derive each seat's private K0/K1/PARTIAL ledger from that sampled world and public history. Store the detached per-sample ledgers in metadata and use them for each acting seat's observation.
6. Run the metamorphic and positive-control tests below in the existing Agent5 owner-root Node22 lane before increasing `maxPlies` or generalizing to heterogeneous Aichi lists.

## Minimal regression contract

Hold the root observation, root belief ledger, public evidence, registered decklists, and random seed fixed. Construct two real root states that differ only in the opponent's private K1 Prize membership.

1. Their root-conditioned sampled hidden partitions must be identical under the same seed (or, for a distributional test, statistically identical across a fixed seed suite).
2. The sampled opponent's private K1 ledger must match the Prize identities in each sampled world.
3. The root observation and root node key must not vary with the actual opponent-private ledger.
4. Repeat with physical seats swapped.
5. Include a positive control where a Prize identity is publicly revealed to the root; that revealed identity must constrain the root's belief.

This test distinguishes "the opponent knows its own Prizes" from "the root knows the opponent's Prizes."

## Scope and confidence

This is a **source-level design finding and mathematical counterexample**, not an observed competitive misplay or a completed runtime regression. The current checked-in caller is the bounded one-Flittle + 59 Psychic Energy fixture in `agent36-flittle-mcts-root-provider.cjs`, and its pilot budget is `maxPlies=1` (it does not simulate an opponent response). That fixture is doubly non-representative: once the sole Flittle is publicly established Active, all six Prizes are necessarily Psychic Energy, so both seats' K1 Prize compositions are inferable; and no opponent decision is expanded. Do not generalize that fixture's bilateral-K1 setup to heterogeneous Aichi or Expanded lists, or increase the search beyond its one-ply boundary, without the dual-ledger contract.

The issue should be resolved before using this determinizer for general-field MCTS or treating its opponent-response model as non-clairvoyant. It does not justify changing the current fixed deck candidate or making any win-rate claim.


## Relationship to the existing root-determinization strategy-fusion finding

Agent5's [strategy-fusion report](agent5-root-determinization-opponent-belief-fusion-20261113.md) establishes the opposite information leak: when the root's actual private card is fixed across a determinization, a simulated opponent can appear to respond to that card even though it is absent from the opponent's observation. The fixed actor-observation opponent-policy mode prevents the policy callback from reading the root's sampled State, but it does not by itself solve the sampling issue described here.

The two findings are complementary:

- **Root-private → opponent response:** the opponent must not receive the root's private card through its decision surface.
- **Opponent-private → root belief:** the root's sampled hidden-world distribution must not be conditioned on an opponent-only K1 ledger.

A pure, stateless, actor-observation-only opponent callback can still be given an opponent K1 ledger that was copied from the actual root State and used to constrain every determinization. Conversely, a correct root-belief sampler must still derive the simulated opponent's own K1 ledger from each sampled world so the opponent can act on information it genuinely possesses.

The general solution therefore needs two-sided epistemic consistency: sample each world from the root's entitled belief; derive each seat's private ledger for that sampled world; expose only the acting seat's ledger to its policy; and ensure the root's selected action is invariant to changes in hidden information that leave its own information set unchanged. This is not supplied merely by adding the opponent-policy callback or by re-determinizing at a seat switch; the belief update and transition settlement must remain coherent when control returns to the root. **Do not conflate the two MCTS modes:** in the fixed `opponentActionPolicy` mode, a pure actor-observation callback can provide a valid frozen opponent response without opponent-node PUCT or per-seat re-determinization, provided the root's samples come from its correct belief and each sampled opponent receives its own sample-consistent private ledger. Actor-relative re-determinization remains relevant to a genuine equilibrium/adversarial PUCT model. The dual-ledger correction is required in either case; it is not a reason to add another search mode.
