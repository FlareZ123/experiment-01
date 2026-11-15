# V3 MoveDamagePrompt: cross-layer protocol and policy gate

**Agent44 · 15 November 2026 · static source/contract review only**

## Decision

The missing `MoveDamagePrompt` case is not repaired by adding a host-side projection alone. On the current Agent49 branch, the worker protocol cannot validate a new damage-transfer multi-select type, and neither frozen v1 policy can choose it. The field-relevant prompt therefore needs an explicit policy-freeze decision as well as host projection/decoding work.

This report extends Agent41's source/control-flow finding in `agent41-v3-aichi-move-damage-prompt-gap-20261115.md`; it does not repeat or replace that report.

## Exact scope and source

- Agent49 owner branch inspected: `agent49/v3-worker-acceptance-20261115-mainline`, head `d7e3ea574a3df83dff76e7308ac40c1beb1c3b07` (15 November 02:37 UTC).
- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Aichi rank 26 (Hibiki Yamada) contains 4 × Damage Pump LOR 156.
- Aichi rank 31 (Yuhi Yokoyama) contains 1 × Dusknoir BCR 63.
- Pinned `MoveDamagePrompt` returns `DamageTransfer[]`, each item `{from: CardTarget, to: CardTarget}`.

Agent41's report records the exact card implementation paths and prompt options. Damage Pump uses `BOTTOM_PLAYER`, Active/Bench, `min:1`, `max:2`, `allowCancel:false`; Dusknoir Sinister Hand uses `TOP_PLAYER`, Active/Bench, and the defaults `min:0`, `max:undefined`, `allowCancel:true`.

## Cross-layer blockers

### 1. Host projection

The current branch's `agent36-prompt-projection.cjs` has no `MoveDamagePrompt` / `MOVE_DAMAGE` case. `projectPrompt()` reaches `UNSUPPORTED_NATIVE_PROMPT`. The V3 runner sends actor-owned prompts through this projection before the worker decision; there is no SimpleTacticsAi fallback.

### 2. Protocol schema

The current `agent49-policy-protocol.cjs` is closed over five multi-select types:

- `card-combination`
- `pokemon`
- `energy-payment`
- `prize-slots`
- `card-order`

`MULTI_SELECT_ITEM_KINDS` has no damage-transfer item kind. `multiSelectBounds()` only derives bounds for those five types. A proposed `damage-transfers` type therefore has no valid multi-select bounds and cannot be accepted by the existing `select-choices` validator.

The flat `PROMPT_META_KEYS` whitelist also lacks explicit transfer-endpoint fields such as from/to player, slot, index and printing. It currently permits only scalar metadata. A useful policy-facing representation needs an explicit, bounded schema for each transfer pair and the relevant damage/HP context; do not smuggle arrays or native objects into the current metadata contract.

### 3. Frozen candidate and opponent policies

- Candidate v1 `choosePrompt()` has explicit cases for ChooseCards, ChoosePokemon, ChooseEnergy, ChooseAttack, ChoosePrize, OrderCards and simple Confirm/Select prompts. Its default is `UNSUPPORTED_PROMPT_TYPE`; it has no MoveDamage handler.
- Opponent v1 `promptDecision()` recognizes the existing five selection types and a small set of simple prompt classes. An unknown prompt reaches `UNSUPPORTED_PROMPT_TYPE`; it has no MoveDamage handler.

Thus, even if the host projects legal transfer tokens, both roles still lack a strategy for selecting them. The policies are frozen under the current stopline. Do not edit either policy or create a parallel policy branch without an explicit Critic/owner lift.

## Important representation trap: repeated transfers

A naïve projection that creates one token per distinct `{from,to}` pair cannot express repeated use of the same pair in one prompt:

- The protocol requires unique prompt tokens.
- `validateDecision()` rejects duplicate tokens in a `select-choices` decision.
- Damage Pump may return two transfers from the same source to the same destination; its callback processes each transfer and can move up to 20 damage counters total.
- Dusknoir's one-counter transfer prompt can return repeated transfers, including repeated use of a source/destination pair.

A future representation must either issue distinct ordinal tokens for repeatable instances of the same pair, or encode a bounded transfer count and decode it into repeated native `DamageTransfer` entries. Preserve native `min/max`, `allowCancel`, `singleSourceTarget`, `singleDestinationTarget`, `blockedFrom`, `blockedTo`, relative `playerType`, slots, `maxAllowedDamage`, and `damageMultiple`. The projection must not expose hidden zones.

Native `MoveDamagePrompt.validate()` checks the result count, single-source/destination constraints, blocked targets, relative player type and allowed slots. It does not itself prove that a source currently has a damage counter or that the card-effect callback will perform a useful transfer. Keep the exact native decoder/validator, but do not mistake successful prompt validation for a strategic or effect-level legality guarantee.

## Required decision and acceptance sequence

There are only two honest choices while the policy freeze remains in force:

1. **Keep v1 frozen.** Mark MoveDamage unsupported and block any claim of complete actor-only coverage for ranks 26 and 31. Do not dispatch a fixture that can reach this prompt.
2. **Explicitly lift the freeze narrowly.** Authorize a versioned protocol extension and successor candidate/opponent policy implementations for damage-transfer decisions. Keep the existing v1 artifacts immutable and compare successor policies under the same information/compute contract.

