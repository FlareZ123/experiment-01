# Agent21 pinned-native Energy Retrieval custody: accepted Item, one/two Basic recovered, both seats

**7 November 2026 UTC. Native-Store staged test results, not competitive matches.**

## Immutable evidence

- [GitHub Actions run 42347674046](https://github.com/FlareZ123/experiment-01/actions/runs/42347674046) **success**, at exact research commit `cf8aa44dbcc994254fa101c9112ba9cf668d209e`.
- [Workflow](../../.github/workflows/agent21-staged-native-energy-retrieval.yml), with immutable pinned Twinleaf Git dependency at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, checkout via `git submodule update --init --depth=1 vendor/twinleaf`, Node `20.19.0`, `npm ci` and `npm run compile`.
- Native source-backed test [`tests/agent21-energy-retrieval-staged-native.test.cjs`](../../tests/agent21-energy-retrieval-staged-native.test.cjs), **8/8 passed**. GitHub Actions artifact `13564521120` named `agent21-staged-native-retrieval-42347674046`, one `agent21-energy-retrieval-staged-native.log` file, ZIP SHA-256 `243e956872041207d87723b84b9322582ae40e58f12fb57233f1cf71539f13be`, all test output archived. Native test duration 1.83 seconds after installation/compilation.
- The same CI successfully passed the independent source-only suites `agent21-root93-k0-two-target-availability`, `agent21-secretbox-retrieval-item-fork`, and `agent21-energy-retrieval-slot-60`. The specific stage's exit success is confirmed in the workflow job; no missing log content is invented.

## Physical native test fixture and accepted actions

For **each physical player seat 0 and 1**, the staged native `State` sets one original `Energy Retrieval SVI` in the owner hand, two distinguishable original `Psychic Energy MEE` Basic cards and one `Double Colorless Energy NXD` Special card in owner discard, an `Unown AOR` owner Active and a damaged opposing `Trubbish FST`. Six owner Prizes and an artificial owner deck are separately instantiated. The test is **deliberately a synthetically staged effect/decision state**, never a shuffled full 60 or prospective field opponent. It uses actual `Store.dispatch`, genuine Item effect resolution, actual `ChooseCardsPrompt` from `owner.discard`, native `ResolvePromptAction` and genuine opponent `ShowCardsPrompt` acknowledgement, Item cleanup, and ordinary Energy attachment.

| Native acceptance control | Seat 0 | Seat 1 |
| --- | --- | --- |
| Select exactly one Basic from owner discard, recover by object identity, no Special selected | PASS | PASS |
| Select exactly two distinct Basics, recover both into owner hand exactly once | PASS | PASS |
| No Basic in owner discard: `canPlay` returns false despite Special Energy present | PASS | PASS |
| Retrieve one actual Basic then ordinary `PlayCardAction` attaches that exact object to the original owner Unown Active | PASS | PASS |

The log preserves physical Energy IDs in both seats. Seat 0 retrieved `721204` alone, or `721204,721205` together, and attached original `721204` to Unown ID `721201`; seat 1 retrieved `722204` alone, or `722204,722205` together, and attached original `722204` to Unown ID `722201`. In each case, native Item was physically discarded exactly once, card identities were conserved, the Special DCE stayed in discard, and no Prize was collected. Eight native tests passed with zero failures, cancellations or skipped cases.

## Scope and strategic meaning

This directly confirms a missing *mechanical link* for the existing proposed `-1 Fog Crystal, +1 Energy Retrieval` sixty: after an owner has accessible Basic Psychic in discard and an Item in hand, actual pinned Twinleaf supports owner-controlled retrieval and attachment. The code-facing identity is `Energy Retrieval SVI`, and the destination prompt is **owner discard**, unlike Secret Box/Fog's owner deck search. It does **not** independently prove Secret Box can retrieve the Item from a currently source-locked deck, pay its three-card cost in a different 60, settle Hidden Power damage/Prize, or retain an eligible position against a strong original-source opponent. All remain separate gates. The two-item model's hypothetical late-game access gain is documented in [the conditional comparison](agent21-secretbox-energy-retrieval-vs-fog-20261107.md).

**No prospective full game, paper win percentage, completed Aichi matchup or optimizer ranking is inferred.** The benchmark remains 29 authenticated source 60s / 32 and **zero competitively qualified games**; 99.5% remains purely aspirational. The strongest next experiment is to test a fixed re-registered 60 under natural source deals and compare an alternate **Night Stretcher** one-Energy-plus-Pokémon recovery Item, which five authenticated source decks already contain, before judging a Fog substitution.
