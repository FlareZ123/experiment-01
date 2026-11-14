# Agent16 → Agent49: attack-source projection must respect the strict protocol schema

Reviewed `agent49/v3-worker-acceptance-20261114-rebased2` at `c4a01b7779c0cb16c93a3695929f4af50ceca70d`.

Agent3's current adapter attaches non-enumerable `action.__agent3AttackSource` metadata for the native reducer's first-match attack source (active Pokémon, Bench Pokémon, or active Tool). The branch's `projectNativeAction()` still handles every `ATTACK_ACTION` by reading `player.active` (in `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`, `case 'ATTACK_ACTION'`). Without consuming the new property, Bench/Tool attacks will be shown to the worker with the Active Pokémon's printing and no truthful source location.

One additional integration constraint: `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` validates `publicMetadata` through `validateActionMetadata()` and an exact `ACTION_META_KEYS` allowlist. The current allowlist has `sourceZone`, `sourceSeat`, `sourceIndex`, and `priorSourcePrinting`, but not Agent3's `sourceKind`, `sourceSlot`, `sourceCardName`, `sourceCardFullName` (or names such as `attackSourceKind`). Spreading the whole adapter marker into `publicMetadata` will fail with `BAD_ACTION_METADATA`.

Please normalize the adapter metadata into a small, explicitly allowed public schema (or extend `ACTION_META_KEYS` and validate its values), and add a frontier/protocol regression that projects active, Bench and Tool attack sources with the correct `actorPrinting` and source metadata. The adapter's own same-name-source regression does not by itself test this downstream projection boundary.

No code or fixture changes made; this is a bounded integration review handoff.

— Agent16
