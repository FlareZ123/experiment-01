# Full-game observation-safe policy contract

**Agent 5 | 13 November 2026 | design contract only; no policy implementation or game result.** The 24-rank diagnostic loop must not treat an engine bot as an observation-safe player merely because it returns legal actions. This contract defines the minimum information boundary and reproducibility conditions for any fixed full-game policy used in diagnostic matches.

## Current boundary finding

`simulation/twinleaf/headless.cjs` constructs Twinleaf `SimpleTacticsAi` and passes the full live `state` object to `decodeNextAction(state)` at root and prompt boundaries. The research-side call site does not project an actor-public observation. This does not prove that the pinned SimpleTacticsAi reads opponent hidden zones; it means the boundary itself does not prevent it. The runner seeds policy randomness through its policy-RNG wrapper, but deterministic randomness does not sanitize hidden information. The repository also contains targeted probes: `hidden-deck-order-policy.cjs` compares equivalent actor-visible states with reversed unseen own-deck order; `hidden-order-full-policy-audit.cjs` is written to assert different full-bot actions (`PlayCardAction` versus `PassTurnAction`) for such states; and `rank11-full-bot-hidden-hand-pair.cjs` constructs paired worlds with identical actor-visible observations but different opponent hidden hands, while explicitly leaving `informationSetCertified:false`. These are diagnostic scripts, not executed/CI-qualified results: the current Twinleaf smoke, Aichi headless, Aichi first-game, and Agent5 owner workflows do not reference them. Run and review them against the pinned build before any policy-valid use.

The existing Agent5 information-set MCTS core is not a ready general full-game policy: its current Twinleaf adapter is limited to the registered Flittle applicability envelope and root search. The visible Marshadow-chain policy is a narrow candidate-specific sequence; the first-turn K0 certificate is not a complete turn/game policy. None is a drop-in general baseline for all 24 Aichi opponents.

## Required policy interface

A policy must receive an immutable `ActorObservation` for the acting physical seat and the legal action/prompt options available to that actor. It must not receive the raw omniscient `GameState`.

The observation may include:

- the acting player's hand, board, discard, deck composition/order only to the extent actually known to that player;
- public board state, public discard, public revealed cards, Prize counts, public turn/action history, and public effects;
- identities of the acting player's own Prize cards only after an effect actually reveals them to that player;
- opponent hidden-zone counts where public, but not the identities/order of hidden cards;
- the legal actions and prompt choices available to the actor, without private options belonging to the other player.

The observation must exclude:

- opponent hand identities and order;
- opponent deck identities/order except cards actually revealed to the acting player;
- face-down Prize identities unless the acting player has legally looked at them;
- private prompt options or unresolved choices belonging to the opponent;
- hidden simulator fields, future random outcomes, or a determinization's sampled world.

Policies may infer opponent archetypes from public cards, revealed actions, and public history. Such inference is a belief over possible lists or policies, not permission to inspect the true hidden list.

## Non-anticipation and statefulness

The policy must be non-anticipative: its action distribution is a function only of the actor's current observation and permitted public/own history. Internal memory is acceptable only if it is derived exclusively from that permitted history and is reset between independent games and determinization worlds.

A mutable closure must not accumulate hidden-world observations across independent rollouts. A stochastic policy's random stream must be reproducibly derived from public/own inputs, such as `(run seed, physical seat, decision index, actor-observation hash, policy version)`. It must not depend on the hidden world, root search context, internal determinization ply, or opponent private state. The same observation and same policy RNG state must produce the same action distribution.

## Metamorphic tests

1. **Hidden-zone non-interference:** construct two legal states with identical actor observation but different opponent hidden hands, deck order, and face-down Prizes. With the same policy RNG, the chosen action must be identical.
2. **Player-specific K0/K1:** a complete search/reveal may update the searching player's observation; it must not update the opponent's private information state. Partial reveals update only the information actually learned.
3. **Public reveal:** when a card is publicly revealed, both players' observations may update consistently with the rules.
4. **Prompt isolation:** the policy receives only the acting player's legal prompt options; it cannot inspect or resolve the opponent's private prompt.
5. **Replay determinism:** identical initial deal, engine revision, policy version, and actor-visible history reproduce the same policy decisions under the same RNG protocol.
6. **Cross-world reset:** two independent determinization rollouts start with fresh policy memory; replay order must not change a decision at the same actor information set.
7. **Legality:** every selected action is checked against the engine-provided legal action set; illegal/unsupported states fail closed rather than receiving an invented action.

## Evidence and reporting

Bind every run to the pinned Twinleaf revision, research commit, fixed candidate deck hash, opponent deck hash, policy identifier/version, observation schema, RNG protocol, policy flags, seat mapping, actual first-player order, and complete action/prompt/Prize trace.

Keep three evidence labels distinct:

- **Engine plumbing:** the Store starts, legal decks load, prompts resolve, and a complete natural game terminates. This says nothing about policy strength.
- **Policy-valid diagnostic:** the policy passes the information-boundary and reproducibility tests, but may still be weak or strategically incomplete. Results remain diagnostic-only.
- **Competitive evidence:** requires competent frozen policies, complete field coverage, paper-qualified opponent identities, balanced seats/first-player order, and a preregistered statistical design. No current Aichi result meets this bar.

## Sequence after the owner gates

1. Obtain the actual PR47 native-root and Agent5 `native_search_only=true` runs; do not bypass owner authorization.
2. Audit the pinned SimpleTacticsAi tactic/resolver implementation for opponent hidden-zone reads. If it is safe, retain a non-interference test and expose it through an actor-observation adapter; if not, do not use it as a player policy.
3. If a safe policy is still absent, implement a minimal research-owned baseline that consumes `ActorObservation` plus legal actions only. Keep it fixed and explicitly weak; do not use the current MCTS as a competence shortcut.
4. Run one natural complete game as engine/policy plumbing, preserving failures and traces. Only after observation safety is demonstrated should the 24-rank diagnostic cohort begin.
5. Report all results as 24-rank diagnostic-only. Do not infer a Top32 win rate or change the candidate deck based on an unqualified bot.

## Limits

This is a contract and test plan, not a claim that SimpleTacticsAi leaks information, not a claim that it is safe, and not a competitive policy. No code was added and no games were run. It is intended to prevent hidden-information leakage from being mistaken for deck strength.