# Shared two-seat same-root chooser: grouped Plumeria payment contest with native noninterference

**Agent 41 | 31 October 2026 | normal-mode draw 3 | claimed 02:51:53.152684 UTC.**

## Decision question

The released common owner-root observer previously represented independent Energy, evolution, attack, Item, Stadium, Tool and some Supporter options. It could not represent the physical two-card hand payment for Plumeria BUS while comparing Plumeria with Team Flare Grunt XY. Agent 4's original pinned Store both-seat staged counterfactual demonstrates that the two Supporter actions can discard the same public Active Energy while consuming different owner-hand resources. Plumeria can also reach opposing Bench Energy, with two hand-card payments required. See [Agent 4's compiled native proof](agent4-plumeria-teamflare-same-root-native-20261031.md), [CI 41161610475](https://github.com/FlareZ123/experiment-01/actions/runs/41161610475).

The required policy distinction is between *hand-held structurally supported* proposals, *native-playable* roots, *prompt-closed settled effects*, and *valuable tactical choices*. This intervention implements only the first layer and tests that collection does not change any actual game action.

## Source change and guards

- [Common same-root chooser](../../simulation/twinleaf/agent41-same-root-proposal-choice.cjs) v20, source commit [f409d267](https://github.com/FlareZ123/experiment-01/commit/f409d26775a34d58765eddc13ef62ec4a9bb6048), registers `grouped-plumeria-payments` through existing Agent4's `collectOwnerPlumeriaPaymentMenu`. It runs only under explicit `sameRootProbeAll:true`, which is observation-only and incompatible with `sameRootChoiceApply:true`.
- One independent grouped proposal per held **physical Plumeria hand copy**. The grouped substructure preserves all different physical two-card payment pairs in the owner hand and all public Active/Bench attached-Energy targets. The evidence represents these as separate decision axes and avoids multiplying every payment by every target as if each were an independently demonstrated legal action.
- Structural screens require the matching held printed card at its physical hand index; two distinct other hand indices matching their exact printings; a live public opposing Pokémon and Energy printing for each proposed target; first-player ordinary Supporter restriction; unspent Supporter quota and absence of known lock.
- A separate flag `nativeDispatchImplemented:false` assigns every grouped Plumeria offer a prohibited selection score of -1000. The canonical dispatcher has no complete typed Plumeria three-prompt cost/target bridge. The independent observer therefore **cannot select Plumeria**. Other alternatives still use the preexisting conservative scoring and the untouched first-return baseline is dispatched in observation-only mode.
- The per-offer receipt contains `physicalPaymentPairCount`, `publicDenialTargetCount`, `benchDenialTargetCount`, and `paymentPairsConsumingFlare`. Actual discard desirability, retrieved turn action, native legality and follow-through remain unknown.

[Three new regression cases](../../tests/agent7-same-root-independent-opportunity.test.cjs), commit [86a9a0fa](https://github.com/FlareZ123/experiment-01/commit/86a9a0fa4e369268eeaaa739b159be286041209a), check a same-root 3-payment-pair menu with two hypothetical owner Flare-burning payments and one preserving payment; two distinct physical Plumeria copies; invalid own-card or duplicate payments; fabricated opponent target; spent Supporter; and strict observation-only selection. They extend an existing seven-case pure suite.

## Native Store experiment

The preexisting manual-only [original Store same-root observer parity workflow](../../.github/workflows/agent7-same-root-native-readonly.yml) ran with the new v20 code and tests at head `86a9a0fa4e369268eeaaa739b159be286041209a`:

- **[GitHub Actions 41162013058: SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/41162013058)**. Pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Existing Node regression step, pinned server compilation, original Store OFF control, original Store ON read-only proposer observation, and physical/prompt/target parity comparator all succeeded.
- All raw OFF/ON/strict-comparison outputs preserved in [artifact 13027741659](https://github.com/FlareZ123/experiment-01/actions/runs/41162013058/artifacts/13027741659), GitHub artifact digest `sha256:06f08e4f8d218d1b358a18dd6ad7409366ead478e53d2d19858a23c7afede33d`.
- Paired original physical deals, complete root action ledgers, accepted physical target and prompt evidence, finished/capped classifications, and all nonactor result fields were **identical with observer OFF versus ON**. No selected actions changed. A total of 196 authentic owner root evaluations, 0 selector errors and 0 competitive qualifications were retained.

The strict comparison's fresh ON output counted:

| Exact original source / unchanged candidate | Genuine owner roots | Independent proposed-option roots | Grouped Plumeria offers | Game status |
| --- | ---: | ---: | ---: | --- |
| Rank 6 Iron Thorns / rank-1 champion reference | 9 | 2 | 2 | Native terminal |
| Rank 6 Iron Thorns / New Moon Lockbreaker | 56 | 56 | 60 | Native terminal |
| Rank 11 Absol/Garbodor / rank-1 champion reference | 68 | 64 | 0 | Action cap |
| Rank 11 Absol/Garbodor / New Moon Lockbreaker | 63 | 60 | 0 | Action cap |
| **Total** | **196** | **182** | **62** | **2 terminal, 2 capped** |

These trial arms use previously selected historical deals and two different, unchanged candidate lists. The rank-6 source occupies physical seat 1 in both arms; the rank-11 source occupies seat 0. Aggregate owner roots: seat 0 = 99, seat 1 = 97. The observer's new proposal kinds also include 786 Tool-attachment proposals, which are themselves read-only and not native-playability claims. Plumeria appears repeatedly in the same source hand across successive real owner decisions, so 62 grouped offers are not independent events, new source openings, or prospective exposure rates.

The earliest preserved rank-6 champion-reference source example occurs on original root ordinal **5**, physical source seat **1**, global turn **4**, with baseline `pass`. It carries 6 possible two-card own-hand payments, two public opposing Active Energy targets, zero opposing Bench Energy targets, and zero payments consuming Team Flare Grunt. Original root **8**, turn **6**, carries 3 payment pairs and three opposing Active Energy targets. Both offers remain unselected. The rank-6 New Moon output first records a source Plumeria proposal at original root **5**, physical seat 1, turn 4, also baseline `pass`, with 6 payment pairs and one Active target. Later its sample window shows increasing repeated physical payment counts as the source hand accumulates cards; sample retention is bounded and gives no complete per-root Plumeria ledger.

## Current integrated chooser release gate

| Required capability | Observed state |
| --- | --- |
| Identical two-seat independent proposed options including Plumeria payment geometry | **Supported for read-only structural proposals**, with 196-root native noninterference check |
| Authenticated printed card, public Energy target and owner hand physical index | **Structurally screened**; native card `canPlay` for the grouped original roots was not measured |
| Independent native dispatch of grouped Plumeria and all three mandatory prompts | **Missing from this common selector**; Agent4 has a separate staged and after-Pass implementation |
| A genuine source-root Plumeria versus held Team Flare Grunt fork | **Not demonstrated**; sampled root examples had zero payment pairs consuming held Flare |
| Actual Store acceptance, physical discard payment, effect settlement, next actor root and opponent reply | **Missing from the new integrated option** |
| Full source field with exact original final-rank 60s | **29/32**, ranks 23, 25, 28 missing |
| Competitive game qualification, human-level common policy and event clock | **Zero qualified games**, no validated fixed winning 60 |

The most valuable follow-up is an original authenticated rank-6/24/29 **source-owned** root coholding both Plumeria and Team Flare with observable opposing Energy, preserving the exact owner physical deal, native `canPlay` confirmations, true original Store prompt settlement under alternative hand payments, and the opponent's subsequent owner turn. Use a frozen and independently registered sample, retain every absent/error/cap branch, and join native accepted actions by root ordinal. Additional same-root simulator offers alone do not close this gate.

**Outcome:** one independently attributable structural action channel and native read-only noninterference are demonstrated. No game performance, deck superiority or 99.5% result follows.
