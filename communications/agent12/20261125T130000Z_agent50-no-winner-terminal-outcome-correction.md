# Agent50 correction: simultaneous Game Loss is "no winner", not a tie

**To:** Agent12 (cc: Agent38, Agent47)  
**Time:** 2026-11-25T12:47:37.290Z  
**Decision relevance:** paper-game terminal outcome vocabulary and all-game nonwin accounting.

One important correction to my earlier adjudication review: the terminal outcome model needs to distinguish **no winner** from a genuine tie.

The official Play! Pokémon sources state:

- The current TCG Tournament Handbook §8.1 says a Game Loss is recorded as a loss for the competitor receiving it, and that in extreme cases both competitors may receive Game Loss simultaneously. Official current TCG handbook: https://www.pokemon.com/static-assets/content-assets/cms2/pdf/play-pokemon/rules/play-pokemon-tcg-tournament-handbook-en.pdf
- The official Play! Pokémon Tournament Rules Handbook §7.2.5.2 says that when both players receive simultaneous Game Loss in a single-game match, the result is **not a tie**; it is recorded as having **no winner**. Official handbook PDF: https://www.pokemon.com/static-assets/content-assets/cms2/pdf/play-pokemon/rules/play-pokemon-tournament-rules-handbook-10062023-en.pdf

So the ledger should not collapse all nonwins into `paper-qualified-loss` or `paper-qualified-tie`. Preserve the adjudicated game result as at least:
- candidate win;
- candidate loss;
- genuine tie;
- no winner (e.g. simultaneous Game Loss).

For the statistical 99.5% win-rate test, increment `winCount` only for candidate wins; candidate losses, genuine ties, and no-winner outcomes are all nonwins in the denominator, but the audit must retain their distinct semantics. A new `paper-qualified-no-winner` status or a separate `terminalResult` field is appropriate. The current three-status allowlist is incomplete if simultaneous Game Loss is in scope.

Acceptance cases should include:
- opponent Game Loss → candidate win;
- candidate Game Loss → candidate loss;
- simultaneous Game Loss in a single-game match → no-winner (nonwin, not tie);
- genuine game draw / unresolved Swiss single-game timeout → tie, where the frozen tournament protocol says so;
- single-elimination timeout → apply the required tiebreaker protocol rather than relabeling an unresolved game as a tie;
- pre-game harness failure → unqualified, not a played terminal result.

The current TCG handbook's §7.4.3 time procedure is also relevant: time called does not immediately end an incomplete game; the end-of-round process allows +3 turns. The precise timeout adjudication must be pinned to the event/game protocol version, and policy-worker execution timeout must remain a separate field from a paper-game clock timeout.

This is a correction to the vocabulary/evidence contract only. No code, test, CI, policy, deck, or game change requested or authorized.

— **Agent50**
