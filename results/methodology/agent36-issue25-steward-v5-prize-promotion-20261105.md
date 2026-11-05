# Agent36: original-eight matched v4/v5 native Prize and promotion followthrough

**5 November 2026. Agent36. Retrospective developmental A/B. Zero qualified competitive games.**

## Exact running treatment and preservation

The [native v5](../../simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs) wraps the [steward-selected v4 original eight-arm policy](../../simulation/evaluation/agent36-issue25-steward-selected-v4.cjs) and adds just two previously separately tested owner-safe prompt handlers at the **actual innermost `headless.runMatch` boundary**. One handles ordinary KO Prize selection using the owner's occupied physical Prize slots and native validation ([Agent21](../../simulation/twinleaf/agent21-owner-first-prize-reveal.cjs)), and the other handles one owner-visible ChoosePokemon promotion using the owner/public board and existing charged preference ([Agent8](../../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs), [Agent1](../../simulation/twinleaf/agent1-charged-promotion-choice.cjs)). The real headless module export is restored in `finally`. No vendor edit or chosen source seed. The frozen original rank6/11 decks, candidate sixties, registered eight arms, both source seats, source-independent resource policy, both-seat Special Energy root, owner Capture continuation, three source-printed attack handlers and 48-root cap are unchanged.

The [pure test](../../tests/agent36-issue25-steward-innermost-prize-v5.test.cjs) checks that inner wrapper entry and exit order and exact game context are actually used, restoration after normal and thrown actions, original eight registration, both-seat controls and zero-game qualification. The [native matched A/B test](../../tests/agent36-issue25-steward-innermost-prize-v5.native.test.cjs) executes **16 real native attempts** (eight control v4 and eight treatment v5), checks independent source AND whole-physical-opening SHA per identical registered arm, and writes two complete raw attempts through the existing locked atomic JSON + SHA sidecar writer.

## Compiled original Store result

[GitHub Actions manual run 42059191496](https://github.com/FlareZ123/experiment-01/actions/runs/42059191496), observed head `84c683ae93b1fc07e2c68826c3d59cd6d506742e`, **overall SUCCESS**. Both the v5 pure/native comparison and archive-upload steps passed, using the pinned Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The complete control+treatment [artifact 13432225055](https://github.com/FlareZ123/experiment-01/actions/runs/42059191496/artifacts/13432225055) has provider ZIP digest `sha256:b85d014b6abb84cb82394fc3db483751ba85ff5d2cd99f173330afcc544a73e3`. Both JSON SHA256 values below are actual std-out `AGENT36_ISSUE25_STEWARD_V5` values with included atomic .sha256 siblings; the ZIP itself was not independently downloaded and decompressed.

- Control `issue25-steward-v4.json`: **140,169 bytes**, SHA256 `d837fb4d7e8ed80207b535071eb2b8c606f9b9888c9aa3902557e2d8de517e89`.
- Treatment `issue25-steward-v5.json`: **147,651 bytes**, SHA256 `22eacafb175bcc1ee365eeea3189c703c256f5555a8118dd68c988edda44cc17`.

**8/8 registered IDs match exactly, 8/8 source initial physical fingerprints match across v4/v5, and 8/8 full-two-player initial physical fingerprints match across v4/v5.** This supports a controlled within-identical-ID initial-deal prompt-policy comparison. It does not establish matched source openings *across different contender decklists*, which remain naturally affected by candidate mulligans.

| Original source registration and fixed contender | v4 native status | v5 native status | v4 roots | v5 roots |
| --- | --- | --- | ---: | ---: |
| `6:100:A:champion-reference` | 48-root cap | 48-root cap | 48 | 48 |
| `6:100:A:new-moon-lockbreaker-v1` | 48-root cap | 48-root cap | 48 | 48 |
| `6:101:B:champion-reference` | 48-root cap | 48-root cap | 48 | 48 |
| `6:101:B:new-moon-lockbreaker-v1` | 48-root cap | 48-root cap | 48 | 48 |
| `11:102:A:champion-reference` | **engine error** | **48-root cap** | 25 | 48 |
| `11:102:A:new-moon-lockbreaker-v1` | engine error | engine error | 14 | 14 |
| `11:103:B:champion-reference` | 48-root cap | 48-root cap | 48 | 48 |
| `11:103:B:new-moon-lockbreaker-v1` | 48-root cap | 48-root cap | 48 | 48 |

**Positive source-continuation result:** the actual `11:102:A:champion-reference` source-owner chain was unblocked: candidate seat0 genuine ordinary KO Prize prompt receives one native validated owner first-occupied choice; original source seat1 then receives its own native ChoosePokemon prompt, with one selection, one accepted action and one independently confirmed prompt postcondition, consistent with Agent20's existing branch evidence. The complete native runner no longer aborts at root25; it reaches the fixed root48 cap. This records liveness and genuine source promotion after the candidate attack, while missing direct Prize-to-hand card-count delta and before/after physical Active-zone custody. Neither these prompt settlements nor source root actions demonstrate competent source battle decisions.

The `11:102:A:new-moon-lockbreaker-v1` game still aborts at native root14 (candidate seat0 owner `ChooseCardsPrompt` per independent Agent18 earlier read-only evidence). This separate early prompt origin is **not** repaired by a KO Prize/Pokémon selector. The selected v5 still has **seven 48-root censored arms and one engine-aborted arm**; six returned source-attack settlement counts remained zero in unchanged cases and the rescued rank11 champion also reports zero by root48. No game finished.

**Result admission:** 0 qualified paper games, no valid match win/loss denominator; official 25-minute clock, fully owner-information-safe decision algorithm, printed payments and Prize custody, first source attacking payoff, and all 32 exact original field lists remain unresolved. **One error repaired for exactly the same physical starts** is a real narrow integration improvement, not a strong-deck performance result.

## High-value next diagnostic

Inspect the **actual candidate-owned native root14 `ChooseCardsPrompt` source** (not only a generic same-class prompt). Preserve the preceding native Store root and owner-eligible zone, then test any narrow existing handler against the genuine pending prompt with a native accepted-action, postcondition and physical zone-delta witness. Re-run all eight frozen arms; avoid a blanket generic hidden-card fallback or source/candidate-only policy. The original source rank6 still has no verified selected attack within root48; paper-valid special attachments and meaningful original source decisions require further development.
