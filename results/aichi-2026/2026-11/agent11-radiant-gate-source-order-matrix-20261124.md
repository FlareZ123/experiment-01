# Radiant Eternatus / Climactic Gate — Ability-lock source-order test matrix

**Purpose:** make the paper-rule target explicit for the fixed candidate policy and the Twinleaf research adapter. This is a source-bound test specification, not a claim that Twinleaf currently models the timing correctly.

## Target being evaluated

At the instant Radiant Eternatus is played from hand onto the Bench, its Climactic Gate on-play Ability is the target. It is a Basic Pokémon with the Radiant Pokémon Rule, is Dragon (not Psychic), and is not a Future Pokémon. Stealthy Hood cannot protect this trigger: the Tool cannot be attached to Radiant before the on-play Ability is evaluated.

A 2023 Champions League Aichi rules article by a certified judge directly answers the analogous Galarian Moltres on-play Ability under Active Klefki as **unusable**, because Mischievous Lock applies as the Basic Pokémon is placed on the Bench: https://note.com/yieupcg/n/n78128305443e (question 3.5 / explanation lines 336–338). The same article's question 3.7 gives an ordering example: Escape Rope switches both Klefki and Empoleon V from Bench to Active, and the Pokémon switched first (the opponent's Empoleon V) has its Ability take effect first. This supports using actual entry/activation order rather than an arbitrary side preference; the turn-seat tie remains a separate simultaneous-activation case. Treat an **effective** Active Klefki as a Gate suppressor.

## Direct source scopes against Radiant on the Bench

| Source | Required location / condition | Does its printed scope include Radiant? | Seat scope |
|---|---|---|---|
| Path to the Peak | Stadium effects live | Yes, if Radiant is classified as a Rule Box Pokémon | Both sides |
| Silent Lab | Stadium effects live | Yes, Radiant is Basic | Both sides |
| Iron Thorns ex / Initialization | Iron Thorns Active; source Ability effective | Yes, Radiant has a Rule Box and is not Future | Both sides |
| Wobbuffet / Bide Barricade | Wobbuffet Active; source Ability effective | Yes, Radiant is non-Psychic | Both sides |
| Klefki / Mischievous Lock | Klefki Active; source Ability effective | Yes, Radiant is Basic; exception is same Ability | Both sides |
| Alolan Muk / Power of Alchemy | Alolan Muk in play; source Ability effective | Yes, Radiant is Basic; exception is same Ability | Both sides |
| Garbodor / Garbotoxin | Garbodor in play with a Pokémon Tool; source Ability effective | Yes, all Pokémon | Both sides |
| Galarian Weezing / Neutralizing Gas | Galarian Weezing Active; source Ability effective | Yes, all opponent Pokémon | Opponent's Pokémon only |
| Slaking / Lazy | Slaking Active; source Ability effective | Yes, all opponent Pokémon | Opponent's Pokémon only |
| Flutter Mane / Midnight Fluttering | Flutter Mane Active; source Ability effective | **No direct Gate lock:** its scope is the opponent's Active Pokémon, while Radiant is being played to the Bench | Opponent Active only |

The source list is not an OR of printed card names. A source only blocks Gate if its Ability is actually effective after Stadium suppression and source-on-source Ability suppression. In particular, an actor-Active Flutter Mane can suppress the opponent's Active Klefki, while Klefki can suppress Basic Pokémon on both sides. Which one remains effective depends on activation order. If Flutter Mane became effective first, opponent Active Klefki is suppressed and Flutter Mane does not itself suppress Radiant on the Bench; Gate may resolve. If Klefki became effective first, it suppresses Flutter Mane and Gate is blocked.

## Required regressions

1. **Single-source coverage:** test each source above alone, both physical seats for symmetric sources, and only the opponent-side orientation for Galarian Weezing / Slaking. Verify target scope and active/bench requirements.
2. **Klefki judge analogue:** Active Klefki alone blocks Gate for either seat. No Stealthy Hood attached to Radiant can bypass this.
3. **Mutual source order:** actor Active Flutter Mane vs opponent Active Klefki, in both activation orders, with each physical seat taking the turn. Verify Gate is available only when the effective source is Flutter Mane and its scope does not include the Benched Radiant.
4. **Other source suppression:** include Active Flutter Mane vs opponent Active Iron Thorns, Wobbuffet, Garbodor-with-Tool, Galarian Weezing, and Slaking. Resolve the actual source scopes; do not treat every visible source as effective merely because it is present.
5. **Same-Ability exceptions:** two Klefki, two Flutter Mane, two Galarian Weezing, two Slaking, and two Garbodor sources must not suppress one another via the printed same-Ability exception. Alolan Muk's Power of Alchemy exception must also be represented if that source is included.
6. **Stadium interactions:** live Path to the Peak and Silent Lab block Gate. Apply the Stadium/Tool no-effect epoch. Path to the Peak suppresses Future Rule Box sources too; the Future exception belongs to Iron Thorns' target scope, not Path's source suppression.
7. **Unknown information:** missing source order, missing Tool state, or unknown Stadium/Tool epoch must remain explicitly unknown/fail-closed; do not silently equate presence with effective lock.
8. **Rule Box classification:** the generic Rule Box predicate used for Iron Thorns / Path must recognize Radiant Pokémon. The current candidate worker's `isRuleBoxPokemon()` helper does not include the Radiant subtype.

## Native activation-order field prerequisite

The main-branch `simulation/twinleaf/actor-observation-contract.cjs` only copies `pokemon.abilityLockActivationOrder` when the native object already has a safe integer; otherwise it emits null. A repository-wide search found no research-owned writer. Before relying on v4, verify against the pinned Twinleaf revision that the native property exists and is updated when an Ability source becomes effective, including when a Benched Pokémon enters the Active Spot. The candidate policy's synthetic non-null test values do not prove this. If the native property is absent or tracks only initial play rather than Ability activation/Active entry, add a research-side hook/tracker and a native observation regression; do not modify upstream Twinleaf.

## Implementation direction

Use one source-attributed resolver for the target Radiant Ability, not `hasRadiantGateLock()` as a collection of independent boolean presence checks. It must account for:

- source card scope and physical seat;
- source Ability activation order and turn-player tie;
- whether each source is itself suppressed by another source;
- same-Ability exceptions;
- Path / Silent Lab / Stadium-Tool no-effect state;
- target's Basic / Rule Box / Future / Psychic attributes;
- the fact that no Tool can be attached to Radiant before its initial Gate trigger.

The pinned Twinleaf pre-placement ConfirmPrompt is an engine-order mismatch with the paper timing. A research-side hook should correct the trigger path without modifying upstream Twinleaf. Preserve the separate pre-placement Bench reservation: the alleged Radiant double-reservation was withdrawn and is not part of this issue.

## Evidence boundary

The source scopes above are read from the repository card pool and the direct Klefki analogue is a certified-judge article, not an official card-specific ruling. The test matrix is a proposed validation contract. No native game, Aichi matchup, win rate, or 99.5% result is claimed.
