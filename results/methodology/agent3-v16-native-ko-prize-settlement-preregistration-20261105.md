# Preregistered Issue25 v16 native KO-shaped Prize settlement and physical destination observation

**Agent 3 | 5 Nov 2026, 14:25 UTC | proposal committed before native execution. STATUS: NATIVE RUN UNEXECUTED.**

## Question and identical source population

Does the already-existing owner first-occupied Prize prompt handler consume **real pending pinned-Twinleaf prompts**, and do the chosen physical Prize cards actually move to the taker's hand or to a replacement destination? Previous v13/v14 development reports count one native `ChoosePrizePrompt` proposal per selected treatment and demonstrate a public-root continuation, but do not independently certify exact physical Prize-card destination. A silent native `Store.reducePrompt` no-op can return without throwing; source-specific Prize card effects may share the prompt's class and message.

The proposed native [test](../../tests/agent3-issue25-v16-ko-prize-settlement-observer.native.test.cjs) wraps the **unchanged** `runOwnerPokemonAba()` from [v14 source](../../simulation/evaluation/agent3-issue25-v14-owner-pokemon-aba.cjs) in [a passive reversible physical observer](../../simulation/twinleaf/agent3-owner-ko-prize-settlement-evidence.cjs).

Use the exact registered **8 original Aichi rank6/rank11 candidate × source-seat IDs**, one original unchanged 60 per source rank, two candidate 60s and both source seats, three A/B/A Store campaigns for **24 attempts**, retaining engine errors, nonterminal caps, private-seed commitment and full source physical-deal fingerprints. This is a **retrospective** known-state replay of original observed trials. It is no evidence of unseen-event frequency. The observer is installed identically across A, B and repeated A, with no choice changes or policy-rank branches. The existing v14 test remains untouched and separately archived.

## Observed evidence to preserve

For each *genuinely pending*, owner-targeted `ChoosePrizePrompt` with `CHOOSE_PRIZE_CARD`, empty blocks and physical `options.destination === owner.hand`:

1. Count the native submission only when the exact selected Prize slots belong to the owner, are currently occupied, and satisfy physical selection bounds.
2. Capture **object references only** for the already-selected Prize cards inside the passive post-policy observer. No concealed card names, printings or faces are returned or supplied to the chooser.
3. After `Store.dispatch`, require that the exact original pending prompt has `prompt.result === submittedAction.result`. Silent native no-op must increment `nativeUnresolved` and throw rather than count accepted.
4. Independently check physical reference movement: selected original objects left Prize slots and entered the owner's **hand**, owner's **Lost Zone**, or an **other/unverified** destination. A prompt may validly resolve while a card effect changes the Prize destination.
5. Preserve pre/post aggregate Prize counts, hand and Lost Zone deltas, physical actor seat, turn/phase, records/overflow and all zero-opportunity cases. No card identity appears in the public receipt. No denominator drops on missing moves, engine failures or root caps.
6. Preserve all existing v13 strict A/B/A HMAC, source-deal parity, repeated-control-ledger and status gates. The new probe does not imply a certified game or any win-rate estimate.

Pinned vendor [`TAKE_SPECIFIC_PRIZES`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/prefabs.ts) invokes `CheckPrizesDestinationEffect` / `DrawPrizesEffect` before moving cards. Pinned [`Barbaracle LOR Lost Block`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-lost-origin/barbaracle.ts) redirects the opponent's Prizes to their Lost Zone. **A rule requiring every settled KO Prize to enter the hand would reject valid redirected outcomes.** Accordingly the observer records hand, Lost Zone and other/unverified separately. It does not claim complete paper origin provenance; the class/message/hand-destination combination is only KO-shaped.

## Before-native sanity and execution route

The stand-alone observer's [pure two-seat test file](../../tests/agent3-owner-ko-prize-settlement-evidence.test.cjs) was executed directly from its exact fetched source with V8-injected Store stand-ins: **10/10 PASS**, including genuine hand delivery, Barbaracle-style Lost Zone delivery, resolved without movement, silent unchanged Store, and card-specific same-message prompt with no KO destination. Concealed `name` and `fullName` getters throw, ensuring the observer never reads those fields.

The existing `issue25_v14_only` job of [`.github/workflows/agent50-rank26-koko-dual-recipient-native.yml`](../../.github/workflows/agent50-rank26-koko-dual-recipient-native.yml) now compiles pinned vendor, runs the 5 source/pure prompt regression files, runs its archived v14 native A/B/A test, then runs this separate prospective observer test and archives both JSON+SHA256 files under its existing artifact directory. [Workflow commit `8924b8c`](https://github.com/FlareZ123/experiment-01/commit/8924b8cda37f01f6b3e6cec07ec1b20b956dc1ff). The prior v14 official job completed in roughly 2 minutes 16 seconds on [run 41959942788](https://github.com/FlareZ123/experiment-01/actions/runs/41959942788); the incremental test uses one additional 24-trial campaign and no new workflow definition. Actual runtime/CI admission remains unobserved.

**Preregistered decision policy:** report every physical movement result, including zero eligible prompt opportunities and all missing/unknown destination outcomes; maintain FAIL/UNRESOLVED status unless actual native evidence meets each gate. No source/candidate game winner, Top32 field coverage or 99.5% strength claim is available from these prompt-focused trials.
