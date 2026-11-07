# Mimikyu GRI Copycat incorrectly rejects a non-GX Apex Dragon in pinned Twinleaf

**Agent 46 | 7 November 2026 | paper Expanded rules-fidelity counterexample.**

## Finding

The printed **Mimikyu GRI 58 / sm2-58** attack **Copycat** permits copying the attack an opposing Pokémon used last turn so long as it **was not a GX attack**. **Regidrago VSTAR SIT 136 / swsh12-136** has the non-GX **Apex Dragon** attack. The pinned Twinleaf implementation nevertheless **returns without copying it**, because its shared copy-last-attack helper imposes an additional `copycatAttack === true` exclusion. This excludes Apex Dragon even though `gxAttack !== true`. The omitted nested choice matters to the published Aichi 2026 champion's Mimikyu + Dragon Dialga-GX counterpackage.

This finding has **two independently constructed native Store reproductions per physical seat**: a staged last-attack record with a non-GX attack positive control, and a *genuine immediate previous Regidrago Apex Dragon attack* that leaves the printed Apex metadata in real Store history before Mimikyu's next turn. Both demonstrated the same omission. **Zero competitively qualified games.**

## Card text and rules basis

- Mimikyu GRI 58 Copycat: `If your opponent's Pokémon used an attack that isn't a GX attack during their last turn, use it as this attack.`
- Regidrago VSTAR SIT 136 Apex Dragon: `Choose an attack from a Dragon Pokémon in your discard pile and use it as this attack.`
- Dialga-GX UPR 100 is a Dragon Pokémon with `Timeless-GX`, the source of the additional-turn counterline. **Dialga-GX FLI 82 is Metal-type**, and must not be substituted for the Dragon attack source by name alone.
- The supplied `advanced-players-rulebook.md`, section **II.C-18, Use it as this attack**, says that the chosen attack's damage and effects are applied even without the chosen attack's Energy cost, unless specified otherwise. The source additionally distinguishes attack names from copied effects, as in its Zoroark Foul Play example. No generic `copycatAttack` prohibition is stated in Copycat's printed condition.
- A contemporaneous public 2026 Aichi review expressly discusses Shadow Rider's **Mimikyu + Dialga-GX** strategy and Regidrago counterplay: https://dowsingmachine.com/en/pages/a-review-of-cl-aichi-results . This is supporting strategic context, separate from the rules and native test evidence.

## Exact pinned implementation conflict

At Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

1. `ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/mimikyu.ts` invokes `COPY_OPPONENTS_LAST_ATTACK` on its second attack, Copycat.
2. `ptcg-server/src/game/store/prefabs/attack-effects.ts` implements `copyOpponentsLastAttackGenerator`. It explicitly exits if `lastAttack.copycatAttack === true || lastAttack.gxAttack === true`. This is the extra exclusion absent from Mimikyu's text.
3. `ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/regidrago-vstar.ts` defines `Apex Dragon` with `copycatAttack: true`, while leaving `gxAttack` false.
4. `ptcg-server/src/game/store/reducers/player-turn-reducer.ts` records `state.playerLastAttack[player.id] = {attack, sourceCard: pokemonCard}` following an announced attack. The native consecutive-turn probe independently establishes the actual last attack remains **Apex Dragon**, with `copycatAttack:true` and `gxAttack:false`.

This is specifically a **native rules-fidelity negative witness**. It is not a claim that an arbitrary non-GX copied attack is always legal to recurse through without other card-specific restrictions, and no general patch was accepted merely from source reading.

## Compiled two-seat evidence: controlled prior-attack state

