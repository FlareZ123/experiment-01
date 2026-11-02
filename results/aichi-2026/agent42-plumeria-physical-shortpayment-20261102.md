# Agent42: original Plumeria BUS one-card native payment bypass

**2 November 2026 | reproduced in the pinned Twinleaf Store, both physical seats | zero qualified games.**

## What changed

The actual pinned engine accepts a physically submitted **one-card** Plumeria payment, despite its own two-card prompt validator rejecting the reply, and subsequently **moves an opposing Energy card from Active to discard**. This is a paper-invalid effect in a prepared Store state. The printed [Plumeria BUS 120](https://limitlesstcg.com/cards/bus/120) requires two cards from hand to be discarded before an opponent's Energy may be discarded.

This confirms the specific code-path concern raised in [Agent30's frozen canary Plumeria analysis](agent30-frozen-rank6-native-plumeria-two-selection-energy-denial-20261102.md), which had only observed a naturally executed two-card selection and opposing Energy reduction, without independent physical payment-zone proof. No natural game is newly certified by this fixture.

## Reproduction provenance

- Native test: [tests/agent42-plumeria-shortpayment-native.test.cjs](../../tests/agent42-plumeria-shortpayment-native.test.cjs)
- Genuine Store fixture: [simulation/twinleaf/agent42-plumeria-shortpayment-native.cjs](../../simulation/twinleaf/agent42-plumeria-shortpayment-native.cjs)
- [Compiled manual GitHub Actions 41480993359](https://github.com/FlareZ123/experiment-01/actions/runs/41480993359), job `native-attachment-probe`, **SUCCESS**. Targeted test step also passed.
- Selected code revision: `f2d5f91a52480e2e37b9e17d799cff476657fcea`.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`.
- Source register: `results/aichi-2026/full-decklists.json`, original roster Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`.

The fixture uses original rank6 registered Plumeria BUS, two actual owner-hand candidate discard objects **Guzma BUS** and **Enhanced Hammer TWM**, real opposing Active Pokémon and attached basic Energy, true native `PlayCardAction`, `ChooseCardsPrompt`, `ChoosePokemonPrompt` and `ResolvePromptAction`. There is no original randomized opening, legal-match win outcome, turn-clock evidence or full 60-card game in these prepared states.

## Six-case native receipts

The following comes from **all six `AGENT42_PLUMERIA_PAYMENT` rows in the compiled job log**, rather than from static predicted behavior. Every payment prompt had `min=2,max=2`. All six `Store.dispatch` payment resolutions returned without an error and their prompts settled.

| Physical owner seat | Submitted owner-hand payment | Native `prompt.validate` | Cards physically transferred to owner discard | Opponent's Active Energy physically moved to discard |
| --- | ---: | --- | ---: | --- |
| 0 | 0 | false | 0 | No |
| 0 | **1** | **false** | **1** | **Yes** |
| 0 | 2 | true | 2 | Yes |
| 1 | 0 | false | 0 | No |
| 1 | **1** | **false** | **1** | **Yes** |
| 1 | 2 | true | 2 | Yes |

The native `ChoosePokemonPrompt` and subsequent attached-Energy `ChooseCardsPrompt` both appeared and accepted valid targets in the one- and two-card cases. They did not appear in the zero-card case. All expected original owner-hand/discard and opponent Active/discard physical object membership assertions passed. The one-card positive effect is therefore an actual native **illegal underpayment with real opposing resource removal**. A zero-card Store-accepted prompt is independently wrong as a prompt action, but did **not** create the same resource payoff.

## Precise engine mechanism

The pinned [Plumeria reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-burning-shadows/plumeria.ts) constructs a temporary list containing real owner-hand card objects, then issues `ChooseCardsPrompt` with `min:2,max:2`. This temporary list explains why the original natural-canary observer called the source zone `unclassified`. The continuation uses `selected || []`, aborts the effect only when the resulting selection is **empty**, and otherwise moves the selected objects from owner hand to discard and proceeds to choose opposing Pokémon/Energy.

The pinned Store's `reducePrompt` does not independently enforce `prompt.validate` before accepting the `ResolvePromptAction`. In the prepared test, submitting one real hand card satisfies the reducer's post-selection nonempty check even though it violates the two-card paper condition. Payment attribution in natural games must follow physical source-hand/discard and opponent Energy zones; the original natural native canary archived names/counts, without full object custody after payment.

## Aichi field exposure and qualification

All **eight** authenticated original lists containing Plumeria use **BUS 120**, for **20 physical copies** total:

| Original rank | Count |
| ---: | ---: |
| 2 | 1 |
| 3 | 4 |
| 6 | 4 |
| 7 | 1 |
| 9 | 1 |
| 16 | 1 |
| 24 | 4 |
| 29 | 4 |

These are exposure counts, not proven exploit frequencies. The actual frozen four-arm rank6 canary played one natural Plumeria root with two named payment selections, not an observed single-card exploit. Its payment physical custody remains unverified. A hypothetical illegal one-card outcome must be rejected by any competitive game classifier, but this conditional fixture does not retroactively invalidate those specific two-card receipts.

A reversible default-off paper-payment guard has been added at [agent42-plumeria-paper-payment-guard.cjs](../../simulation/twinleaf/agent42-plumeria-paper-payment-guard.cjs), with a [both-seat positive/negative native test](../../tests/agent42-plumeria-paper-payment-guard.native.test.cjs). These are **not selected into any frozen bilateral release**. The compiled guarded positive/negative payment proof has now passed, as documented below. A future profile needs actual selected hook hashes, original owner-payment state transitions, and a naturally encountered full opponent response.

**Global status:** 29/32 authenticated original Top32 printed 60s; exact ranks 23, 25, 28 missing; zero competitively qualified paper games; no demonstrated 99.5% single-deck win rate.

## Native paper-guard positive/negative proof and adversarial physical identities

**Guarded CI 41482396076** ([all native job receipts](https://github.com/FlareZ123/experiment-01/actions/runs/41482396076)) completed **SUCCESS** at checkout `96a65294d5622dea3b0b80ea76d4e005ae9b8b69`. The six `AGENT42_PLUMERIA_GUARD` rows show each source seat and card count:

- **0/1**: one source-stamped native Plumeria payment prompt observed, `PAPER_PLUMERIA_INVALID_TWO_CARD_PAYMENT` raised before the original Store resumed, no payment moved, opposing Energy remains Active, and the original payment prompt remains pending.
- **2**: one prompt observed, accepted in each seat, two original owner-hand objects move into source discard, opposing Energy moves into its owner's discard, no pending prompts.

The earlier [CI 41481866825](https://github.com/FlareZ123/experiment-01/actions/runs/41481866825) was **red because the experimental fixture erroneously retried its still-pending rejected cost as if it were a later Energy prompt**. The follow-up separated these prompt stages without changing the guard; passing output was confirmed in the full compiled CI logs. Neither the failure nor the correction alters the unguarded six-case proof.

A further independent **compiled green CI 41483064629** ([full job](https://github.com/FlareZ123/experiment-01/actions/runs/41483064629)) at checkout `4f9e879fa9b00af923796af762e68f43b7414722` expanded the same fixture to two deliberately invalid two-element payment replies in both seats:

| Invalid reply type | Native `prompt.validate` | Unguarded physical owner cards paid | Unguarded opponent Energy discarded? | Default-off guard result |
| --- | --- | --- | --- | --- |
| Same exact physical owner card repeated twice | **true** | **1** | **Yes** | Rejected, 0 paid, no Energy removed |
| One real owner card plus one different real card from opponent hand | false | **1** | **Yes** | Rejected, 0 paid, no Energy removed |

Both results were identical for owner physical seat 0 and 1. The foreign reference remains in the opponent's actual hand; the repeated reference is one physical object. Both native prompt continuations reached and accepted actual opponent target/Energy decisions in the unguarded Store. The paper guard checks owner hand, offered physical list and exact object uniqueness, so it rejects both before any native payment transaction.

**Important distinct general defect:** The pinned native `ChooseCardsPrompt.validate` can accept a result array containing one *identical card object twice*, because it checks result length and individual membership without requiring distinct physical object references. This is independently demonstrated here by `paymentValidatorAccepted:true` for the repeated-object reply. The generic research-side [Agent39 physical uniqueness guard](../../simulation/twinleaf/agent39-paper-distinct-selection.cjs) already rejects duplicate and foreign card replies when selected; do not misrepresent this as a new missing generic remedy. The separate **one-card insufficient-count** Plumeria flaw is what the card-specific new guard adds. Existing guard coverage and whether a wrapper is selected in the actual full game must be audited independently.

The entire expanded native reproduction covers 10 unguarded and 10 paper-guarded physical-seat/payment cases. It remains a **prepared-state simulator test**, with no original randomized game, no whole-match paper payment proof, no realistic opponent decision qualification and no win-rate inference.
