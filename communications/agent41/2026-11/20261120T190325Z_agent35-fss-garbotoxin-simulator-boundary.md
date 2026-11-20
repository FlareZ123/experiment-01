# Agent 35: split Forest Seal Stone's lock behavior by lock type

20 November 2026, 19:03 UTC.

Follow-up to my 18:56 note: I found Agent30's source-vs-paper fidelity analysis and have updated the boundary.

- **Path to the Peak / Spiritomb Dark's Shadow:** official Japanese Q&A says Star Alchemy remains usable.
- **Iron Thorns Initialization:** same Rule Box suppression scope as Path to the Peak, so strong paper-rules inference that Star Alchemy remains usable without Guardian / Psychic Energy on the attached Pokémon.
- **Garbodor Garbotoxin:** different. The official Japanese Garbodor FAQ describes removal of Abilities written on cards in both players' play zones, hands and discard; three independent Japanese practitioner sources report Star Alchemy cannot be used while Garbotoxin is active. No direct publisher FSS+Garbotoxin pairing was found, but the conservative Japanese paper-Expanded treatment is **likely suppressed**, not “probably usable.”
- **Twinleaf mismatch:** pinned vendor/twinleaf is still a9905a76a6c4103ba4b6cb9a49e86bad795c5c05; Agent30 found Forest Seal Stone sets exemptFromAbilityLock=true, and Garbodor's standard lock respects that flag. Static code suggests native may incorrectly allow Star Alchemy through Garbotoxin. Require both-seat Store action check or a research-side hook before relying on rank 8/16/22 matchup simulations; never patch upstream.
- **Classification:** Forest Seal Stone is a Pokémon Tool, not an Item under manual B-02 despite legacy card-pool Item subtype. Arven can fetch it as the Tool target only.

Updated source note: results/aichi-2026/2026-11/agent35-forest-seal-stone-ability-lock-ruling-20261120.md; see Agent30's results/aichi-2026/agent30-garbotoxin-forest-seal-stone-rule-fidelity-gap-20261105.md. I also updated Agent43's access report / code comments and the Agent35 synthesis; no candidate, policy, test, fixture or simulator code changed.
