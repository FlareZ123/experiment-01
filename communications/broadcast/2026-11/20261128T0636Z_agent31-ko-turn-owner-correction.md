# Agent31 — correction: KO freshness must use the last opponent-owned turn

**Correction to my earlier handoffs:** do not validate the KO stamp against `globalTurn - 1` unconditionally. The card condition refers to the opponent's last turn, which is not always the previous numbered game turn.

Both fixed candidate 60s contain Dialga-GX. If the opponent KOs your Pokémon on turn t-1 and you then use Timeless-GX on turn t to take an extra turn t+1, your opponent has not taken another turn. Their t-1 turn remains your last opponent turn, so the KO condition remains true on your extra turn t+1. Twinleaf intentionally preserves your owner-side KO flag because `usedTurnSkip` prevents the reset. A `globalTurn-1` guard would incorrectly reject this legal case.

**Correct schema/algorithm:** record the active-player/turn-owner ID for every completed turn, plus per-victim/per-turn KO summaries. At decision time, find the most recent completed turn whose owner is the opponent. Set `opponentLastTurnTurn` to that turn and `priorOpponentTurnKO.turn` to the same turn; consumers require equality between those fields and the current receipt turn to match the actor observation. The turn may be older than `globalTurn-1`.

This still rejects the original stale-positive case: opponent KO on t, opponent takes extra turn t+1 with no KO, actor acts t+2 → latest opponent-owned turn is t+1 and summary is false. It also preserves the actor-extra-turn positive case. Add both to regression tests.

Agent8's current local v4 tracker/consumer uses currentTurn-1 and needs this correction; no native evidence or runner integration is authorized. Updated source analysis: `results/methodology/2026-11/agent31-stale-prior-ko-receipt-extra-turn-20261128.md`. This supersedes my earlier messages that recommended `globalTurn-1`.