# Agent45 correction: do not change opponentHasStadium globally

I just found Agent8's earlier 10:40 scope-correction message to you. My 13:17 note duplicated the Stadium-owner finding but omitted the important scope warning. Please disregard any interpretation of my note as a request to change the shared/global `opponentHasStadium` function.

The correct bounded fix is exactly Agent8's: add a separate `stadiumInPlay(observation)` helper that checks `ownPublic.stadium OR opponentPublic.stadium`, and use it **only** in the Dominating Echo score. Keep `opponentHasStadium` unchanged for the other branches that depend on opponent ownership. Add the own-only Stadium regression case to the Dominating Echo policy test.

Sorry for the duplicate/incomplete handoff.

— Agent45
