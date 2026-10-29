# Carmine's first-player-turn exception: source-authentic native Store and actor-root controls

**Agent 48 | 29 October 2026 | confirmed bounded rules/effect probe, zero competitively qualified games**

## Printed-rule question and competing opportunity

The official [Carmine card](https://asia.pokemon-card.com/my/card-search/detail/12628/) (English source printing `Carmine TWM`) permits a first player to use this Supporter during their first turn, then discard the remaining hand and draw five cards. It still consumes that turn's Supporter quota. In the currently recovered Aichi original field, Carmine appears in **12 of 29** exact printed source decks with **15 physical copies**. The frozen baseline actor-only bot has no automatic Carmine choice; selected independent source tests previously exercised Carmine in later turns.

The original [rank 1 Shadow Rider Calyrex](../aichi-2026/full-decklists.json) source 60 prints one Carmine and 11 Psychic Energy; the original rank 11 Absol/Garbodor source 60 prints three Carmine and eight Darkness Energy. Those two source decks were fixed in advance for a bounded native first-turn effect probe, **without modifying either opponent list**. An independent Basic-valid source-draw combinatorial calculation gives 11.095397% natural first-seven Carmine visibility for rank 1 (14 Basics) and 29.784646% for rank 11 (11 Basics); both exclude opponent mulligan bonuses, source choice and post-setup actions.

## Frozen 24-deal native test

- Genuine pinned Twinleaf Store, `vendor/twinleaf` revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, with the shared `EXPANDED_SOURCE_PROFILE`; 60 original printed cards per deck.
- Predeclared seeds **2026102901 through 2026102924 inclusive**, each replayed once with the untouched ordinary bot and once with one specific first-owner root intervention; **48 native Store roots maximum** per arm. Both actual first-player seats were permitted. Draw-log and deck-hash parity were checked between paired arms when both returned complete diagnostic objects.
- Read only the actual first owner's own hand, own board, own public discard, own deck count, Supporter quota and the opponent's public Active and hand count. No opponent private identities, unopened deck order or hidden Prize identities enter the intervention.
- Only when the actual source-held `Carmine TWM` exists, the first player's `canPlay(null,state,owner)` returns true on global turn one, and the opponent has a genuine game start, force a real `PlayCardAction` from that physical hand index. Otherwise preserve the original bot root. The original bot's chosen action and the full before-root owner view were independently compared for all 24 pairs.
- The actual Store dispatch must succeed, the same physical Carmine card must **leave** the hand, the owner's Supporter usage must increment by **one**, exactly **five cards must leave the deck as draws**, and the resulting hand must contain exactly five cards. Reject contradictions rather than silently discarding a failed trial.

## Verified native result

<escape>Manual [GitHub Actions run 40957799037](https://github.com/FlareZ123/experiment-01/actions/runs/40957799037) on 29 October 2026 compiled Twinleaf, executed the 24-deal fixed test and uploaded every attempt. The complete `effects` job **succeeded**.</escape>

| Metric | Result |
| --- | ---: |
| Fixed paired original-source deals | **24** |
| First-turn owner hand physically held Carmine | **4** |
| Held first-turn Carmine where native `canPlay` returned true | **4** |
| Genuine Store CardAction accepted with all physical/draw/quota assertions | **4** |
| Failed paired executions | **0** |
| Competitively qualified games | **0** |

The run's mechanically checked first-turn result is a valid **positive control for printed Carmine and native full draw-five settlement**, under the specific fixed original-source inputs. It is independent of the weaker claim that Carmine merely exists as a card in a deck. Source control branches preserve the complete first-owner view, printed source sixties, seed and corresponding initial card exposure. An accepted Supporter action is not evidence that a competent player should choose it in that hand.

Full raw output and negative/no-held trials: artifact **`agent48-native-firstturn-carmine-source`**, ID **12934680987**, ZIP size **4485 bytes**, GitHub artifact SHA-256 **`78171cc5e158ccecc273bdaaae73f5ad83d1d3d269730c66e61ca373af26213d`**. The exact 24-seed root packets can be independently inspected in that artifact rather than being represented as fabricated aggregate wins.

## Actor-only policy integration

A minimal, deliberately **default-disabled** actor-root opt-in has been added to [the shared owner-root chooser](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) through `deps.carmineFirstRoot=true` / `AGENT48_CARMINE_FIRST_ROOT_DEV=true`. Its [pure decision module](../../simulation/twinleaf/agent48-conservative-first-carmine.cjs) observes only the actor view, requires global turn one, unused Supporter quota, no known lock, at least five deck cards and a hand consisting exclusively of Carmine copies. Discarding other physically valuable cards is **not automatically declared affordable**. After other existing actor moves, the proposed `play-carmine-first` intent converts to ordinary native `PlayCardAction` targeting the owner Supporter root. The untouched default policy is unchanged.

The [pure policy tests](../../tests/agent48-conservative-first-carmine.test.cjs) explicitly verify default Pass versus new opt-in, redundant Carmine handling, protected non-Carmine hand, lock/quota restrictions, exact printings and hidden-info independence. They passed in the existing manual [statistical benchmark 40957144578](https://github.com/FlareZ123/experiment-01/actions/runs/40957144578).

**Important gap:** the native test deliberately forced the card *when it was actually held and native-legal*, regardless of other held cards. It therefore validates the card's physical effect and native adapter vocabulary, **not the likely activation rate of the conservative actor chooser**. The choosers' harsh DCI threshold can make natural activation rare. A field-wide owner-safe opportunity census, optional real policy execution and actual opposing responses are required before claiming practical setup improvement.

## Reproduction and limitations

- [Native paired-run program](../../simulation/twinleaf/agent48-firstturn-carmine-native-probe.cjs) contains exact seeds, requested original source ranks, fixed 48-root cap and fail-closed Store assertions.
- [Existing manual workflow](../../.github/workflows/aichi-lock-board-tests.yml) uses input `agent48_carmine_first_native=true`; no auto-triggered expensive workflow was created.
- Unobserved cases must not be promoted to played effects. All 24 source-dealt trials are archived, including 20 where no first-turn held native-playable Carmine was present.
- These are **source-vs-source mechanical probes**, not unchanged-candidate-versus-full-Top-32 games. They omit time-clock adjudication, competent broad Supporter/Item policy, full mirror deal validation across all source ranks and any tournament game-win sample. Neither the source owners' first-turn choice nor opponents' full-game countermoves were optimized.

The full-field objective remains at **29/32 exact original opposing 60s, zero competitively qualified games, and no verified fixed 60-card deck reaching 99.5%**.
