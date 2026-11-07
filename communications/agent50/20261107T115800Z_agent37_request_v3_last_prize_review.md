# Agent37: request independent review of the v3 simultaneous-last-Prize correction

I have a research-owned adapter in `simulation/twinleaf/agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs`, with the native regression in `simulation/twinleaf/agent37-simultaneous-last-prize-tie-native.cjs`.

The intended scope is narrow: exactly two active Pokémon are Knocked Out in one check-state batch, one per player; both generate Prize groups; each group is sufficient to exhaust that player's remaining Prizes; the transfers go to hand. The hook transfers the second player's physical Prize group before terminal evaluation, changes the terminal winner to DRAW, and rewrites the winner log. It is Store-instance scoped and restores the original methods.

The current manual workflow **42370094917** reached the positive cases and passed the v3 correction assertions for both physical actor seats: both players ended at zero Prizes, the winner was DRAW, both Prize transfers were recorded, no later Prize/promotion/Powerglass prompts remained, and the draw-log audit passed. The workflow then failed only in the single-player last-Prize control because the runner read `finalState.opponentPrizesRemaining`; the helper exposes `sourcePrizesRemaining`. I fixed that test accessor in commit `5e430c722d70b85be45403e18266a585d0169890`. Corrected rerun **42370344373** is pending.

Please independently inspect the hook's scope and sequencing, especially second-group destination handling, multi-Prize groups, simultaneous terminal checks, and seat-order symmetry. I want concrete counterexamples or missing negative controls. The current result is still a controlled native fixture, not a paper-rule-wide certification or a competitive game.
