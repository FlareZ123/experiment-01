# Agent32: exact prompt classification for the v8 native aborts

**6 November 2026 | Agent32 | Development-only diagnosis.** This report does not qualify any competitive game, select a deck, or estimate a win rate.

## Question and provenance

What exact owner-visible prompt envelopes and last accepted public roots precede the five native decoder errors in the broader v8 eight-arm Issue25 run?

Source: [manual workflow run 42228565414](https://github.com/FlareZ123/experiment-01/actions/runs/42228565414), artifact 13506238955, checkout `46d6775ab50c90fa290a7d51c5d0cb142ffa6e3a`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. I independently downloaded and parsed `issue25-steward-v8.json`: 505,775 bytes, SHA256 `d30132ced995f6f0577937de501e86c0e3c51a9bd116b1891b42506118d81ce0`.

All five error rows carry the same redacted native-failure digest `2dc3a55f9b6d7dbc60aaa8883b43982e213957c44179b1baf52cb1139effe11f`. The adapter source `simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs` constructs the error with message `Native raw-State decision fallback reached before owner-safe policy closure` and code `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED`. The archive retains the digest rather than the full thrown detail; the visible message/code above come from the exact pinned research adapter source.

## Five aborts, joined to their public accepted-root ledgers

| Registered attempt | Abort ordinal / turn / owner seat | Pending prompt | Public envelope | Last accepted root |
| --- | --- | --- | --- | --- |
| `6:210:B:new-moon-lockbreaker-v1` | 118 / 22 / 1 | `ChooseCardsPrompt` | `CHOOSE_CARD_TO_PUT_ONTO_BENCH`; min 0, max 2, cancelable | 117: candidate seat1 `PlayCardAction`, `Telepathic Psychic Energy` |
| `11:211:A:new-moon-lockbreaker-v1` | 88 / 17 / 0 | `ChooseCardsPrompt` | `CHOOSE_CARD_TO_PUT_ONTO_BENCH`; min 0, max 1, cancelable | 87: candidate seat0 `PlayCardAction`, `Telepathic Psychic Energy` |
| `1:212:B:champion-reference` | 98 / 22 / 0 | `ConfirmPrompt` | `WANT_TO_USE_ABILITY` | 97: `PlayCardAction`, `Radiant Eternatus` |
| `3:213:A:champion-reference` | 106 / 27 / 1 | `ConfirmPrompt` | `WANT_TO_USE_ABILITY` | 105: `PlayCardAction`, `Articuno-GX` |
| `3:213:A:new-moon-lockbreaker-v1` | 93 / 27 / 1 | `ConfirmPrompt` | `WANT_TO_USE_ABILITY` | 92: `PlayCardAction`, `Articuno-GX` |

The two ChooseCards rows are **strong Telepath candidates**: the exact public message and the preceding Telepathic Psychic Energy play align with the previously validated Agent8 owner-deck search component. They are not yet an exact source join. This v8 envelope omits `prompt.cards` object identity, the source CardList/zone, and the filter; the preceding accepted action alone does not prove causation.

The three Confirm rows are unresolved `WANT_TO_USE_ABILITY` prompts. Their source abilities are not identified by this artifact. The preceding Radiant Eternatus or Articuno-GX PlayCardAction is only the last accepted root, not proof that it caused the prompt.

## Reuse and next experiment

Agent8's existing `simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs` is a narrow owner-only handler for a genuine from-hand Telepath attachment followed by its fresh owner-deck prompt. Agent10's independently downloaded v5 cross-archive audit reports two actual Telepath attachments, two settled owner searches, four physical Basic Psychic Bench transfers, no custody/shuffle/native rejection errors, and unchanged initial deals across the original eight. See [Agent10's v5 result](agent10-issue25-telepath-v5-cross-archive-native-custody-20261105.md). That v5 result is mechanism precedent, not evidence that the v8 prompts are the same source.

A separate v8 treatment is now implemented in:
- `simulation/evaluation/agent32-issue25-v8-telepath-development.cjs`
- `tests/agent32-issue25-v8-telepath-development.test.cjs`
- `tests/agent32-issue25-v8-telepath-development.native.test.cjs`

It wraps the actual `headless.runMatch` boundary, reuses Agent8's handler without modifying it, and compares the unchanged v8 eight-arm registration and 128-root horizon against a treatment. The native test requires identical initial physical deals and exact accepted-root prefix parity, then requires actual owner prompt matching, Store settlement, physical Bench custody, and shuffle evidence for the two suspected rows. It retains all failures and remains explicitly unqualified. It is wired into the existing manual `twinleaf-completion.yml` Telepath lane under the existing input; no new workflow or workflow input was added. The compiled run is pending at the time of this report.

The three ConfirmPrompt failures remain explicit. A separate source/owner-zone audit and specific, tested prompt policy are required before changing those decisions. Do not substitute default raw-State resolution or assume that a generic false/empty response is strategically sound.

## Limits

This classification establishes the public pending prompt class, message, options, owner seat, last accepted root and quarantine path. It does not establish prompt CardList identity for v8, exact ability origin for the Confirm prompts, a paper-valid game, a meaningful opponent response, or any competitive result. Current benchmark remains 29 authenticated original 60-card inventories, zero competitively qualified games, and no demonstrated 99.5% win rate.
