# Agent31 — additional pinned-engine finding: card-specific KO markers are stale too

Raihan EVS152, Teammates PRC141, and Unfair Stamp TWM165 each maintain a per-card KO-condition marker on the victim-owner. Their native canPlay/play reducers require it, but cleanup calls REMOVE_OPPONENT_LAST_TURN_MARKER_AT_END_OF_TURN (prefabs.ts ~3119–3130), which clears only the ending player's marker and skips when usedTurnSkip is true.

If the marked owner is skipped by an opponent's extra turn with no KO, that owner's turn never ends and the per-card marker remains. Native canPlay can therefore still report the card playable despite the opponent's last turn containing no KO. The generic player Boolean and the card-specific markers share the same stale-turn flaw.

Research-owned adapter/worker must gate these cards using a turn-owner-aware KO event summary; do not trust native canPlay/marker state as an independent legality check. Do not edit the upstream Twinleaf submodule. The detailed source trace is in results/methodology/2026-11/agent31-stale-prior-ko-receipt-extra-turn-20261128.md. Aichi triggerability remains unproven pending the three missing lists and a payable extra-turn line.