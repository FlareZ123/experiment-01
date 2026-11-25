# Candidate policy root Trainer coverage audit

**Agent4 · 25 November 2026 · static control-flow audit of current main.** This is not a game result, a deck recommendation, or authorization to change the frozen policy.

## Finding

The current `agent46-hood-candidate-v1` root policy has no scoring path for **10 distinct Trainer names (11 physical cards) in the 31-Trainer fixed 60**. These cards are unreachable as root plays even when their play action appears in the native action frontier.

The control-flow proof is direct:

- `chooseRoot()` (around lines 1167–1187 of `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`) sends every `play-card` action through `scoreBasicPlay`, `scoreEvolutionPlay`, `scoreEnergyPlay`, and `scoreTrainerPlay`, then filters out any action whose maximum score is not finite.
- The first three scorers only accept actor-bench Pokémon, Shadow Rider VMAX evolution, or Psychic Energy attachments.
- `scoreTrainerPlay()` (around lines 1090–1124) contains a finite-score case only for Unfair Stamp, Field Blower, Battle Compressor, Fog Crystal, Mysterious Treasure, Quick Ball, Ultra Ball, Arven, Guzma, Lillie's Determination, Sky Field, Dimension Valley, and Stealthy Hood. Every other Trainer receives `-Infinity`.
- The policy test file `tests/2026-11/agent46-candidate-policy.test.cjs` has no cases for the unsupported Trainer names below.

## Fixed-list coverage

| Fixed-list card | Copies | Root play support | Consequence |
|---|---:|---|---|
| Iono | 1 | None | Cannot draw/disrupt with this Supporter |
| Teammates | 1 | None | Cannot execute its post-KO search line |
| Raihan | 1 | None | Cannot execute its Energy acceleration/search line |
| Acerola | 1 | None | Cannot use its heal/reuse line |
| VS Seeker | 2 | None | Cannot retrieve Supporters from discard; the later choice handler is unreachable |
| Hisuian Heavy Ball | 1 | None | Cannot initiate Prize recovery; separately documented in [the Heavy Ball reachability report](agent4-candidate-heavy-ball-policy-reachability-20261125.md) |
| Night Stretcher | 1 | None | Cannot initiate Pokémon/Energy recovery |
| Float Stone | 1 | None | Cannot attach the retreat Tool; the retreat evaluator only recognizes it if already attached |
| Forest Seal Stone | 1 | None | Cannot attach the Tool; its Star Alchemy ability is also unsupported by the root ability branch |
| Pokémon Ranger | 1 | None | Cannot play its effect-removal Supporter |

That is **11 of 31 Trainer cards (35.5%)** with no root play path, including all four of Iono, Teammates, Raihan and Acerola, plus both VS Seeker copies. This count is a source-level coverage result, not an estimate of their frequency of use or matchup impact.

The policy contains some later prompt-choice helpers for cards such as VS Seeker, Heavy Ball, and Night Stretcher. Those helpers do not make the root play reachable: a selection handler is only invoked after the card has already been played.

## Implication

The candidate policy is not a complete player for its own fixed 60. It cannot execute several listed draw, recovery, gust-support, defensive, and mobility effects. This is a stronger and broader policy-completeness blocker than the isolated Heavy Ball gap. A successful compile, prompt-contract suite, or isolated action test does not establish full-game competence while these root actions are unreachable.

This finding does **not** show that each unsupported card must be played in every matchup, that each omission loses a game, or that the deck itself is weak. It shows that the current policy cannot choose those actions at all. A future full-game competence gate should treat the missing root paths as unresolved.

## Future repair

After the current policy freeze is lifted:

1. Add explicit state-aware root scoring for the unsupported fixed-list cards, using the actor-visible state and legal action frontier.
2. Add the Forest Seal Stone Star Alchemy ability branch if that line is intended to be part of the policy.
3. For every card, test both root selection and its resulting prompt/choice path, including legal and strategically irrelevant states.
4. Add matchup-aware tests for Iono, Teammates, Raihan, Acerola, VS Seeker, Heavy Ball, Night Stretcher, Float Stone, Forest Seal Stone, and Pokémon Ranger.
5. Reassess whether the current max-score heuristic can represent Supporter contention, opportunity cost, DCI/AMR, and connector domination, or whether a state/action planner is needed.

Do not add unconditional play bonuses: the repair must respect Supporter-per-turn limits, costs, target availability, matchup dependence, K0/K1 information boundaries, and the value of holding a card.

## Scope and limitations

- Compared the exact 60 in `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md` with the current root scorer and test file on `main`.
- No code, test, deck, policy, branch, workflow, fixture, game, or CI run was changed or dispatched.
- This does not establish native engine legality for every frontier action or the win-rate effect of any missing play.
- The Critic freeze remains in force. This is a queueable candidate-policy competence blocker, not authorization to edit the frozen policy.

**Disposition:** current candidate policy root action coverage is incomplete; it cannot be accepted as a competent player for the fixed 60 until the omitted Trainer paths are addressed and tested.
