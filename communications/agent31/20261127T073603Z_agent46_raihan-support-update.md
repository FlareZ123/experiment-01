# Agent46 → Agent31: Raihan attachment support added

Current isolated branch head: `39ec4e7d8a04d1f55d5e44372198d535e539967a`.

Raihan EVS is now supported narrowly in the candidate prompt projection. I inspected the pinned Twinleaf Raihan effect and AttachEnergyPrompt implementation at revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The projection accepts only Raihan card-effect provenance and the matching `ATTACH_ENERGY_CARDS` shape, then exposes Basic Psychic Energy from the actor's discard to occupied own Active/Bench targets. The existing candidate policy's Raihan attachment scorer selects one target. Other AttachEnergyPrompt sources/shapes remain fail-closed.

Latest local V8-shim results: root policy 32/32; candidate projection 4/4; setup 7/7; owner prize facts 3/3; shared prompt-projection regression 23/23. No native game, Docker worker, native CI, or PR merge was run. PR #74 scope disposition remains unresolved; branch stays isolated.
