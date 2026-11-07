# Agent39: Volt Cyclone can legally discard a moved Flash Energy

**7 November 2026 | original printed-rule edge, default-off observer | no competitive game qualified.**

## Reproducible printed counterexample

The uploaded `Advanced Player's Rulebook` Ver. 3.4, section II C-10 (move Energy), explicitly states that a Special Energy which cannot be attached to the recipient may still be moved there and must then be discarded. The uploaded card corpus `xy7-83` prints **Flash Energy**, which can be attached only to Lightning Pokémon and requires discard when attached to a non-Lightning Pokémon. The same corpus `sv6-77` prints **Iron Thorns ex**, Lightning type, with **Volt Cyclone**, which moves an Energy from itself to one of its Benched Pokémon. Flash Energy AOR is also implemented at the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` in `sets/07-x-and-y/set-ancient-origins/flash-energy.ts`; its `CheckTableStateEffect` reducer discards it from a non-Lightning recipient.

Construct a board with Active Iron Thorns ex TWM holding an attached Flash Energy AOR, and a genuine, occupied **non-Lightning** own Bench Pokémon. After Volt Cyclone selects Flash Energy and that recipient, the paper-compliant final route is:

`Active.attached Flash -> move to incompatible Bench Pokemon -> owner's discard`.

The initial move is paper legal. A strong audit should distinguish the legal attempted transfer from the compulsory final-zone discard. A Lightning recipient instead retains Flash Energy attached.

## Prior false-negative boundary

The earlier [Agent39 v4b component](../../simulation/twinleaf/agent39-paper-prompt-portfolio.cjs) certified a marked prompt only if the exact card was absent from Active and present in the chosen occupied Bench card stack and Energy sublist. That was appropriate for ordinary Energy and DCE, but it classified the **paper-correct Flash discard route** as `PAPER_PROMPT_SETTLED_EFFECT_UNVERIFIED`, despite an actual settled native prompt. This is an overstrict false negative, not a previously demonstrated false-positive game win. The older observer was correctly conservative about counting certified transfers.

## v4c scoped change and tests

Commits `c726e84354065034c5eaf74c4868c57a4b4cef12` and `85dd3c50c705b94026c25098a4fc17b314f98065`:

- `simulation/twinleaf/agent39-paper-prompt-portfolio.cjs` now determines the printed expected final zone for **Flash Energy AOR only** using the chosen occupied Bench Pokémon's printed type. When non-Lightning, the positive post-dispatch certificate requires the *same exact Flash card object* to leave Active card and attached-Energy sublists, remain absent from the chosen Bench, and appear newly in the original owner's discard. Unknown target type fails the printed preflight without inventing a verdict.
- For Lightning recipient and all previously supported ordinary transfers, it preserves the established Bench custody requirement. Other specialized Energy effects remain unverified if their final physical routes differ.
- The audit retains live-versus-auxiliary Store distinction, the exact pending prompt result, and actual physical custody. `expectedRoute` and `livePaperVerifiedDiscardedFlashEnergy` make this narrow exception visible.
- The exact updated source and test files were executed in an isolated V8 CommonJS stand-in with injected `node:test`, `node:assert/strict` and pinned Store-like class mocks. **26/26 synchronous tests passed** at source blob `e6a6f2b207cb235493b596bdbf663c72b8e5ea40`, test blob `6e0875f337f433486f940ccc596624153a4f8302`. Five newly added cases cover the printed recipient type classification, two seats with mandatory discard, and two seats whose incorrect Bench-retained result must remain unverified. Earlier 21 cases remain green in this isolated harness.

**No new genuine compiled native Store test, workflow dispatch, full 60-card duel, or opponent-policy qualification was performed in this invocation.** We must test both Lightning and non-Lightning destinations with the exact pinned native `MOVE_CARDS` and table-state check before treating this as genuine paper-certified native effect. In particular, the presence of Flash's `CheckTableStateEffect` implementation does **not** prove whether the live prompt-dispatch path invokes it at the required time. Do not fold synthetic results into game win-rate statistics.

## Research implications

This illustrates a general hazard in certifying game actions: printed correctness can involve a transient destination followed by a mandatory secondary zone transition. A prompt answer plus movement to the nominal target is insufficient to verify rules that conditionally discard the moved card. The appropriate audit object is a **printed expected final-state transition**, with source card identity, recipient type, and all resulting zones. Expand this representation only after card-specific printed/native checks, rather than assuming every Energy has Flash Energy's restriction.

Status remains unchanged: 29 authenticated source name/count inventories, original ranks 23/25/28 unverified, zero competitively qualified games, no selected final 60, and no demonstrated 99.5% field win rate.


## 03:56 UTC independent compiled pinned-native result

[Manual GitHub Actions run 42335993754](https://github.com/FlareZ123/experiment-01/actions/runs/42335993754) completed **SUCCESS**, `abort-custody` job **SUCCESS**, original revision `91ce3641b564ed51dbb623783a19f8e930128e83`. The tested checkout pins upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, compiles genuine Store classes, runs the actual Agent39 source/test `node --test` step (**26/26 tests**), and executes `node simulation/twinleaf/agent39-volt-cyclone-paper-native.cjs`. Job ID `128292935302` contains the source receipt.

The exact native JSON reports **four Flash Energy routes**:

| Source physical seat | Occupied destination Pokémon | Printed/verified expected final zone | Native result |
| ---: | --- | --- | --- |
| 0 | Iron Thorns ex TWM (Lightning) | Bench attachment | Exact Flash in Bench attached-Energy sublist, absent discard |
| 1 | Iron Thorns ex TWM (Lightning) | Bench attachment | Exact Flash in Bench attached-Energy sublist, absent discard |
| 0 | Giratina LOT (Psychic) | Owner discard | Exact Flash in discard, absent Bench and Active |
| 1 | Giratina LOT (Psychic) | Owner discard | Exact Flash in discard, absent Bench and Active |

**All four native prompt replies settled**, the observed final physical zone matches printed expectations and v4c marked exactly one physical acceptance per case. The two earlier native DCE sources and two no-Bench cases also passed. This is the first executed **compiled pinned native** result for v4c and strengthens the narrow card-state claim; **still not a natural printed-60 game, original field result, complete-game policy, or candidate win**.

The four Flash cases were added to the pre-existing manual native fixture at commit `14790a474e4e8fdc24cfe7d26a0ae9b298b775ec`; no new workflow. This result does not establish dynamic-type or Stadium-suppressed Flash behavior, which remain explicit next controls.

