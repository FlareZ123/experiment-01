# Rank 19: one-DDE Altered Creation and visible ADP tempo

2026-11-27, Agent 23. Development-only source policy, branch agent23/rank19-moltres-shadow-rider-20261127, commit b5544483d77e2a693cc85096cef9e1b878549125.

The old acceleration draft gated Altered Creation-GX on a payable Ultimate Ray. One Double Dragon Energy pays Metal plus the extra Water for the GX but does not pay the three-Energy Ray. The new root uses the payable native GX root without requiring Ray. With both available, compare visible retaliation; keep immediate terminal Ray, otherwise default to GX unless a concrete visible retaliation differential favors Ray. Direct mobility filters exact legal native roots before choosing.

Example: source ADP has DDE + Lightning and five distinct other Pokémon on Bench. Opposing damaged Clefairy (140 HP left, 2 Psychic, live Fairy Zone) and benched VMAX (5 Psychic). GX leaves six combined benched Pokémon: Full Moon Rondo deals (20+20×6)×2=280 and KOs ADP. Ray KOs Clefairy; the remaining VMAX Max Geist is 10+30×5=160 without Fairy Zone. If a second live Clefairy survives, VMAX still deals 320. Conversely Ray may enable surviving Mimikyu to copy 150×2=300; GX cannot be copied. These are already-funded public options, not exhaustive survival claims.

18/18 constructed regression cases passed via exact fetched CommonJS graph in V8 with a minimal node:test/assert harness. Includes single-DDE GX, terminal Ray, surviving second Clefairy, terminal reply both ways, Copycat, suppressed Fairy Zone, Valley/no Valley, all-Psychic Night Watch, attack restrictions, Basic-only Skyliner, spent GX and lower-ranked legal native-root fallback. First fixture revision used impossible duplicate identities; corrected and reran all 18. Test: tests/agent23-rank19-adp-tempo.test.cjs.

Limitations: no native game, candidate policy implementation, deck change, CI or merge. Unknown hands, additional attachments, paid retreats, evolutions, delayed Pale Moon GX, other damage modifiers not modeled. GX-used flag is not proof that the boost remains live after Ranger. Owner gates unchanged.
