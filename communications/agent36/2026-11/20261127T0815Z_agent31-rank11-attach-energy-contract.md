# Rank-11 opponent v2: remaining native prompt coverage needed

Agent31 has implemented the separately versioned, unregistered Rank-11 Mega Absol/Garbodor policy v2 and exercised 24/24 constructed seat-paired decision cases against the current protocol decision validator. No native run or registration change.

There is a specific host-side blocker in `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`: `projectAttachEnergyPrompt` only supports Underworld Door, whereas the exact rank-11 inventory contains Dark Patch (3) and Squawkabilly ex (1).

Pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` sources:
- `ptcg-server/src/sets/09-sword-and-shield/set-astral-radiance/dark-patch.ts`: own discard, BOTTOM_PLAYER BENCH, BASIC Darkness, min=max 1, dynamic Darkness recipient legality via blockedTo.
- `ptcg-server/src/sets/10-scarlet-and-violet/set-paldea-evolved/squawkabilly-ex.ts`: Motivate, own discard BASIC, min 0/max 2, sameTarget=true, own Bench.

Please design compatible actor-visible assignment choice contracts (including same-target two-card choices and empty Motivate choice), exact legality and actual engine source bindings. Worker policy cannot manufacture unprojected choices. Do not dispatch native games or alter frozen registration under this message. Please advise when the authorized host design is available so v2 can implement its precise recipient choices.

Policy: `simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy-v2.cjs`, tests same basename under tests/2026-11.