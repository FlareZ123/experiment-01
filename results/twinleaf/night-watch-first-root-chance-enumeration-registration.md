# Mechanistic chance-outcome enumeration protocol, registered before execution

**Agent 3, 18 October 2026.** Source-dealt, **retrospectively conditioned** reference experiment. This is exhaustive random-subset sensitivity within one game state, rather than an independent sample or a competitive-deck comparison.

## Frozen original physical game

- Aichi rank11 physical seat A, rank1 published champion reference physical seat B, source seed `2809154458`, ranked original resolved 60 lists from `planAichi(1)`.
- True first seat B from engine draw. Existing rank11 held Direct Boost Shake and autonomous opener policies, pinned Twinleaf at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, same strict prompt, Forest Seal Search, Battle Compressor and game/policy RNG isolation.
- The prior real first Night Watch attack occurs on global turn 9, with exactly **five** opposing hand cards before its random selection. The source seed was originally selected for a successful engine outcome; it is not representative of the opponent field.
- All arms allow 160 root actions maximum, same deck, same root bot policy. No swapping cards, reordering initial deck, forcing attacks, editing opponents' hidden card identities or selecting card faces.

## The complete ten possible first random pairs

Enumerate every two-card unordered subset of five anonymous opponent-hand positions at the first actually dispatched `Night Watch` `ChooseCardsPrompt`:
```
[0,1] [0,2] [0,3] [0,4] [1,2]
[1,3] [1,4] [2,3] [2,4] [3,4]
```
Each pair is equally likely under ideal paper-compliant uniform random selection, probability `1/10` **conditional on reaching this exact five-card source-hand state**. The research-side effect wrapper draws and discards the same two live game PRNG samples as the ordinary uniform implementation before substituting the designated pair; later card effects are unaltered and use the normal game and per-seat policy RNG streams. The source hand's *physical identities* may affect subsequent outcomes but are neither inspected nor chosen by the sampling wrapper or branch designation.

## Failure and interpretation

Fail if an arm's first true root Night Watch prompt does not exist, lacks exactly five available opponent-hand cards, selects an unexpected pair, fails prompt validation, lacks the verified original first slot or original source Tool-Garbodor policy completion, or violates original deck identity. Preserve each attempted branch and failure row rather than silently selecting successful outcomes. Run all ten pairs once without adaptively adding new selected chances. Record actual Night Watch count, selected first positions, real Store root resolutions, action count, terminal and winner, future attack/hand count differences, and unmet action cap.

These are **ten counterfactual chance branches from a single outcome-conditioned source deal**, so do not report a ten-game win rate or map the branch frequencies onto an unconditional matchup. The only defensible probabilistic statement is the conditional chance mass of the ten pair outcomes at the original first attack under the frozen choice context. Bot competence, later chance independence, opponent optimal response, engine fidelity and event clock are unqualified. No 99.5% evidence follows.
