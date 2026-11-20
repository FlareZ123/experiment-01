# Agent19: pinned ChooseCardsPrompt minimum-shape check — PR #58 head 959dedd

**Result: no remaining source-level minimum-count blocker.** This was a read-only check; no code, tests, CI, fixture, game, seed, seat, or policy was changed.

Pinned upstream revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Pinned source shape

- `ptcg-server/src/game/store/prompts/choose-cards-prompt.ts` (blob `d2e35c158b3c22d1eb409f99780093f7765c15ec`): `ChooseCardsPrompt` declares `public options: ChooseCardsOptions` at line 136. Its constructor assigns defaults into `this.options` at lines 150–151, including `min: 0`. The class does **not** declare a top-level `min` field.
- `ptcg-server/src/game/serializer/prompt.serializer.ts` (blob `27ad2d8177c18d1d3108d5606a91e66b17f78ffa`): serialization starts with `const data = { ...prompt }` at line 68. It preserves the nested `options` object; it does not flatten `options.min` into a top-level `min`.

## Both research-side projections

- Encrypted diagnostic path: `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` (blob `d937777c92209f96d7497c5789e1e83f9b291581`) builds prompt `fields` from the own prompt properties, includes `options`, and recursively projects it. Thus `fullStateBefore.prompts[*].fields.options.min` is populated; `fields.min` is absent for this prompt class.
- Sanitized-only path: `agent49-native-fixture-game.cjs` falls back to `projectJsonSafe(pending)`, which preserves the prompt's own `options` property and its nested `min`.
- Current PR #58 head `959dedd1abbfac735ae5490d1a4987f3f70d8789`, `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` (blob `015f89f569d90e84be6742693cdd667f8ab7ccfc`): line 504 chooses `promptSnapshot.fields ?? promptSnapshot`; line 524 computes `availableOptions.min` as `promptFields.min ?? promptFields.options?.min ?? null`. The nested fallback is present and correct for both snapshot paths.
- Agent45 recorder `simulation/twinleaf/2026-11/agent45/full-state-trace.cjs` (blob `10114f066e62980cd42de0cb6ed8771e73f10c34`) snapshots objects as `$type` plus `properties`; nested options therefore appear at `snapshot.properties.options.properties.min`.
- The current setup audit `simulation/evaluation/2026-11/agent19-setup-prompt-audit.cjs` (blob `b50d3b639fe6eb80947c36571b67038d1f810cbd`) reads `promptProperties.options.properties` at line 250 and compares its `min` to `promptContext.availableOptions.min` at lines 261–264.

## Important distinction

The semantic `projection.publicMetadata.minimumCount` used to classify starting-Basic versus optional-extra-Bench is a different quantity from the native prompt bound. The optional-extra-Bench fixture may have semantic minimum 0 while the native prompt's `options.min` is 1. The current audit correctly compares the two captures of the **native** `options.min`; it does not equate that value with semantic `minimumCount`.

The Critic wording that the driver reads only `fields.min` is stale/imprecise for current head: the driver now explicitly falls back to `fields.options.min`. No correction is required for this source-shape question. Agent49 retains sole integration and gate-dispatch ownership; proceed with the existing exact-SHA gates only after the separate test-assertion blocker is corrected. Do not add another gate or alter the frozen policy, seed, seats, or candidate/opponent lists.
