# Copied-attack session inheritance on authentic Aichi rank-10 source games

**Agent 12, 18 October 2026.** Exact public Aichi 2026 ranks 10 (Haruku Yoshioka, Regidrago) and 1 (Yasunori Kato, Shadow Rider Calyrex), each independently manifest-resolved to 60 actual card printings. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **Two retrospectively reused fixed seeds for simulator-integration falsification only**, not independent competitive performance trials.

## Why a natural-source test was necessary

Earlier [cloned copied-attack session tests](copied-attack-selected-identity-clone.md) proved missing source callbacks and an opt-in repair on injected boards. The ordinary headless bot wraps Twinleaf's `Simulator` with its own seeded-fair arbitration subclass. The copied-session inheritance wrapper previously required itself to be the exact outermost class, preventing use under this ordinary game runner.

The [reversible Simulator adapter](../../simulation/twinleaf/copy-session-aware-simulator-hook.cjs) now accepts `allowSubclasses:true` **only when explicitly requested**, and then permits a subclass of its own constructor. Default fail-closed wrapper-order behavior is unchanged. The full-source test exercises actual headless `installFairBotHooks` as that subclass while using the opt-in State-scoped session registry. It does not edit the upstream submodule or enable these hooks in ordinary games.

## Source-dealt, identical-seed controls

[Executable source runner](../../simulation/twinleaf/copy-session-ranked-source-exposure.cjs) executes each source 60 versus 60 twice under the same local State-scoped session module: one ordinary headless fair Simulator baseline and one fair Simulator subclass inheriting relevant copied sessions. Both use the same published decks, seed, actual physical seats, pinned engine and per-game policy RNG method. The inheritance observer counts each constructed clone and separately those whose parent State has a copied-attack session.

| Metric | Source seed `4246551499` | Source seed `3162592764` |
| --- | ---: | ---: |
| Compiled manual CI | [39168613761](https://github.com/FlareZ123/experiment-01/actions/runs/39168613761), passed | [39168839382](https://github.com/FlareZ123/experiment-01/actions/runs/39168839382), passed |
| Actual first physical seat | B (rank 1 in test's fixed seat layout) | B (rank 1) |
| Rank-10 source Apex Dragon Store declarations | **2** | **30** |
| Simulator constructors with inheritance enabled | 302 | 1,357 |
| Constructors whose parent had a copied session | **36** | **63** |
| Root actions in each paired game | 169 | 350 |
| Engine global turns | 16 | 69 |
| Engine finish | Rank 10 won, Prizes remaining [0,4] | 350-action cap, unfinished, Prizes [2,4] |
| Baseline vs inherited-runner rooted summary SHA equal | Yes | Yes |

Seed `4246551499` used the archived-v3 Energy policy and other historically registered experiment flags, as recorded by research commit `45623abb`. Seed `3162592764` used current Double Dragon v4, independent policy randomness and read-only decision collection, fixed at research commit `fd926368`. The two policy profiles are **different** and must not be pooled as one common comparison or outcome sample.

Source selector checks exact published 60-card counts, real first turn from the draw log, and the matching pair of deck-hash inventories. The source variant's patched `inheritCopyAttackSessionsFromState` observer is read-only apart from the intended session inheritance into hypothetical cloned States; it never chooses a root action. The printed copied-session source in recorded examples was **Koraidon ex TEF** under Regidrago VSTAR SIT Apex Dragon. Rooted observability digest equality includes root actions, central Store attack declarations, initial metadata if present, Prize outcome and engine winner. The scripts assert meaningful copy-session branch exposure for the second source seed.

## Demonstrated and unresolved

The successful runs **establish that speculative bot policy really constructs Simulator clones while a copied Regidrago session is active in dealt, complete source-60 matches**. In those two specific games the additional copy-session inheritance did not alter the headless return's recorded root-action/attack declaration summary. This is a **negative result for that observable end-to-end intervention effect**, rather than evidence that the inherited attack session had no hidden side effects or that all copied lifecycle effects are correct.

The State-copy inheritance code currently rebinds the most recently selected cloned Attack only if `parentState.playerLastAttack[playerId].attack` is reference-identical to an attack in that session. A source example logged `selectedHistory: 'Apex Dragon'`, while the session's attack source was `Koraidon ex`, indicating an important *identity and declared-attack-history interaction to investigate*. The available report does not assert that this history was the session's original selected cloned Attack. No independent source decision-boundary Card nonmutation or copied-source reducer callback was collected; printed-effect-to-opponent-response qualification is still open. The 350-action rank10-second trace is **censored**, and the finished rank10-first trace used unqualified autonomous policies.

The next decisive transition is a read-only, **live-source** copied-attack effect and continuation packet tied to actual root actions and later opponent responses, with an explicit check of identity-sensitive delegation in cloned States and a source-Card mutation observer. Coordinate with Agent 49 and the rank-10 qualification owners to avoid duplicate compiled replays.

**Evidence remains mechanical and diagnostic. The shared 32-opponent field has 29 exact publicly sourced decks, zero competitive-qualified games and no demonstrated 99.5% fixed-deck success.**
