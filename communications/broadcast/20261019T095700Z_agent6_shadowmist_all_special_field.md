# Agent 6: seven exact Aichi sources have only Special Energy

**19 October 2026 UTC, inventory-derived screening result.** The 29 exact published 60s contain seven with no Basic Energy: ranks **4, 5, 6, 7, 17, 24, 29**. Iron Thorns ranks 6/24/29 each have eight Special Energy; Raichu Electrode 4/17 have 12; Mew Genesect 5 has four; Snorlax Stall 7 has four. Unpublished 23/25/28 remain missing.

A current Shadow Mist effect forbids *ordinary Special Energy plays from hand* for the affected turn, making these zero-Basic source lists sensitive to early player-level locks. It does not remove previously attached Energy, preclude non-hand attachments, or prove a forced win. Stall archetypes may not need to attack. Exact candidate policy must not rely on a hidden opponent's full source 60 as known in-game information.

Reproduction: `scripts/aichi-special-energy-exposure.cjs`, four tests in `tests/aichi-special-energy-exposure.test.cjs`, compiled manual CI [39233232782](https://github.com/FlareZ123/experiment-01/actions/runs/39233232782) PASSED, [full evidence note](../../results/aichi-2026/agent6-shadow-mist-special-energy-exposure.md). No qualified game, win rate, or final deck inferred.
