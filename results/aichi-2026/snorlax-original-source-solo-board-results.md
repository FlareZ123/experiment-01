# Source-dealt rank3/rank7 solo Snorlax board results

**Agent 19, 18 October 2026. Mechanical diagnostic only.** This report follows the prospectively committed [trial protocol](snorlax-solo-source-opening.md). The published rank-1 Shadow Rider 60 faced unchanged rank-3 and rank-7 opponent 60s. Two arms reused each frozen physical deck, seed and source seat. One arm changed only the source player's initial own-hand Snorlax setup selection.

The six new unit tests passed. [Pinned manual CI 39157958404](https://github.com/FlareZ123/experiment-01/actions/runs/39157958404) completed; [subsequent pinned CI 39158341164](https://github.com/FlareZ123/experiment-01/actions/runs/39158341164) additionally archived actual Active/Bench states at the first nonprompt player-turn opportunity, **before any turn decision**. The latter's artifact is `12147149438` and its source HEAD is `91a25bbb4821aef619812ae46d3313104040fea2`.

| Source | Precommitted physical deal pairs | Distinct deals holding Snorlax on setup | Actual solo Snorlax on policy-arm first turn | Actual solo Snorlax on default-arm first turn | Both arms returned bounded records |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rank3 Haruto Miki | 6 | 3 | 2 | 1 | 5 |
| Rank7 Hiroto Fuji | 6 | 3 | 3 | 0 | 6 |
| Total | **12** | **6** | **5** | **1** | **11** |

The starting-Pokémon resolver produced **seven positive selection callbacks across the six qualifying deal pairs**, because rank3 source seat1 repeat2 seed `81979068` offered two separate prompts, IDs 5 and 12. These callbacks are not seven independent games or independently audited root Store dispatches. The actual first turn in this exceptional case contained **Snorlax PGO Active plus another Snorlax PGO Benched**, even though each prompt was answered with exactly one Snorlax. This is a concrete failure of the assumption that selecting one card at every setup prompt establishes an empty Bench; a later optional setup/bonus Bench stage requires separate validation.

Important source-dealt board contrasts:
- Rank3 seed `573966525`, source seat0: default **Girafarig LOT Active, Snorlax PGO on Bench**; experimental branch **Snorlax PGO Active, Bench empty**.
- Rank7 seed `2128076113`, source seat0: default **Wobbuffet PHF Active, four Benched**; experimental branch **Snorlax PGO Active, Bench empty**.
- Rank7 seed `855414684`, source seat1: default **Snorlax PGO Active with Mimikyu PAL Benched**; experimental branch **Snorlax PGO Active, Bench empty**.

**Failure and noncompletion accounting:** Of 24 planned bounded attempts, 22 returned a record. Both arms for rank3 source-seat1 repeat0 seed `295772354` raised `ResolvePromptAction INVALID_TARGET` at ordinal 49; identical full prefixes were not independently established. Within the 22 returned attempts, two from a single rank3 pair reached an engine terminal; the other 20 hit the frozen 150-root-action cap. The opponent in the rank3 seed `573966525` experimental arm declared `Collapse` three times while its default arm declared no source-side attack. These attack declarations lack separate effect-level verification.

**Interpretation:** Source-hand Snorlax access becomes a reproducible first-turn Active/Bench choice on original registered 60s, but the conditional policy is far from an independently qualified adversarial stall policy. The default SimpleTacticsAi and the 150-action truncation prevent win-rate inference. We retain zero competitively qualified games and 29/32 verified opponent 60s. A follow-up should authenticate setup answers as actual Store root actions, study the second prompt's legality and meaning, and track the chosen solo lock through candidate attack and source reply.
