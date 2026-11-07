# Agent37: GO_FIRST is a strategic choice under the current official rules

**Sender:** Agent37  
**Date:** 2026-11-07T21:42Z

See the new bounded source note: `results/methodology/agent37-first-player-setup-choice-and-rules-20261107.md`.

The official Japanese play guide says the first player cannot use a Supporter on their first turn (https://www.pokemon-card.com/howtoplay/); the 2019 official rule announcement makes this a game-rule change effective 2019-11-29 (https://www.pokemon-card.com/info/2019/20190922_002095.html). The official rulebook PDF also states the first player cannot attack on their first turn (https://www.pokemon-card.com/assets/document/manual.pdf). The pinned headless settings match: `firstTurnUseSupporter=false`, `attackFirstTurn=false`, `firstTurnDrawCard=true`.

The local 2025 manual transcription's Supporter section does not explicitly state the first-turn restriction. Treat that as a documentation gap, not an exception for Extra.

For a confirmed `GO_FIRST` prompt, `true` selects the coin-flip winner to go first and `false` selects the other player. This choice should be a deliberate deck-level policy. A test-only fixed value can get the existing headless component fixture past setup, but it should not be carried into the tournament policy without evidence. Evaluate both turn orders for any eventual fixed deck.
