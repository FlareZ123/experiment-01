# Agent 43: rank-31 Roxie/Koffing access and actual source-dealt policy exposure

**18 October 2026.** Evidence classes: exact finite-population mathematics, two bounded original-source generic-bot games, and a separately proven staged pinned-Store Ability contract. **Neither a competitive win rate nor a complete human-policy qualification.**

## Published exact 60 and direct probability

The [Aichi rank-31 published source list](full-decklists.json) contains 15 Basic Pokémon, including three Koffing CEC, and four Roxie CEC. Its 60 cards were checked by [the source-counted exact enumerator](../../scripts/rank31-roxie-pair.cjs). Define the narrow event as both at least one Koffing and at least one Roxie directly in the cards seen by ordinary draws, conditional on the first seven containing a Basic. All six random Prize cards are integrated out, with no privileged information about them.

| No. of ordinary post-opening draws | Exact conditional probability | Decimal |
| ---: | --- | ---: |
| 1 (eight directly seen) | `168070/1044153` | **16.0963000633%** |
| 2 (nine directly seen) | `39038711/200709410` | **19.4503640861%** |

The [single runnable regression file](../../tests/rank31-roxie-pair.test.cjs) checks the authentic 60-card counts, BigInt combinations and those reduced fractions, with a separate exhaustive 8-card physical-permutation oracle for both one- and two-draw cases. The manual [Aichi statistical CI run 39085171939](https://github.com/FlareZ123/experiment-01/actions/runs/39085171939) **passed** the added four-test step.

These probabilities describe resource *visibility*. They exclude mulligan bonus cards, search, fog/receiver connectors, prize rescue, Supporter-turn restrictions, playable actions and survival. They provide no percentage of games in which Blow-Away Bomb can be used or affects the result.

## Actual ranked source-dealt Roxie decisions

The source-dealt [observer](../../simulation/twinleaf/agent43-roxie-source-exposure.cjs) reuses the published rank-1 Shadow Rider reference and rank-31 Dusknoir/Chimecho 60, v3 physical-seat seeds from the existing rank31 source-visibility fixture and the pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` Twinleaf submodule. It runs ordinary `runMatch` generic bots for at most 240 actions, with an opt-in **reversible type correction** for the malformed upstream Roxie discard effect. The test preserves ordered deck hashes and captures the actual pre-dispatch `ChooseCardsPrompt` selections.

[Manual compiled CI 39084707814](https://github.com/FlareZ123/experiment-01/actions/runs/39084707814) passed on head `731c2a58eccc387c6bcad00b5e70f9bca761fcbf`. The output artifact is `agent43-evolution-contrast` (ID `12120496602`; ZIP digest `sha256:2f61822cfba5d72624d2dc3246755035971b71862863be73f9ad5458ed4da96e`), including the bounded source JSON.

| Source slot | Rank-31 physical seat | Fixed seed | Actual Roxie plays | Roxie-turn Koffing hand-discard choices | Engine turns |
| --- | ---: | ---: | ---: | ---: | ---: |
| A (reference in seat 0) | 1 | `1098062414` | 4 | **1** | 37 |
| B (reference in seat 1) | 0 | `1295587841` | 4 | **0** | 38 |

The rank-31 source-A game exposes **one actual Koffing discard under Roxie**: the third Roxie was played at action 83, turn 7, and the following `CHOOSE_CARD_TO_DISCARD` prompt selected `Koffing CEC` at action 84. Both source games hit the **240-action cap** and were unfinished. The archived v1 count of two matched all Koffing selections from the hand and erroneously included the initial **`CHOOSE_STARTING_POKEMONS`** prompt at action 6. The tightened source observer now requires a genuine discard prompt; this correction was made **after** compiled CI 39084707814 and is independently supported by inspection of that run's preserved action JSON. The original v1 source decision trace does **not** record actual generic `ConfirmPrompt` outcomes. Do not infer that a Koffing confirmation was offered or declined merely from the discard. Some effects could be suppressed and the trace has not checked the intermediate prompt inventory.

Separately, [the staged pinned Store test](../twinleaf/agent43-roxie-blowaway-store-repair.md) directly establishes that for an unblocked board, choosing false after Roxie/Koffing causes 0/0 damage to opponent Active/Bench while deliberately choosing true causes 10/10; the pinned generic `ConfirmPromptResolver` returns false. That establishes a **potential conditional bot-policy loss of spread damage**, pending live prompt evidence and actual opponent response.

## Qualification and next falsification

A new research-owned [passive confirmation observer](../../simulation/twinleaf/confirm-prompt-observer.cjs) was added to the rank31 source runner after CI 39084707814. It restores its patched bot method and forwards the exact original result. **This newer variant has not yet passed pinned CI or produced an observed source confirmation.** It must be executed and verified before claiming concrete declined Koffing prompts in natural games.

If there is an actual eligible confirmation, compare an isolated opt-in Koffing-only acceptance policy against a frozen identical source deal and realistic opposing responses; account for action sequence divergence, source card printing, Ability locks and exact Prize changes. Avoid globally accepting unrelated `ConfirmPrompt` requests and refrain from scoring a scripted branch as an independent win.

The benchmark remains at **29/32 exact source lists, zero independently policy-qualified games** and no demonstrated 99.5% win rate.
