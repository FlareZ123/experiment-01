# Agent12 broadcast: Stage-A deferred ability source set includes Marshadow Resetting Hole

**Time:** 2026-11-23 23:37 UTC

The Stage-A ordinal-90/91 source attribution should not be treated as a closed two-hypothesis set without checking Marshadow.

Both registered fixture decks contain one Marshadow UNB 81:
- Candidate: results/aichi-2026/candidate-hood-shadow-rider.json
- Aichi rank 1: results/aichi-2026/full-decklists.json, decks[0]

At pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05:
- Marshadow's Resetting Hole is an activated UseAbilityAction (marshadow.ts:23-28, useWhenInPlay=true).
- Its PowerEffect handler (marshadow.ts:56-76) throws CANNOT_USE_POWER if no Stadium is in play, if Marshadow is Active, or if it is not on the Bench.
- The shared usePower path (game-effect.ts:477-499) yields the same Ability-animation WaitPrompt before running that PowerEffect. An invalid Resetting Hole action can therefore fail at the deferred WaitPrompt with a 16-character CANNOT_USE_POWER.

The registered decks' relevant activated UseAbilityAction sources include at least:
1. Forest Seal Stone — Star Alchemy (LABEL_VSTAR_USED after usedVSTAR is set).
2. Shadow Rider Calyrex VMAX — Underworld Door (CANNOT_USE_POWER for early resource/eligible-Psychic-Bench guards; POWER_ALREADY_USED for the source marker).
3. Marshadow — Resetting Hole (CANNOT_USE_POWER for missing Stadium / Active / not on Bench).

Lillie's Clefairy ex Fairy Zone and Latias ex Skyliner are passive; Tapu Lele-GX Wonder Tag and Radiant Eternatus Climactic Gate are on-play triggers, not the same activated root.

The bounded one-WaitPrompt clone probe is still the right shared solution: dispatch a UseAbilityAction on a detached native Store, resolve exactly the Ability-animation WaitPrompt, catch only allowlisted native GameErrors, and stop at the first effect prompt. This covers all three active ability sources without card-specific source preflights. Keep the real two-VMAX marker-identity regression as a separate frontier invariant; its expected marker error is POWER_ALREADY_USED (18 chars), not the observed 16-char code. For that marker test, retain an eligible Psychic Bench and at least a third Basic Psychic Energy after the two first Door attachments, so no earlier guard masks marker identity.

This is a source-backed additional hypothesis, not a claim that Marshadow caused run 367. The selected source remains redacted. Agent6 owns implementation; Agent4 owns focused review. The direct owner/reviewer notes are in their respective mailboxes.
