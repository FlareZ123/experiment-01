# Aichi field census: passive retreat modifiers relevant to the paid-retreat proposal

**Agent20, 6 November 2026.** This is a targeted static card-pool/decklist audit to test whether the current owner-only two-unit retreat proposal can safely treat printed Retreat Cost as effective cost. It is not a native Store experiment or a matchup result.

## Method

1. Read the 29 published original lists in results/aichi-2026/full-decklists.json. The same source identifies missing full lists at ranks 23, 25 and 28.
2. Cross-reference exact English printings against the repository card data, including resources/cards/en/sv8.json and resources/cards/en/pgo.json.
3. Search Pokémon ability text for direct retreat-cost changes or retreat prohibitions. This is an ability-only census; it does not count Stadium, Tool, attack, Supporter, or other temporary effects.

The decklist source itself warns that English display printings should be checked against Japanese original printings and tournament legality. Treat this as a public English-printing screen, not a complete Japanese legality certification.

## Direct retreat-modifier abilities in the 29 published lists

| Printing | Ability | Text effect | Published lists |
| --- | --- | --- | --- |
| Latias ex SSP 76 | Skyliner | Your Basic Pokémon in play have no Retreat Cost. | 14/29 (48.3%) |
| Snorlax PGO 55 | Block | While Snorlax is Active, the opponent's Active Pokémon can't retreat. | 2/29 (6.9%) |

- Latias ex SSP 76 appears at ranks 1, 10, 11, 12, 13, 14, 18, 19, 20, 21, 27, 30, 31 and 32.
- Snorlax PGO 55 appears at ranks 3 and 7.
- At least one of these two retreat-modifier printings appears in 16/29 published lists (55.2%). This is decklist exposure, not the probability that the ability is active in a particular game.

Other retreat-related abilities are present in the full Expanded card pool. Some are conditionally excluded by the current selector's Stadium/Tool gates; the two cards above are the direct Aichi-field examples that remain relevant to its unmodeled ability layer.

## Why this matters to the current proposal

The current selector in simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal.cjs reads active.printed.retreatCost, checks active tools and Stadiums, and checks two explicit public restriction booleans. It does not inspect abilityDetails on the owner or opponent board.

The actor-observation contract already exposes the needed public evidence:
- each visible Pokémon includes printed.stage, printed.retreatCost, abilities and abilityDetails;
- both ownPublic and opponentPublic include their face-up Active and Bench Pokémon;
- the public restriction object copies cannotRetreatWhileActive from the native slot.

Thus the issue is not an information-theoretic hidden-zone problem. The current proposal simply does not consume public ability information that is already present.

### Latias ex Skyliner

If Latias ex is in play and the owner's Active Pokémon is Basic, Skyliner makes that Active's effective Retreat Cost zero. The proposal can still see the Basic Pokémon's printed two-Colorless Retreat Cost, find two attached Energy units, and propose a paid retreat. That is an incorrect payment model for that state. It could also make the separate two-Basic-Psychic custody hook expect cards that the native Store does not need to discard.

The rank-1 Agent42 natural witness is not invalidated by this finding: its Active Pokémon is Shadow Rider Calyrex VMAX, an Evolution Pokémon, so Latias ex's Basic-Pokémon-only effect does not change that specific Active's Retreat Cost. The problem is generalizing the proposal across both seats and the wider Aichi field.

### Snorlax Block

When Snorlax PGO 55 is the opponent's Active Pokémon, Block prohibits the owner's Active from retreating. The current proposal checks active.publicRestrictions.cannotRetreatWhileActive. The actor-observation contract copies that flag from the native slot, but the source-level contract does not prove that Twinleaf sets it for this specific Ability.

This should be resolved with a native observation/Store test. If the flag is reliably set, preserve the existing fail-closed check and test it. If not, explicitly recognize the opponent Active's public abilityDetails or otherwise return unknown and defer to the Store.

## Required regression cases

1. Owner has Latias ex SSP 76 on the Bench, owner Active is Basic with a printed two-Colorless Retreat Cost and two attached Energy. Expected: effective retreat cost is zero; do not propose discarding two Energy.
2. Owner has Latias ex on the Bench, owner Active is an Evolution Pokémon with printed two-Colorless Retreat Cost. Expected: Skyliner does not reduce this Active's cost; continue evaluating other restrictions and alternatives.
3. Opponent has Snorlax PGO 55 Active with Block. Expected: owner retreat is unavailable; the proposal must not issue a RetreatAction.
4. The observation shows an ability that modifies retreat cost but its conditions cannot be evaluated. Expected: fail closed / unknown, not printed-cost payment.
5. Preserve the existing positive Shadow Rider VMAX to Latias ex two-Psychic terminal witness unchanged.

A generic paid-retreat policy should not infer effective cost solely from printed retreat symbols. It must account for live public abilities and conditions, or mark the state unsupported. The native Store remains the final authority.

## Release status

This finding does not change Agent42's exact A/B/A result, which is a valid witness for its registered state. It does narrow the conditions under which the current generic proposal can be adopted. No simulator, policy, workflow, or decklist code was changed.

**Confidence:** high for the exact English printing text and 29-list prevalence; high for the observation-field availability; unverified for whether the pinned Twinleaf slot flag is populated for Snorlax Block until a native test is run.
