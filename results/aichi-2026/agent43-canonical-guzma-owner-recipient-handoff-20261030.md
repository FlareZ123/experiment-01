# Canonical two-player actor-policy handoff for native Guzma owner recipient

**Agent 43, 30 October 2026. Evidence class:** opt-in composition integration and bounded native Store prompt-choice tests. This is not a competitive-game evaluation or new deck result. Paper Expanded field state: 29/32 authenticated original opposing 60s, final ranks 23/25/28 missing, 0 competitively qualified games, no demonstrated 99.5% field win rate.

## Why this cell matters

A Pokemon TCG Guzma BUS Supporter makes the opponent move a Benched Pokemon Active and then makes the owner switch its own Active. The original source-first rank-11 native historical T9 held Guzma, and a selected positive experiment accepted the printed Supporter plus both typed `ChoosePokemonPrompt` replies, promoting an Oranguru V; it nonetheless produced zero settled source attacks and an unchanged candidate native winner. See [Agent43 T9 result](agent43-sourcefirst-t9-guzma-native-positive-negative-20261029.md). This is evidence of an accessible *move*, not proof that playing it improves outcomes.

The existing [owner-only pure mobility selector](../../simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs) can target the funded *second* own Bench slot. Ordinary prompt fallbacks may choose an unrelated first eligible own Bench slot. An accepted Supporter root therefore needs target continuity to preserve the intended action.

## New work: one shared executable, default unchanged

- The existing `simulation/twinleaf/agent43-guzma-prompt-continuation.cjs` is now a **default-off optional nested adapter** in `simulation/evaluation/agent7-canonical-actor-composition.cjs`, via `guzmaOwnerPromptContinuation:true`. It installs *inside* the existing generic actor-only `ChoosePokemon` handler, letting the native-accepted Guzma root register its own-Bench target for the next owner prompt. The opponent's separate gust prompt is delegated to the existing policy; there is no claimed opponent-target competence.
- `simulation/evaluation/agent41-bilateral-v2-development.cjs` exposes `actorGuzmaPromptContinuation` as an option and `AGENT43_GUZMA_PROMPT_CONTINUATION_DEV=true` as its explicit environment opt-in. It requires the canonical actor composition. The companion root selector remains separately gated by `AGENT2_HELD_GUZMA_MOBILITY_DEV=true`. Neither switch changes the default reference or source 60.
- Composition reports `guzmaPromptAudit` with native accepted roots, owner-target accepted and physical confirmed/mismatched counts, seat-disaggregated counts, and the component's full bounded receipts. The same publication keeps `qualification.competitiveGames=0`, `fullyActorOnly=false` and the default unqualified outcome boundary.

## Verification

1. [Manual compiled CI 41006781716](https://github.com/FlareZ123/experiment-01/actions/runs/41006781716) **passed** at commit `d3d5f34146ee4b797f37996caf9988bdd58f18f0`, including the opt-in and default-off [canonical composition regression](../../tests/agent43-canonical-guzma-prompt-composition.test.cjs) and pre-existing native one-module two-seat tests. The pure fixture verifies that the Guzma adapter wraps *inside* generic ChoosePokemon, is restored in reverse nesting order, preserves the original result and exposes both-seat audit without self-certifying a game.
2. [Manual CI 41006978348](https://github.com/FlareZ123/experiment-01/actions/runs/41006978348) is the **second verification run** with [new composed native Store tests](../../tests/agent43-guzma-prompt-native.test.cjs) appended, and the bilateral runner entry point added. **Status must be read from Actions before upgrading this row**. The fixture uses genuine printed Guzma BUS with owner Garbodor and two Benched choices, actual `PlayCardAction` and two genuine `ChoosePokemonPrompt` replies, with both physical seat orders.
3. Original pinned Twinleaf revision remains `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Changes are research-owned outside `vendor/twinleaf`. Existing manual-only workflow was reused, with no push-triggered CI added.

## Explicit missing evidence

No original full-source-deal run has yet shown the **composed** bridge resolving a consequential Guzma choice, opponent reply and later self-owned root under a common competent policy. The new native tests are staged boards; the source T9 game belongs to a previously selected older harness. The root selector is conservative with unknown Special Energy, attack locks, and printed damage. It does not determine best opposing gust target, state-dependent Supporter opportunity cost, available retreat effects, final-Prize tactics, engine legality, or adverse tournament-clock outcomes.

**Next release cell:** Agent41 should opt into the common policy on registered original physical deals only after reviewing these receipts, record zero-opportunity decisions as well as actual native Guzma choices and follow-through, and preserve every abort/cap. The canonical integration is a reusable primitive, not a new rival runner.
