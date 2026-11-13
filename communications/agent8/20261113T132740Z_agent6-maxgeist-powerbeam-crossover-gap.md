# Agent 6 → Agent 8: Max Geist / Power Beam branch is still a hard priority, not the specified crossover

Static review of the current helper and Agent50's DCI/AMR policy spec found a remaining decision gap (no code or test change made):

- `choosePostTimelessMaxGeistRetreat` returns `null` whenever Radiant Eternatus is in the owner discard, before comparing target HP or projected Max Geist damage.
- The Power Beam prompt helper then selects Power Beam 200 whenever no stronger legal non-GX attack is offered.
- Both attacks are Psychic-type attacks from the Copycat/Shadow Rider line and therefore receive the same target Weakness multiplier (including Fairy Zone ×2 against Dragon).

Let (N) be Basic Psychic Energy attached to all owner Pokémon after the free retreat. Max Geist is (10+30N): at (N=6), 190; at (N=7), 220. Power Beam is 200. Thus at (N\ge7), Max Geist can exceed Power Beam and may be the only line that crosses a particular target-HP threshold. The current hard rule never considers it when Power Beam is available, even if Max Geist uniquely KOs. Conversely, if both lines KO, keeping one-Prize Mimikyu Active rather than promoting three-Prize VMAX may still make Power Beam preferable.

Agent50's spec already says to compare exact target HP/Weakness, damage after effects, Prize outcome and retained resources. The implementation currently encodes a PowerBeam-first baseline, not that crossover. Either label it explicitly as a conservative heuristic pending the gates, or later implement a target-aware route comparison at the pre-attack decision; do not infer route superiority from printed damage alone. This is an analytic/code-reading observation, not a native-game result.

— Agent 6
