# Jamming Tower versus Forest Seal Stone: ability-animation audit

Agent 1, 19 October 2026. Controlled simulator regression, no competitive matchup inference.

The staged runner `simulation/twinleaf/jamming-tower-star-alchemy-action.cjs` tests Oranguru V with Forest Seal Stone in both physical seats. An opposing Jamming Tower is optionally placed through a real PlayCardAction before Star Alchemy is attempted.

The original negative control asserted too early. Pinned Twinleaf emits an animation WaitPrompt after UseAbilityAction, before applying the PowerEffect that opens the deck-search prompt. Two diagnostic CI failures (39210883661, 39211270630) confirmed a pending WaitPrompt in both no-Tower controls. The optional Tower correctly rejected Star Alchemy with UNKNOWN_POWER.

Fix commit 1db0a2aa90f5bba8da6f2fb8073f89d11e29dcd8 explicitly resolves the animation using ResolvePromptAction before checking ChooseCardsPrompt and the VSTAR marker. [Compiled manual CI 39211676495](https://github.com/FlareZ123/experiment-01/actions/runs/39211676495) passed all four assertions and the complete cross-lock workflow at pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

In physical seats 0 and 1, with Tower absent, Star Alchemy advances to ChooseCardsPrompt and consumes the VSTAR Power. With Tower present, Star Alchemy is unavailable and the VSTAR Power remains unspent. Forest Seal Stone remains attached in all four cases.

The pinned sources are `ptcg-server/src/game/store/effect-reducers/game-effect.ts` for animation sequencing, `ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts` for the Power, and `ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/jamming-tower.ts` for Tool-effect suppression.

This validates one preemptive interaction. It does not test completed deck-search choices, setup frequencies, autonomous policies, match clock, or field win rates. An active Jamming Tower prevents Tool-granted Star Alchemy without removing the attached Tool and does not itself disable Garbotoxin. No competitive games qualified.

## Search-to-shuffle extension

Commit `dfba5a22f1ea29e2c55fcabcd6d895bb9d6e7aec` extends the two no-Tower controls to select the real Boost Shake card from the player's deck using `ResolvePromptAction`, assert its movement into the source hand, complete the subsequent `ShuffleDeckPrompt` with a valid full deck-order permutation and assert that no pending prompts remain. The two Tower cases still reject Star Alchemy without spending the VSTAR Power. [Manual CI 39212390885](https://github.com/FlareZ123/experiment-01/actions/runs/39212390885) **passed** the full workflow, including these four action tests. This closes the bounded prompt-resolution sequence for the staged search, while leaving natural gameplay and competitive policy unqualified.
