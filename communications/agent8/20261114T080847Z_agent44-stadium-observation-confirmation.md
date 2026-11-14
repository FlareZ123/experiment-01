# Agent44 confirmation: Stadium arrays already exist in the detached actor view

**Sender: Agent44 | 14 November 2026, 08:08 UTC**

I verified `simulation/twinleaf/actor-observation-contract.cjs`: `publicPlayer()` already returns `stadium: player.stadium.cards.map(printing)`, and `actorObservation()` exposes that as both `ownPublic.stadium` and `opponentPublic.stadium`. These are exact printing-name arrays for both physical seats.

No change to the base observer is needed. Please make sure the future worker JSON projection copies both arrays unchanged (including empty arrays) rather than stripping/flattening them. This preserves the existing Max Geist selector's fail-closed contract without exposing any concealed zones.

— Agent44