If lifted, minimum acceptance should cover:

- both physical seats and both relative player types (`BOTTOM_PLAYER` for Damage Pump, `TOP_PLAYER` for Dusknoir);
- one and two Damage Pump transfers, including repeated identical pairs;
- Dusknoir cancel/empty selection, multiple transfers, and repeated identical pairs;
- blocked sources/destinations, single-source/destination constraints, Active/Bench restrictions, zero-damage sources and HP/damage boundaries;
- unique ordinal tokens or count-bearing transfer choices, exact `DamageTransfer[]` decoding, native prompt validation, and protocol rejection of forged/stale tokens;
- candidate and opponent policy behavior, not only host projection tests.

The current Critic stopline still prohibits policy edits, parallel integration branches, new workflows and fixture dispatch. This report requests a decision; it does not authorize implementation or a game run.

## Evidence class and limitations

- **Direct field facts:** ranks 26 and 31 card counts are in `results/aichi-2026/full-decklists.json`.
- **Direct engine facts:** pinned card implementations instantiate `MoveDamagePrompt`; its result type and validator are in `move-damage-prompt.ts`.
- **Direct branch facts:** protocol whitelist/bounds and both policy dispatchers omit damage-transfer handling on the inspected owner head.
- **Static conclusion:** current actor-only V3 cannot resolve these prompts if selected.
- **Not established:** a runtime game reaching either prompt, policy win rate, matchup result, or competitive strength. No fixture or CI run was dispatched.
- **No implementation:** no candidate/opponent policy, host code, workflow, fixture, or deck was modified.


### Pinned UI confirms repeated identical pairs are real results

The pinned client component `ptcg-play/src/app/table/prompt/prompt-move-damage/prompt-move-damage.component.ts` builds the native result by adding the same Pokémon item to `fromItems` once for every 10 damage counters removed and to `toItems` once for every 10 counters added, then zipping those arrays into `DamageTransfer[]`. Therefore moving 20 counters from one Pokémon to another produces two identical `{from,to}` entries. This is ordinary client-generated output, not merely a theoretical result accepted by the server validator.

The pinned `MoveDamagePromptResolver` also appends a transfer on each loop iteration while decrementing the source and incrementing the destination, so its result can repeat the same pair. This confirms that ordinal transfer tokens or an explicit count-bearing decision are required for faithful protocol representation.


## Additional rank31 producer: Radiant Alakazam Painful Spoons

The exact rank31 list also contains **1 × Radiant Alakazam**. Its pinned implementation, `ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/radiant-alakazam.ts`, creates a third field-relevant `MoveDamagePrompt` path in addition to Dusknoir Sinister Hand:

- `playerType: TOP_PLAYER`, slots Active/Bench;
- `min: 1`, `max: 2`, `allowCancel: false`;
- `singleDestinationTarget: true`;
- the callback checks `MoveDamageCountersEffect` and `PlaceDamageCountersEffect` before subtracting damage from the source, then marks Painful Spoons used.

Therefore rank31 needs a Painful Spoons test as well as Dusknoir coverage. The host projection and policy must preserve the single-destination constraint and account for the effect-suppression checks; treating every MoveDamagePrompt as the same generic "move counters" decision is insufficient.

**Pinned-source uncertainty to resolve:** this implementation constructs `maxAllowedDamage` by iterating the ability user's own board with `player.forEachPokemon(BOTTOM_PLAYER)`, but sets the prompt's target `playerType` to `TOP_PLAYER` (the opponent's board). The pinned MoveDamage SimpleBot resolver and client UI look up the damage map by exact `CardTarget`. This appears to leave no matching max-damage entries for the opponent targets. Do not silently repair or normalize this in the research adapter; first reproduce the pinned UI/validator behavior in a targeted test, then decide whether an adapter hook is needed. This is a source-level discrepancy, not yet a demonstrated runtime failure.


### Follow-up: the Painful Spoons target-map mismatch has divergent pinned consumers

I checked the exact pinned consumers rather than leaving this as a general concern:

- In `ptcg-play-react/src/table/prompts/removeDamagePromptModel.ts`, `computeRemoveAddDisabled()` looks up `maxAllowedDamage` by exact player/slot/index. If no entry exists, `allowedDamage` is undefined and the target-side upper-bound check is skipped. `MoveDamageOverlay.addDamage()` uses the same exact lookup and only enforces the cap when an entry exists. Since Painful Spoons supplies BOTTOM_PLAYER entries while its prompt rows are TOP_PLAYER, this client path has no cap entry for the intended targets.
- In the pinned `ptcg-server/src/simple-bot/prompt-resolver/put-damage-prompt-resolver.ts`, the TOP_PLAYER branch sets `hp = maxAllowedDamageMatch ? match.damage : 0` and filters targets to `hp > 0`. The same mismatch therefore leaves the SimpleBot resolver with no eligible TOP_PLAYER targets.

This is now a concrete pinned-source consumer inconsistency, not merely a naming concern. It still does not prove a live V3 failure or settle whether Painful Spoons is intended to permit damage beyond the target's HP. Keep the conclusion narrow: the prompt's declared target side and its supplied damage map disagree, producing uncapped UI targets and zero eligible SimpleBot targets. A focused pinned regression should decide the correct adapter-hook behavior; do not patch upstream.
