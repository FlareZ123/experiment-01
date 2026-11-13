# Agent36 V3 Fog Crystal setup-policy integration

**Status:** implemented in the pinned V3 runner; native rerun pending the owner-controlled diagnostic key. This is a policy-integration result, not a game-performance result.

## Problem

The first complete native V3 fixture (Agent49, fixed candidate vs Aichi rank 1, pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`) ended with rank 1 clearing the candidate's board on turn 7. The candidate never benched a second Pokémon, despite the fixture report identifying an in-hand search route during each of its first three turns. See [Agent49's first native fixture report](agent49-first-native-v3-fixture-20261113.md) and [the search-prompt contract](agent5-v3-search-prompt-contract-20261113.md).

## Opening-route reconstruction

The fixed candidate list, fixture seed `agent36-v3-fixture-hood-rank1-20261112-01`, and the exact `seededRandom` / Fisher–Yates `deckPermutation` implementation in `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` permit deterministic reconstruction of the opening shuffle. Assuming the first native `ShuffleDeckPrompt` belongs to candidate seat 0 (the runner's deckA/candidate ordering, consistent with the reported Active Shadow Rider Calyrex V), the candidate's initial hand includes Fog Crystal and Mysterious Treasure. This is a derivation from public inputs, **not a direct observation of Agent49's private raw trace**; Agent49 has been asked to confirm or correct it with a sanitized candidate-only decision summary.

The actionable first-turn route is Fog Crystal: unlike Mysterious Treasure or Quick Ball, it does not require selecting a discard donor. No Mysterious Treasure or Quick Ball root is enabled by this change. Agent5's prompt-contract report specifically warns that a proposed discard index/printing is not proof of the exact physical donor accepted by native Store.

## Implementation

The V3 runner now installs the existing `agent9-fog-actor-prompt.cjs` component **inside the role-composer run callback, after Agent34's candidate/opponent wrappers are installed**. The last-installed Fog component therefore sees each live decision first, can prioritize the actor-owned Fog Crystal root and resolve its authentic owner-deck search prompt, and delegates all other decisions back to the role-scoped Agent34 policy.

The reused Agent9 component:
- reads only the acting player's detached observation and authentic owner-deck prompt;
- binds the exact physical Fog Crystal source object and source hand index;
- enumerates legal offered printings and applies native `ChooseCardsPrompt.validate`;
- dispatches the exact selected physical target through native `ResolvePromptAction`;
- records native Store acceptance, source-card binding, rejected choices, and later physical plays of the searched card.

The V3 policy identity is now `agent34-actor-only-root-slice-v16-agent9-fog-crystal-setup`, with trial ID `agent36-v3-fixture-hood-rank1-20261113-fog-v1`. The original seed, candidate 60, opponent 60, deck hashes, and Twinleaf engine pin are unchanged to preserve a paired comparison. The prompt chain, common runtime bindings (including `game/game-message.js`), and test suite now pin the Agent9 module and its unit test. The fixture artifact retains the Fog audit; the public CLI summary exposes only aggregate accepted/rejected counts.

Relevant implementation:
- [V3 runner](../../../simulation/evaluation/2026-11/agent36-v3-runner.cjs)
- [V3 fixture integration test](../../../tests/2026-11/agent36-v3-fixture-game.test.cjs)
- [Existing Agent9 wrapper](../../../simulation/twinleaf/agent9-fog-actor-prompt.cjs)
- [Existing Agent9 tests](../../../tests/agent9-fog-actor-prompt.test.cjs)
- [Original native fixture report](agent49-first-native-v3-fixture-20261113.md)

## Validation and limitations

The integration is committed, and the V3 test path now includes the existing Agent9 unit test plus an explicit assertion that the Fog wrapper is installed after the role-scoped Agent34 wrappers and bound into the policy identity. These tests have **not yet been executed in CI** after this change.

An attempt to dispatch the encrypted native fixture workflow on 13 November 2026 (run [43492137408](https://github.com/FlareZ123/experiment-01/actions/runs/43492137408)) failed before compilation because the repository Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` was empty. No game ran and no artifact was uploaded. The workflow must not be redispatched until the repository owner configures the RSA public-key variable; the matching private key must remain offline. The raw Agent49 trace remains local/offline.

Consequently:
- no native V3 rerun has validated this policy integration;
- no new bench, search, Store-acceptance, board-survival, or win-rate result is claimed;
- the previous turn-7 loss and 3-fallback / 2-bypass counts remain historical baseline, not v16 behavior;
- no paper deck legality or Aichi matchup result changes;
- this does not establish any competitive win rate or progress toward the 99.5% target.

## Next action

1. Agent49 confirms/corrects the deterministic opening-route inference using a sanitized candidate-only trace (no raw state or opponent hidden zones).
2. Repository owner configures `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`.
3. Dispatch the same fixed fixture seed under policy v16. Inspect Fog root acceptance, exact source-card binding, legal owner-deck target, native prompt acceptance, physical Bench placement, Agent34 actor-only boundary, and the full game outcome.
4. Only if this route is physically accepted should a separate investigation consider the Mysterious Treasure discard chain. Keep the 60-card candidate unchanged during this policy comparison.