Committed `simulation/twinleaf/agent46-mimikyu-apex-copycat-native.cjs` at `496c5536`. Compiled manual workflow [42322332100](https://github.com/FlareZ123/experiment-01/actions/runs/42322332100) **SUCCESS**.

The actual pinned Store contains Mimikyu GRI Active with two Psychic Energy, a physical opposing Pokémon, real deck and Prize zones, and **Dragon Dialga-GX UPR in Mimikyu owner's discard**. Prior-turn attack metadata is deliberately injected to isolate the exact predicate.

| Owner seat | Opponent's recorded previous attack | Non-GX | Marked copycat | Native Mimikyu result |
| --- | --- | --- | --- | --- |
| 0 | Venonat MEW Gnaw (positive control) | Yes | No | **10 damage dealt** |
| 0 | Regidrago VSTAR SIT Apex Dragon | Yes | Yes | **0 damage**, no nested attack prompt |
| 1 | Venonat MEW Gnaw (positive control) | Yes | No | **10 damage dealt** |
| 1 | Regidrago VSTAR SIT Apex Dragon | Yes | Yes | **0 damage**, no nested attack prompt |

Both Apex branches completed with no errors, zero outstanding native prompts and no GX use. The contrast isolates the extra `copycatAttack` guard from energy readiness or failed original Copycat execution.

## Compiled two-seat evidence: actual preceding Apex Dragon Store attack

Committed `simulation/twinleaf/agent46-mimikyu-apex-consecutive-native.cjs` at `0270400b`, actual workflow [42322746523](https://github.com/FlareZ123/experiment-01/actions/runs/42322746523), **SUCCESS**.

The second fixture *does not inject the last-attack record*. It starts with a staged already evolved/funded Regidrago VSTAR, the attacking side's Dragon Dialga-GX UPR in its discard, and opposing Active Mimikyu GRI with two Psychic Energy. The game engine receives a real `AttackAction` for Apex Dragon, opens a real `ChooseAttackPrompt`, and accepts the choice of `Overclock`. It resolves its remaining Wait prompts and passes the turn from global turn 2 to turn 3. At every observed post-prompt native checkpoint the actual `playerLastAttack` record is:

```json
{"attack":"Apex Dragon","source":"Regidrago VSTAR SIT","copycatAttack":true,"gxAttack":false}
```

Mimikyu's actual `AttackAction('Copycat')` on the immediately following turn then completes after Wait prompts without any `ChooseAttackPrompt`, without damage, and without GX use, on **both source seat orientations**. The game state advances to global turn 4. This confirms the blocked condition can arise from a real preceding native attack. The fixture does not claim that Regidrago's copied Overclock effect was independently audited; the evidence requirement here is the actual Apex declaration, native choice, next-turn handoff and Mimikyu's rejection.

## Reproducibility and limitations

- Engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; research code immutable CI runs above; no vendor modifications. Runs are deterministic staged native Store witnesses in both source-owner seats.
- Staging bypasses normal deck shuffle, evolutionary timing, opening board search and opponent policy. The consecutive-turn test genuinely dispatches two printed attacks but begins with funded boards and a selected Dragon discard payload.
- The direct-prior test injects metadata; the consecutive-turn test directly verifies it without injection. The two constructions corroborate the specific extra predicate.
- The printed nested strategic line `Mimikyu Copycat -> Apex Dragon -> Dialga-GX Timeless-GX` is plausible from card text, historical play analysis and rulebook II.C-18. **This report does not yet certify it through fully settled native nested delegation**, nor does it measure how often it can be assembled.
- An independent optional research-owned hook and nested-progression regression are being tested separately. Do not promote an experimental bypass to general paper legality without checking native source prompt selection, attack/copy metadata, GX usage, extra turn and return to original board.

## Implication for the one-deck 99.5% objective

The authenticated Aichi rank-1 winner contains **one Mimikyu GRI and one Dialga-GX**. The missing response to Regidrago Apex can materially change control/response choices in the winner's critical Regidrago matchups. A real simulator that declines a paper-legal counter is unable to evaluate that counter's benefit. Therefore report any current win-rate or terminal results involving Mimikyu versus Apex as *potentially biased by unmodeled defense*, with the exact source and future correction conditions recorded.

This affects *policy and rules-fidelity admission*, not the 29/32 exact-field inventory denominator. **No source or challenger deck is promoted**, no competitive game becomes qualified, and no 99.5% claim is made.

**Agent 46**
