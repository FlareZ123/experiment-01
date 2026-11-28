# Rank 3 Snorlax control: integrated executable policy development head (2026-11-28)

**Status: research-side development, not game evidence.** One `agent17-rank3-snorlax-stall-opponent-v1.4-development` worker now combines three previously diverged, logically complementary sources of decision logic without changing any source or candidate decklist:

- Previous Agent17 Wobbuffet–Stealthy Hood and attackless-Dialga trap branch `agent17/rank3-lockbridge-trap-development-20261127`.
- Agent32 strict physical slot, duplicate-print prompt identity and Penny-root continuity base `e2068950acc1d289c20f2cd9ab73b445b9d597dc`.
- Agent17 pinned-native-rule Eri/Arven correction `e164591d7c815846aca855734b4a718745fb7ea8`: historical Tool is **not Item**, and Arven can select one category.

**Reproducible branch** `agent17/rank3-integrated-v14-development-20261128`; policy module `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`, source blob `6601d8d34f1542262d58c7f8e99edaaba6f8f79c`, integration commit `329ceae4ed75ec92e3f502026193765c403dbf55`. Added original 55-check trap suite `tests/2026-11/agent17-rank3-lockbridge-trap-development.test.cjs` and strict two-seat Dialga root→Counter Catcher→physically indexed Bench selection suite `tests/2026-11/agent17-rank3-dialga-trap-v3-decision-chain.test.cjs` (commit `e6f5de9008264946eca3fc13f7496e7ecce7c27e`).

## Concrete decision improvements

1. When the opponent has an active Wobbuffet disabling Snorlax's non-Psychic Block, the worker can prioritize **Stealthy Hood onto its physical active Snorlax** and obtain that Tool through Arven when genuinely available; it avoids taking the last active Tool slot for Tool Jammer in the same window. It vetoes the Hood plan when the visible board makes it irrelevant or imminently lost.
2. With opponent Bench Dialga-GX UPR 100 carrying only Psychic Energy, own active Snorlax and a live Block window, the worker prioritizes **Counter Catcher** to gust that attackless Pokémon. Guzma is separately scored when the own Snorlax promotion is available. It preserves the trap instead of using a nonwinning `Collapse` attack that would allow the opponent to promote an attacker.
3. Root physical action targeting and downstream prompt targeting are unified: same-print active/benched Snorlax are distinguished by actual slot metadata, rather than first matching source text. The original 14 Agent32 Penny/physical-target tests remain intact.
4. Eri excludes Forest Seal Stone from Item choices despite pre-SVI printed metadata; Arven now selects Item+Tool, Item-only, Tool-only or an explicit legal empty selection as advertised by the pinned native effect.
5. For opaque ordinary Prize choices earned by source-bound attacks, the worker accepts only a trusted actor-side `prize-slots` prompt with exact eligible source/action provenance and deterministic visible slot indices, never hidden Prize identities.

## Direct executable evidence (not Twinleaf match results)

Fetched exactly the integrated branch CommonJS module, shared strict-V3 protocol `d8349ae6f3537816b357b8309e9ab140ddec51eb`, and four branch test bodies, evaluated their unchanged functions in one V8 isolate with `node:test`/assert shims:

| Test body | Passed | Failed |
| --- | ---: | ---: |
| Prior executable Wobbuffet/Hood/Dialga/prize tests | 55 | 0 |
| Eri/Arven native-rule correction | 6 | 0 |
| Agent32 Penny/physical-slot continuation | 14 | 0 |
| New strict-V3 Counter Catcher root and Dialga Bench choice in two seats | 4 | 0 |
| **Total** | **79** | **0** |

The strict root and prompt tests exercise the **actual** protocol `validateRequest`, worker `createPolicy().decide`, and `validateDecision`, for both actor seats with public target slots and another opponent Bench threat. These are **independently constructed, valid actor-visible decisions**, not a paid native Store root→prompt→settlement or actual Pokémon game. Tests can also be run in Node where dependencies exist:

```sh
node --test \
  tests/2026-11/agent17-rank3-lockbridge-trap-development.test.cjs \
  tests/2026-11/agent17-rank3-eri-arven-tool-contract.test.cjs \
  tests/2026-11/agent32-rank3-penny-continuation-policy.test.cjs \
  tests/2026-11/agent17-rank3-dialga-trap-v3-decision-chain.test.cjs
```

A separate **49-case historical test file** on the older branch is **not** silently counted: using its historical v2 worker-protocol blob `d51ea95c457d61b50a9ee114d342eb17f4350451`, 43 cases pass; six diverge due to three corrected rule/behavior changes (Eri Tool, Arven Tool, Arven one-category), two previous reason-code names, and an obsolete simulated Legendary Ascent prompt family. Against the current strict-V3 protocol, several old fixtures are no longer schema-conformant. Preserve that history as old evidence, not as a current green suite.

## Remaining unblockers and experiment gate

- Exact pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` native root→prompt→settlement must be shown. The Agent32 owner gate for source-print integration and CI/main merge remains unchanged.
- **Identified additional native host gap:** pinned `Articuno-GX CES` source uses `MoveEnergyPrompt` in `Legendary Ascent` when Benched Water Energy exists, but `agent36-prompt-projection.cjs` switch and strict V3 `PROMPT_SELECTION_TYPE_TO_PROMPT_TYPES` do not currently support `MoveEnergyPrompt`. This is a known potential native rank-3 continuation blocker if that Ability route is actually taken; the existing `ChooseEnergyPrompt` worker branch cannot handle a different native class. Needs a tightly scoped research-side projection/protocol/worker compatibility path, never a hidden card lookup or vendor edit.
- Neither qualified 32-opponent coverage nor a 99.5% win claim exists. These tests improve the quality of the **opponent**, not the candidate's observed match performance.

**Next action:** owner-gated single exact native witness on source-print rank3, including real Penny prompt, Counter Catcher/Dialga if reachable and a targeted Articuno `MoveEnergyPrompt` compatibility check; then candidate-vs-source games, not additional paper-case counts.
