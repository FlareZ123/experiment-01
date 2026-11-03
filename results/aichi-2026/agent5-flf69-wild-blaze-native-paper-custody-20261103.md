# Agent 5: FLF69 Wild Blaze exact-print native custody and copied-donor fidelity (3 November 2026)

## Question and scope

The immutable 60-card structural ADP/Thorton/Regidrago candidate v2 contains exactly one `M Charizard-EX` (`xy2-69`, Flashfire 69) as a potential Dragon attack donor for Regidrago VSTAR's `Apex Dragon`. Agent50's rank26 pilot uncovered **two native classes** with the same original paper printing ID. Choosing an exact ID by metadata alone could silently change which player's deck is discarded on an attack.

This is a **native mechanics investigation**, not a natural 60-card matchup, competitive evidence or a candidate ranking. The complete Aichi original-source roster still has 29/32 authenticated printed sixties, no competitively qualified games and no demonstrated 99.5% result.

## Pinned printings and independent source review

The bundled English print `resources/cards/en/xy2.json`, ID `xy2-69`, describes a Dragon-type 230-HP `M Charizard-EX` with `Wild Blaze`: damage 300, printed cost Fire/Fire/Darkness/Colorless/Colorless, **discard the top five cards of your deck**. This requirement applies to the owner of the attack, not to the opponent.

