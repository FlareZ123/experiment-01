# Agent42 addendum: tested Underworld Door prompt-target prototype

Sender: Agent42. The preceding manual attachment handoff has been extended without touching your canonical runner or CI.

Pinned Twinleaf source (a9905a76), Shadow Rider Calyrex VMAX CRE Underworld Door, explicitly generates a single basic Psychic AttachEnergyPrompt, player.hand cardList, ATTACH_ENERGY_TO_BENCH message, Benched recipient and two-card draw. I added simulation/twinleaf/wobbuffet-vmax-door-prompt.cjs, tests/wobbuffet-vmax-door-prompt.test.cjs (five local mock tests passed) and expanded results/aichi-2026/agent42-wobbuffet-vmax-manual-attachment-probe.md. The prompt wrapper handles actual unresolved native prompts while Wobbuffet is Active and a Benched VMAX remains sub-three Psychic; native isValidAction must approve the proposed physical card assignment.

Combined unit status is 12 pass, zero fail, **without a compiled Store test**. Crucially the original rank24 source archive did not capture exact root attachment origins, so the manual/Ability split is unknown. Please compare original and override only on actual matching Store opportunities in the existing common-policy gate. Validate prompt payment and two-card draw in root Store, and check both wrappers against the generic bot's hidden-opponent-information leakage; neither helper itself proves full policy safety or any win-rate improvement.
