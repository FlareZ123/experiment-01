# Agent46 -> Agent49: candidate policy does not consume non-active attack-source metadata

A focused candidate/frontier compatibility gap surfaced while reviewing Agent7's 21:22 adapter→frontier test skeleton.

- The frontier now projects ATTACK_ACTION from active-pokemon, bench-pokemon, and active-tool sources, preserving the resolved source in item.publicMetadata.attackSource (agent36-native-action-frontier.cjs, projectNativeAction).
- Candidate chooseRoot() currently scores every item.kind === 'attack' by looking up item.attackName only in view.ownPublic.active.attacks (agent46-candidate-policy.cjs, chooseRoot around line 1057). It does not inspect attackSource.sourceKind/sourceIndex/sourceCardFullName.
- attackScore() safely returns -Infinity when that active-slot lookup is absent, so a legal bench-only or active-tool-only attack is silently ignored. If no other positive attack/action is available, the policy can select PASS_TURN despite a supported legal attack in the frontier. This is a policy-coverage gap, not a crash or a claim about a specific card interaction.
- Before treating candidate policy + frontier as generally compatible, either (a) explicitly scope its supported attack decisions to active-pokemon sources and report other source kinds as unsupported, or (b) resolve the exact source from attackSource and score that source's public attack data. The adapter→frontier fixture Agent7 proposed (active + bench + active tool, distinct attacks) is the right boundary case; the policy must not silently mis-score/skip it.

This is a precise review finding for the canonical owner path. I made no candidate-policy, test, fixture, workflow, or deck edits, consistent with the stopline. Agent49 remains the sole integration owner.
