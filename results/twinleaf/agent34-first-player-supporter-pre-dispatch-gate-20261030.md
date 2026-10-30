# First-player Supporter pre-dispatch gate: explicitly optional

**30 October 2026 · Agent 34 · developmental paper-fidelity protection; not a game outcome**

## Problem and evidence boundary

The Pokémon TCG official rulebook states that the player going first cannot play an ordinary Supporter during their first turn. Printed card exceptions (for example, Carmine TWM) override this general restriction when their exact text authorizes it. The supplied Advanced Player's Rulebook §II.A further specifies that an updated printed card effect takes priority over the basic rules. References: [official Pokémon TCG rulebook](https://assets.pokemon.com/assets/cms2/pdf/trading-card-game/rulebook/swsh7_rulebook_en.pdf), [provided Advanced Player's Rulebook §II.A](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md).

The existing `simulation/twinleaf/paper-supporter-quota-guard.cjs` already denied a **second** ordinary Supporter before an actual root `PlayCardAction` reached native `Store.dispatch`. Its previous predicate considered only `owner.supporterTurn >= 1` and was therefore *not a first-player first-turn paper rule proof*. This identifies a narrow **guard coverage gap**. It does **not** by itself establish that pinned Twinleaf ever natively accepts an illegal first-turn Supporter, or that one was proposed during an original Aichi game.

## Research-owned change

Added a separate, **default-off** `enforceFirstPlayerSupporter` switch in that existing reversible Store guard. On authenticated physical owner `PlayCardAction` at pinned `state.turn===1`, it prevents dispatch of an ordinary first-turn Supporter unless the caller's `allowFirstPlayerSupporter({state,owner,card,action,store})` callback explicitly authorizes the **actual printed card**. It throws a typed `PaperFirstTurnSupporterError` with seat, global turn, source printing, hand presence, original physical root ordinal and rejection flag. No synthetic substitute action or artificial win is inserted. Existing second-Supporter veto remains independent even after a documented first-turn exception.

This is deliberately conservative: an integration that enables the switch must supply a reviewed exception policy based on current card text; the guard deliberately does not assume that arbitrary substring matches or native `canPlay` prove paper exceptions. Existing `withNativePaperSupporterDiscipline` does **not** enable it. All existing canonical runs preserve their original behavior.

## Scope of verification

`tests/paper-supporter-quota-guard.test.cjs` contains four additional mocked-Store regressions: (1) a first-player ordinary Supporter is blocked with physical hand intact, (2) an exact Carmine printing is allowed only with an explicit caller callback, (3) a permitted first-turn Supporter does not bypass the independent once-per-turn quota, and (4) the optional first-turn screen leaves the second player's ordinary opening turn unchanged. Those are **pure isolated dispatch-interceptor tests**, not compiled original-Store evidence.

Existing manual-only `.github/workflows/aichi-benchmark-stats.yml` now runs this file. Its manual result should be attached below only when fully observed. No new push-triggered CI or per-card workflow was added.

## Integration condition

Agent 41 owns the shared bilateral chooser. Before enabling this gate in that executable, authenticate the real owner seat and first global turn, enumerate exceptions from exact eligible printings (including any card-text updates), and run at least one **original pinned Store** legal first-turn exception and one ordinary first-turn negative. Preserve all rejected roots as censored/legality failures. Maintain the baseline A/B policy comparison and the independent one-Supporter quota test.

**Competitive evidence status:** 29/32 exact Aichi Top 32 original opposing 60s authenticated; zero competitively qualified games; no demonstrated 99.5% fixed-60 deck.

## Verified pure regression outcome

The existing manually dispatched [benchmark run 41004882696](https://github.com/FlareZ123/experiment-01/actions/runs/41004882696) completed successfully at head `41574b9b51f7581d2560916a7181e4b37b35bdae`, which includes the guard implementation and all nine mocked-Store tests. It is a **pure Node test-suite success**; this workflow did not compile Twinleaf or execute a first-turn original Store guard. The later function-documentation-only edit did not change execution behavior. A native original-Store test remains a separate gate.
