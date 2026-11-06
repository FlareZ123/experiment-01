# Agent42 review: paid-Retreat proposal boundaries and v2

I reviewed both of your boundary notes against the v1 selector, actor wrapper, native custody code, card pool, and advanced-player manual.

## Confirmed v1 issues

1. The active attack inventory is treated as empty when missing, because the v1 selector uses a nullish fallback. Its GX filter excludes every GX attack without checking whether the once-per-game GX attack remains available.
2. Bench candidates are admitted by a printed-damage threshold. The selector does not compare damage with the opponent Active's remaining HP or model a Prize outcome.
3. The canonical wrapper checks the v1 paid-Retreat proposal before its funded VMAX Float Stone branch. The owner observation exposes \`ownHand\`, but v1 does not inspect a held Float Stone or compare a free line to the same target and attack.
4. The payment helper can represent Double Colorless Energy as one physical card satisfying two units. The v1 custody adapter accepts exactly two Basic Psychic Energy objects and its target gate is VMAX-only. The old real-Store join also expects VMAX and Max Geist. It therefore cannot bind the observed VMAX-to-Latias ex Eon Blade line to physical card objects.
5. There is an additional native-test distinction worth preserving: \`tests/agent42-two-unit-paid-retreat-native.test.cjs\` already has a staged VMAX-to-Latias ex payment path with direct energy-object assertions. That staged path did not run through the v1 custody wrapper, so it is not per-card custody evidence.

## Ability census and rules

I checked the uploaded card pool directly:

- Latias ex SSP 76, Skyliner: “Your Basic Pokémon in play have no Retreat Cost.”
- Snorlax PGO 55, Block: “As long as this Pokémon is in the Active Spot, your opponent's Active Pokémon can't retreat.”

The advanced-player manual's Retreat section says card effects can prevent Retreat, and its Retreat Cost section describes cost increases and reductions. The v2 guard therefore models controller and Active-Spot scope for Skyliner and Block. It ignores an opposing Skyliner for our Pokémon, treats our own Skyliner as a free Retreat when our Active is Basic, blocks when Snorlax Block is on the opponent's Active, and rejects unknown visible retreat-modifying ability text. The known rank1 source Active is a Shadow Rider VMAX, so our own Latias ex's Basic-only Skyliner does not reduce that Active's Retreat Cost.

Your field census makes this a material gate: Skyliner appears in 14/29 lists, and Snorlax PGO 55 appears in two lists.

## v2 implementation committed

The v2 path is opt-in and leaves the v1 experiment source intact:

- \`simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal-v2.cjs\`
- \`simulation/twinleaf/agent42-two-psychic-retreat-physical-custody-v2.cjs\`
- \`simulation/evaluation/agent42-realstore-paid-retreat-join-v2.cjs\`
- \`tests/agent42-public-two-unit-paid-retreat-proposal-v2.test.cjs\`
- \`tests/agent42-two-psychic-retreat-physical-custody-v2.test.cjs\`
- \`tests/agent42-realstore-paid-retreat-join-v2.test.cjs\`
- \`tests/agent42-two-unit-retreat-v2-actor-integration.test.cjs\`

The proposal requires exactly two distinct Basic Psychic Energy cards, a complete Active attack inventory, and no payable Active attack including an unused GX attack. It admits a bench attack only when printed damage alone KOs a non-Rule-Box Active with known empty Resistance and a projected one-Prize outcome. It marks a one-Prize terminal projection when the owner has one Prize remaining. Unknown damage/Prize text, unknown retreat abilities, opposing tools other than Tool Jammer, and unsupported payment classes fail closed. Native payment, attack, and terminal outcomes remain explicitly unverified by the selector.

The canonical wrapper's new \`twoUnitPaidRetreatRootV2\` flag compares a safe held Float Stone route to the same target and attack before selecting the paid Retreat. A different-target Float Stone line is not yet ranked against the terminal line; that comparison remains open.

The v2 custody observer now accepts VMAX-to-Latias and other target printings, preserves target Energy and Tool object identity, and certifies only the exact two Psychic objects entering discard with the intended promotion and retreat quota. The v2 join can bind Eon Blade or another settled same-turn attack.

## Validation status and request

The v2 tests and staged native test have been added to the existing Twinleaf completion workflow. I could not trigger the workflow from this session because the dispatch action was blocked by platform safety controls. I am not claiming that these tests passed. Please run the new v2 suite before considering the option for any common profile.

Please review the ability guard and the one-Prize projection in particular. They are intentionally conservative, and the result still has \`nativeTerminalVerified:false\` and \`competitiveGameQualified:false\`. I would welcome counterexamples from the Aichi field census before the v2 option is enabled in any registered run.
