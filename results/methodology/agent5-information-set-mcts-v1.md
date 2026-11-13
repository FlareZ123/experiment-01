# Agent 5 — observation-keyed information-set search (v1)

**Date:** 2026-11-13  
**Scope:** research-owned search and hidden-state sampling for paper Expanded experiments.  
**Status:** tested algorithmic foundation; not yet connected to a real Twinleaf match.

## Why this exists

The pinned Twinleaf revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` from `https://github.com/twinleafgg/twinleafgg.git`. It contains an `advanced-bot`, but it is not a suitable Expanded search policy:

- `ptcg-server/src/advanced-bot/advanced-bot.ts` is restricted to Standard and uses a Dragapult playbook.
- `action-search-ai.ts` uses a shallow same-turn beam search (depth 3, beam width 4), rather than adversarial search across both seats.
- `action-enumerator.ts` caps candidates by action type and is not a complete Expanded legal-action frontier.
- `ptcg-server/src/game/bots/simulator.ts` defaults to deterministic arbiter behavior unless random modes are explicitly supplied.
- The repository's headless runner currently builds on `SimpleTacticsAi`; the existing actor-only root policy is heuristic rather than a general search/value system.

Existing own-deck determinization and K0 draw-belief work is useful, but it does not by itself sample both players' concealed hands, decks and Prizes as one consistent world.

## Implemented

Four research-owned modules were added under `simulation/twinleaf/2026-11/`:

1. **`agent5-information-set-mcts.cjs`** — observation-keyed PUCT. Nodes are keyed by physical seat plus a canonical SHA-256 actor-observation hash. It samples determinizations, performs adversarial seat-perspective backpropagation, and returns root action visit/value statistics.
2. **`agent5-hidden-partition-sampler.cjs`** — uniform sampling without replacement from a registered 60-card multiset. Supports concealed/partially known hands, K0 Prize uncertainty, exact K1 Prize membership, verified top-deck prefixes, known bottom-deck blocks, and opponent decklist priors filtered by public evidence.
3. **`agent5-twinleaf-belief-input.cjs`** — constructs both seats' belief inputs from the actor-only Twinleaf observation, applies sampled faces to a detached State while preserving opaque card IDs, and supplies a public-evidence decklist-prior provider. It requires an explicit verified K0/K1/PARTIAL ledger for both seats; it does not silently assume K0.
4. **`agent5-twinleaf-mcts-adapter.cjs`** — dependency-injected boundary for Twinleaf's ActionEnumerator, Simulator, actor observation, prompt owners and prompt resolvers. It rejects deterministic coin/shuffle modes, routes each prompt to its actual owner, and carries each sampled seat's own decklist identity through simulator clones without exposing the opponent identity in the root observation.

The MCTS core fails closed if a determinization changes the root observation or if the legal-action key frontier changes between worlds with the same observation. The decklist-prior provider sees public opponent cards and public hand/Prize reveals only; it does not read concealed opponent hand/deck identities. The sampler preserves Prize-redeal information by representing a Ticket-like transition as PARTIAL knowledge plus a known bottom-deck multiset, rather than stale K1 membership.

## Validation

Local command: `node --test tests/2026-11/agent5-*-search.test.cjs` (the four test files are listed below individually).  
Runtime: Node v22.16.0.  
Result: **25/25 tests passed**, plus syntax checks.

Coverage includes:
- PUCT choosing the higher expected-value action across hidden worlds;
- adversarial opponent replies;
- invariance to the real concealed card identity when the observation and seed are unchanged;
- rejection of hidden-dependent action frontiers;
- K0/K1/partial Prize accounting and Ticket-like Prize redeal;
- public-only opponent decklist-prior filtering;
- no reads of concealed card faces during belief construction;
- prompt resolution by the prompt owner's seat;
- private sampled decklist identity propagation through cloned simulator states.

## Limitations — do not overclaim

This is **not AlphaZero proper**: there is no trained neural policy/value network, self-play training loop, or learned evaluation function. The value and prior functions remain injected. The Twinleaf adapter is dependency-injected and mock-tested; it has **not** yet been wired to the pinned engine in a native game. No real game, matchup, deck win-rate, or Aichi Top 32 performance was measured.

The main integration blockers are:
1. a general, auditable K0/K1/PARTIAL knowledge ledger for both seats, including deck searches, Prize reveals and Prize redeals;
2. an Expanded-complete legal action frontier (the upstream ActionEnumerator's caps are not sufficient);
3. actor-scoped prompt resolvers whose scoring does not inspect the other player's concealed information;
4. a calibrated public-observation value function and action priors;
5. a real Twinleaf match harness and equal-budget seat-swapped evaluation.

The opponent prior must include the missing Aichi source lists before it can cover all 32 opponents. If no prior deck contains the observed public cards, the provider fails rather than guessing.

## Integration contract

A future runner can compose:
- `createPublicDecklistPriorProvider` with the acting seat's exact registered 60 and the public field-list prior;
- `createTwinleafDeterminizationSampler` with the pinned Twinleaf deep-clone/prototype-normalization helper, the per-seat verified knowledge ledger, and `CardManager.getCardByName`;
- `createTwinleafMcts` with the pinned `ActionEnumerator`, `Simulator`, `actorObservation`, random `BotFlipMode.RANDOM` / `BotShuffleMode.RANDOM`, seat-specific prompt resolvers, an observation-only evaluator, and a public action key.

Keep candidate and opponent compute budgets equal. First validate the adapter in native single-game traces; only then compare policies across a balanced, seat-swapped field. This result does not nominate or alter a deck.

## 2026-11-13 extension: fixed actor-observation opponent policies

The core now supports an optional fixed opponent policy for policy-conditioned candidate search:

- Supply `opponentActionPolicy(observation, sortedActionKeys, seat, seededRandom, searchContext)` and a non-empty `opponentPolicyId`.
- PUCT remains responsible for root-seat decisions. At every non-root-seat node, the core calls the fixed policy with only the acting seat's observation and legal action keys; no State, Player or native action object is passed.
- The policy must return a key in the current frontier. Invalid keys fail closed. Repeated opponent information sets must have identical action-key frontiers within the search.
- Audit fields identify `opponentModel`, `opponentPolicyId`, `opponentPolicyCalls`, and `opponentInformationSetCount`. `maxActionTransitions` includes both root and opponent policy actions.
- `createTwinleafMcts()` forwards these options, and the adapter test proves the callback is reached through the research-owned Twinleaf boundary.

This is **candidate PUCT against a frozen opponent policy**, not adversarial PUCT, equilibrium computation, or proof of opponent competence. The callback's action keys must themselves be actor-observation-safe; the caller must validate frontier invariance across root-private variants. The legacy no-policy mode remains root-determinization PUCT and is susceptible to the strategy-fusion counterexample in `results/methodology/2026-11/agent5-root-determinization-opponent-belief-fusion-20261113.md`.

Validation after this extension: 10/10 core/strategy-fusion tests and 8/8 adapter tests passed in fetched-source Code Mode harnesses with deterministic hash and Node assert/test shims. These are not native Node/Twinleaf CI runs.
