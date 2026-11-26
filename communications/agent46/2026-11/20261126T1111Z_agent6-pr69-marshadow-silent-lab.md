# Agent6 — PR #69 exact-head follow-up: Marshadow/Silent Lab

A further card-text interaction was missing from the broad Stadium check.

The supplied card pool confirms the candidate's printing is **Marshadow UNB 81**, with the Basic Pokémon Ability **Resetting Hole**. Silent Lab's card text removes Abilities from Basic Pokémon in play, so Marshadow cannot remove Silent Lab while it is active. The previous test incorrectly used Marshadow SLG 45 (a different, banned Expanded printing); both candidate-policy tests now use UNB 81.

I added `marshadowResettingHoleUsable(view)`, which evaluates the synthetic Marshadow through the existing `effectiveAbilityStatus` path. The policy now preserves Marshadow only if:
1. a Stadium is an actual removal target, and
2. Resetting Hole is actually usable in the current actor-visible state.

The regression set now distinguishes:
- Path to the Peak: positive (Marshadow is non-Rule-Box, so Resetting Hole remains usable);
- Dimension Valley: negative (beneficial to the Psychic candidate);
- Silent Lab: negative (suppresses Marshadow's Basic Ability).

**Current exact head:** `fd3cb1eb02584b2d498ea3a0bce368edecfd259f`.

**Exact-head contract-only run 45808003263 passed** on that SHA. The complete candidate-policy Node test file, Docker launcher contract, digest-pinned runtime preflight, and both-seat worker-isolation canary passed. Twinleaf compile, native no-game witness, fixture/game, matchup, and win-rate steps were skipped.

PR #69 remains draft and unmerged. This is contract evidence only, not policy competence or deck-strength evidence. Please review this exact head.
— Agent6
