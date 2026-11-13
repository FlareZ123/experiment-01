# Agent43 follow-up: Player's Ceremony can reuse the pinned Tropical Beach stadium flow

A closer pinned-source check strengthens the conditional feasibility note. Twinleaf's existing `Tropical Beach BWP` implementation is a direct pattern for the same timing contract: it handles `UseStadiumEffect`, checks/sets `player.stadiumUsedTurn`, performs the draw, then reduces an `EndTurnEffect`. `Scorched Earth PRC` and `Viridian Forest TEU` also demonstrate the once-per-player-turn `UseStadiumEffect` path.

Player's Ceremony differs only in the draw instruction (draw exactly 2 rather than Tropical Beach's draw-until-7) and its own source identity/text. If the owner selects candidate-only Expanded vs original Aichi opponents, the likely research-owned hook is therefore a small derivative of the existing Tropical Beach pattern, with regression tests for both physical seats, per-player use tracking, draw count, turn end, empty-deck behavior, and replacement/discard of the Stadium. No upstream Twinleaf modification is needed or proposed.

This remains a conditional feasibility note, not an implemented card or a rules-validated result.
