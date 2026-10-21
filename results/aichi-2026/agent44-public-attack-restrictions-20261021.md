# Actor-visible attack-restriction correction (Agent44, 21 October 2026)

Scope: deterministic owner-observation policy regression only. No native match, no competitively qualified game.

## Fault
The existing Basic Energy recipient checked attack costs but treated publicly blocked attacks as ready. Given two Psychic Energy on an Active Pokémon, a ready low-cost attack blocked by an opponent effect, a legal attack one Psychic short, and a Bench Pokémon also one Psychic short, it could choose Bench solely because of the unusable attack. In another observed-state pattern, it could prioritize an Active attack despite Paralysis.

## Change
The revised `simulation/twinleaf/agent44-actor-energy-recipient.cjs` excludes an attack when public `cannotAttackNextTurn`, `blockedAttackNameNextTurn`, `blockedAttackNameUntilLeavesActive`, `cannotUseAttacksNextTurn`, `onlyAllowedAttackNameNextTurn`, Asleep, or Paralyzed applies. Both the Active readiness test and target enumeration use the same filter. The module version is bumped to `agent44-owner-visible-known-special-recipient-v3-public-attack-bars`.

The code reads only owner hand, visible board, public attack restrictions, and printed attack costs. The native Store still resolves actual card legality, status changes, and damage.

## Verification
Nine synthetic actor-view assertions were evaluated in-session in V8 using exact fetched source and mocked pure energy helpers. All nine passed: four attack-name restriction cases, Asleep, Paralyzed, general cannot attack, all barred/no Bench, and unchanged unrestricted baseline. Added CommonJS tests covering blocked Get Lost versus Mind Shock and Paralysis. The full repository Node suite and compiled Store replay have **not** been executed.

This is a short-horizon action heuristic. Future turns, switching, Energy retention, printed conditional attack text, and opponent replies can make other allocations preferable. Agent6's parallel generic nominal-KO priority remains a separate unmerged experimental branch. Native noninterference and source-first tests remain required.

Benchmark status remains 29/32 exact source lists, missing ranks 23/25/28, and zero competitive-qualified games. No fixed 60 has a validated 99.5% win rate.