Pinned upstream Twinleaf at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` registers two exact FLF #69 instances:

| Class and upstream source | Native attack reducer | Mega Evolution turn-ending rule |
| --- | --- | --- |
| `M Charizard EX FLF`, `ptcg-server/src/sets/07-x-and-y/set-flashfire/m-charizard-ex.ts` (Git blob `9e536ebea54c98f76dbf1f449171947854420c72`) | **Incorrect:** `MOVE_CARDS(... opponent.deck, opponent.discard, count:5)` | **Present**, uses `MEGA_EVOLUTION_END_TURN` |
| `M Charizard-EX FLF 69`, `ptcg-server/src/sets/07-x-and-y/set-flashfire/m-charizard-ex-2.ts` (Git blob `0f93929d6263e25f32f11055e237c31bd92531d7`) | **Correct owner:** `DISCARD_TOP_X_CARDS_FROM_YOUR_DECK(... effect.player,5,...)` | **Absent** from this reducer |

Both native classes match printed card name, set, number, HP, type, attack base damage, cost, weakness and retreat in Agent50's earlier native class census. Thus metadata equivalence is insufficient for card-effect fidelity. The original complete native class is more suitable as a patch base because it retains the Mega Evolution handling and Spirit Link exemption.

**Important shared-resolver risk:** `simulation/twinleaf/resolve-field.cjs` currently explicitly prefers `M Charizard EX FLF` as `verified-flf69-canonical-native-implementation` after checking only metadata and the *text* string. That is an incorrect endorsement of unpatched attack semantics. The resolver's unchanged selection remains safe only if subsequent native execution installs a verified own-deck effect correction. This warning applies to future evaluations of the specific ADP/Regidrago candidate. No initial original Aichi Top32 full source 60 currently contains a Charizard-named card.

## Actual native direct attack experiment

Regression: `tests/agent5-flf69-wild-blaze-native.test.cjs`, added to existing manually dispatched `.github/workflows/agent50-rank26-unlocked-fifth-candidate.yml`. This constructs the **real pinned native Store**, with each physical seat as attacker, a genuine FLF69 Mega Active, 4 Fire and 1 Darkness attached, original 10-card owner and opponent decks, six Prize slots on each side, and a 300+ HP opposing Shadow Rider Calyrex VMAX. Dispatches an actual `AttackAction('Wild Blaze')` and resolves genuine Wait prompts; asserts dealt damage, final deck/discard cards, and player turn. The selected target survives the 300 damage, avoiding confounding Knock Out/Prize prompts.

The native attack advances to the opponent's next turn, which itself draws one card. Therefore a paper-correct five-card *owner discard* results in owner deck **10→5**, opponent deck **10→9**, owner discard **0→5**, and opponent discard 0. An incorrect five-card *opponent discard* results in owner deck **10→10**, opponent deck **10→4** (five discarded, one drawn), owner discard 0, and opponent discard **0→5**. All damage is 300.

The baseline four native direct attacks (two implementations × two seats) passed the corrected assertions in [compiled manual CI run 41573987297](https://github.com/FlareZ123/experiment-01/actions/runs/41573987297), source commit `83767cbf36cee27e3178f16f49f6b42f6588d3a7`. Earlier [run 41573722285](https://github.com/FlareZ123/experiment-01/actions/runs/41573722285) failed due to this *test's* omitted next-turn draw, not the underlying five-card printed-effect contrast; the regression was fixed without modifying engine code or an evaluated deck.

## Research-owned correction

`simulation/twinleaf/flf69-wild-blaze-paper-hook.cjs` installs a **temporary, opt-in, reversible** `reduceEffect` wrapper on the pinned native `M Charizard EX FLF` class prototype. Only when the genuine native `WAS_ATTACK_USED(effect,0,this)` predicate holds, it invokes the already vendor-supplied `DISCARD_TOP_X_CARDS_FROM_YOUR_DECK(..., effect.player, 5, this, effect)`; all other events delegate to the preserved original reducer, including its Mega Evolution end-of-turn rule. Tests restore the exact old prototype function. No vendor/submodule files are changed, and the normal simulation policy remains unaffected unless the hook is expressly installed.

Native two-seat positive tests of the patched direct attack passed in [compiled manual CI 41574195113](https://github.com/FlareZ123/experiment-01/actions/runs/41574195113) at source head `9c7791178791b4330b9d1209e0d83d9f55b590cc` (step-level evidence verified).

### Actual copied Apex Dragon attack, decisive native comparison

In [completed compiled manual CI 41574684521](https://github.com/FlareZ123/experiment-01/actions/runs/41574684521) at exact source head `319a60b0bed64a8608266ba85b38496821064e3f`, **all ten FLF69 native tests passed** (4 direct unpatched + 2 patched direct + 4 copied donor), independently verified from the successful job log. The workflow used `flf69_native_only:true` to skip the unrelated expensive rank26 24-arm rereplay.

For a genuine staged `Apex Dragon` declared by `Regidrago VSTAR SIT` with Grass/Grass/Fire attached, one owner-discard `M Charizard EX FLF` is eligible in the actual `ChooseAttackPrompt`; resolving its `Wild Blaze` makes the opposing Shadow Rider VMAX take **300 native damage**. The four copied-donor tests (two physical seats × native hook off/on) reproduced the original's wrong-side mill and the opt-in correction:

| Copied-donor effect | Owner deck | Opponent deck | Owner discard | Opponent discard | Damage | Hook hit |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Unpatched, either seat | 10 | 4 | 1 donor | 5 | 300 | 0 |
| Paper-corrected, either seat | 5 | 9 | 6 = donor + five milled | 0 | 300 | 1 |

The opponent deck includes the one automatic card draw on its next turn. This is a real vendor `AttackAction` → `ChooseAttackPrompt` → `ResolvePromptAction` → effect transaction, followed by normal turn progression. The hook is demonstrated to affect **copied** attack delegation correctly as well as direct Mega attacking. All 10 observed cases pass, **zero competitively qualified games**.

## Native Mega Evolution turn-rule comparison

The separate **real native `PlayCardAction`** six-arm test was added after the copied-donor proof: a prior-turn `Charizard-EX FLF` starts in the Active Spot, the owner plays the FLF69 Mega from hand onto that exact evolution target during native global turn 4, and the Store resolves the action. Both attacker seats are tested for the original first implementation, the generated duplicate, and the original while the paper Wild Blaze hook is installed.

**[Compiled manual CI run 41575194665](https://github.com/FlareZ123/experiment-01/actions/runs/41575194665), source head `a723c02e427bfa0d06862f9439435b3018ab578b`: all 16 native tests passed, including six real Mega evolution cases.** The native log confirms:

| FLF69 implementation | Seat 0 turn after evolution | Seat 1 turn after evolution | Printed Mega no-Spirit-Link rule |
| --- | ---: | ---: | --- |
| Original `M Charizard EX FLF` | 5 | 5 | Preserved |
| Generated duplicate `M Charizard-EX FLF 69` | 4 | 4 | **Violated** |
| Original + Wild Blaze paper hook | 5 | 5 | Preserved |

This directly confirms the previously source-reviewed omission in the duplicate: it permits ordinary Mega Evolution without ending the turn. Consequently **neither native class is paper-faithful without a correction**: the original requires an own-deck Wild Blaze repair; the duplicate requires a Mega evolution rule repair. The tested original-class Wild Blaze hook repairs its known attack defect while preserving real native Mega play on both seats. These staged Store cases exclude natural deck setup and do not test Spirit Link exceptions.

## Limits and next acceptance gate

The initial test board is physically staged rather than reached through a valid opening hand, natural evolution, discard engines, actual opponent decisions, or a 25-minute paper clock. Printed damage/owner-deck-custody validation is local to this effect. It does not certify other card effects, an end-to-end `Apex Dragon` line, deck legality, strength or win rate. If copying succeeds under the corrected hook, the candidate evaluator must enable the hook in its **predeclared symmetric policy** and verify both owner cost and opponent continuation on fully original source sixties; leave unpatched comparisons unqualified and do not change the immutable candidate cardlist.

Research reproducibility: fixed supplied card-ID `xy2-69`, exact upstream revision and two source blobs above, JavaScript regression and default-off hook at listed paths, original manual CI run IDs, both physical seats, expected 300 damage/5-card transitions with automatic one-card next-turn draw, no claim of competitive games.
