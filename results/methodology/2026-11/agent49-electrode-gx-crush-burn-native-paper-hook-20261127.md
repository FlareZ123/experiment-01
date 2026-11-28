# CES48 Electrode-GX Crash/Crush and Burn-GX: pinned source mismatch and quadratic damage correction

**Agent49 — 27 Nov 2026.** Separate opt-in paper-Expanded hook development. **Not installed on main, not run against a compiled pinned Twinleaf Store, not an Aichi matchup, and not a win-rate claim.**

## Two concrete engine discrepancies at pinned Twinleaf commit

Pinned submodule: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; source path `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/electrode-gx.ts`. Compare bundled English card pool `cards/en/sm7.json` / `sm7-48`:

1. **Name mismatch:** English print's second attack is **Crush and Burn-GX**, but pinned Twinleaf declares **Crash and Burn-GX**. The internal attack name is used by its native action frontiers, so a policy emitting only the correct printed name cannot select the unmodified native attack.
2. **Damage overcount:** English CES48 says **30 + 50 damage for each physical Energy card discarded from your Pokémon**. The pinned reducer counts the selected transfers as `totalDiscarded=transfers.length` and then, *inside the loop over those transfers*, performs `effect.damage += totalDiscarded * 50` on every iteration. This produces **30 + 50n²** instead of **30 + 50n** for `n` physical discarded Energy cards. Only `n=1` looks correct.

| Physical Energy cards discarded | English printed damage | Pinned callback's damage |
|---:|---:|---:|
| 1 | 80 | 80 |
| 2 | 130 | 230 |
| 3 | 180 | 480 |
| 4 | 230 | 830 |
| 5 | 280 | 1,280 |

The native `DiscardEnergyPrompt` uses a `CardTarget + physical card index` transfer and `min=1,max=totalEnergy`. GX marker `player.usedGX=true` is set inside the native callback; this project must preserve the original mandatory prompt/card transfers/GX spend.

## Concrete reversible hook

Review branch: `agent49/rank17-crushburn-pinned-damage-fix-20261127`, source:

`simulation/twinleaf/electrode-gx-crush-burn-paper-hook.cjs`

- `normalizeElectrodeGXPrintedAttack(card,replacements)` changes only CES48's second attack name **Crash → Crush**, preserving the original attack object and GX flag. The opt-in installer normalizes the loaded CardManager template and every subsequently requested clone. It also tracks clones already inheriting the normalized template spelling, so the final restore returns both templates and all clones to the original pinned name.
- `wrapElectrodeGXCrushBurnReducer` affects only a real `AttackEffect` whose source card is exact CES48 and whose attack is the same second attack object bearing the printed name. It intercepts the exact pinned `DiscardEnergyPrompt` identified by `GameMessage.CHOOSE_ENERGIES_TO_DISCARD`, keeps the native prompt/decoder/validator and callback, then checks the actual native damage delta is `50n²` and corrects it to `50n`. If upstream's equation changes, unknown prompt multiplicity occurs, or a malformed transfer count is supplied, the adapter throws rather than fabricating the desired result. No vendor code is edited.
- `installElectrodeGXCrushBurnPaperHook()` is intended to run after card-set initialization and before creating the experimental decks, and restore after the trial. Its testable dependency-injected variant `installElectrodeGXCrushBurnWithDependencies` permits installing on a native-shaped card manager and reducer without a vendor checkout. If composing with other CES48 paper hooks, installation and restoration must be LIFO.

No rank17 opponent policy automatically selects this attack yet. **This repairs a necessary engine precondition; the remaining actor root→DiscardEnergyPrompt decision chain is a separate development task.**

## Executed source-level regression

Exact review-branch test: `tests/2026-11/agent49-electrode-gx-crush-burn-paper-hook.test.cjs`; **9/9 named groups, 176 strict assertions passed** by evaluating fetched exact source in a JavaScript V8 CommonJS shim. Both source seats are tested across physical discard counts 1, 2, 3, 4, and 5. Controls reproduce the original quadratic formula, verify source printing/attack identity gating, reject malformed/over-max/zero transfers and a hypothetical changed upstream equation, then verify idempotent install and **template + separately cloned card** restoration after the trial.

**Not yet proved:** actual local Node `node --test`, compiled pinned Twinleaf Store's prompt callback timing, native attack damage settlement/KO+GX spend under the hook, actual game, paper tournament behavior beyond the checked source card, or a competitive win rate. **Required next native gate:** with exact pinned CES48 + `DiscardEnergyPrompt`, stage both player seats, select two and three distinct physical attached Energy cards from a real Store state, show the printed attack is offered, the original unpatched output is 230/480 versus correct hooked 130/180, verify exactly two/three physical moves and `usedGX`, and restore the hook without altering other CES48 printed attacks or Booster/Item locks. Do not dispatch the owner-frozen V3 game or CI without its explicit go/no-go.

## Strategic consequence

Without this correction a rank17 or rank9 Electrode-GX GX line may be **unselectable under printed attack naming** or massively **overvalued by damage** if simulated with the native typo. Any earlier evidence derived from this attack under the pinned unmodified engine must be treated as simulator-biased until its state, prompt, actual discards and damage are inspected. This is not a recommendation to favor the attack in the final deck; only an executable correctness prerequisite.

The 9th test deliberately fails installation halfway through a malformed CES48 CardManager template list and verifies previously renamed templates are **rolled back atomically** while the original reducer/getter prototypes remain unchanged. Hook installation now treats this as a transaction, not a partially mutated global state.
