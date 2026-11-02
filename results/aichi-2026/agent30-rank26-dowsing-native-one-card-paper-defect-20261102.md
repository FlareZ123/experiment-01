# Original rank26 Dowsing Machine: native Store accepts an underpaid one-card retrieval

**Agent 30 | 2 November 2026 | confirmed pinned real-Store paper-fidelity defect | zero competitive-qualified games.**

## Discovery and evidence

The authenticated original Aichi Open League 2026 rank26 Hibiki Yamada Meloetta Donk printed 60 includes exactly **one Dowsing Machine PLS 128**, two Lightning Energy MEE 12, one Double Colorless Energy SUM 136, and three Battle VIP Pass FST 225. The original source list is in [full-decklists.json](full-decklists.json). Dowsing Machine's printed text explicitly requires **discarding two other cards from hand** to recover a Trainer card from discard.

Pinned Twinleaf submodule commit **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`** contains `ptcg-server/src/sets/06-black-and-white/set-plasma-storm/dowsing-machine.ts`. Its original discard prompt declares `min:2,max:2,allowCancel:true`, but the reducer's continuation tests only `cards.length===0`. A one-card selection therefore reaches the ordinary Trainer recovery.

## Reproducible native experiment

**[Successful manual CI run 41451205603](https://github.com/FlareZ123/experiment-01/actions/runs/41451205603)** executed [the native probe](../../simulation/twinleaf/agent30-dowsing-machine-payment-native.cjs) and [six-case native test](../../tests/agent30-dowsing-machine-payment-native.test.cjs) inside the already existing, manually dispatched [Iron Thorns native suite](../../.github/workflows/aichi-iron-thorns-first-attack.yml). Execution commit `fe9381d6f45f29b2ff565d314571ddf3e84f05f3`; `native_energy_probe=true`; no automatic per-push workflow. The native test step was successful. It used the genuine compiled engine's `Store.dispatch`, `PlayCardAction` and `ResolvePromptAction` in both physical seats.

The prepared live Store holds an actual printed Dowsing Machine, a Lightning Energy and a Double Colorless Energy in the owner's hand, and an actual Battle VIP Pass FST in the owner's discard pile. The controlled variable is the number of submitted **distinct genuine physical owner-hand discard cards**: 0, 1, or 2. This is a deliberately staged conditional board, **not a random opening dealt from an original complete 60-card game**. Both native playing-seat orientations are tested.

| Owner physical seat | Submitted payment | Native prompt validation | Actual Store accepted payment reply | Real recovered Battle VIP Pass | Physical discarded Energy |
| --- | ---: | --- | --- | --- | ---: |
| 0 | 0 | Rejected | Yes | No | 0 |
| 0 | **1** | **Rejected** | **Yes** | **Yes** | **1** |
| 0 | 2 | Accepted | Yes | Yes | 2 |
| 1 | 0 | Rejected | Yes | No | 0 |
| 1 | **1** | **Rejected** | **Yes** | **Yes** | **1** |
| 1 | 2 | Accepted | Yes | Yes | 2 |

Every branch removed Dowsing Machine from the owner's hand and ultimately placed it in the discard pile, and all prompts closed. The one-card branch discarded Lightning Energy but left the held Double Colorless Energy in hand, while retrieving the actual Battle VIP Pass from the discard pile. The fully paid branch discarded **both** Energy cards and retrieved the same Trainer. These outcomes are observed physical zone changes, not mock expectations. The native prompt's `validate` function correctly marked the short payments invalid, yet `Store.dispatch` settled them. This parallels previously reproduced original Secret Box/Ultra Ball underpayment, while the Dowsing-specific one-card successful continuation is distinct.

## Paper validity and tactical significance

The one-card branch is **paper-invalid**: Dowsing Machine cannot pay exactly one card when its printed cost is two. The zero-card branch also violates the mandatory cost, but in this fixture it returned no Trainer, so it does not show a free recovery. The positive two-card branch is compatible with the printed payment requirement for this narrow effect; the test does not establish other phases of a real turn or a whole-game paper certification.

Rank26 research contains several strategy lines involving Dowsing Machine retrieving Damage Pump and other Trainers. An automated adversary or deck optimizer could exploit this native underpayment to preserve one important hand resource while recycling a Trainer, falsely increasing the source's apparent reachability and consistency. Prior [rank26 Dowsing hold counterfactual](rank26-dowsing-hold-source.md) observed a fully paid Dowsing on one historical source deal and must **not** be relabeled invalid retroactively; this is a demonstrated *possible* Store error rather than proof it occurred in that run. Independently validate each actual payment if qualifying a natural game.

## Integration gate and open work

A source-identified, reversible, **default-off** research-owned negative check should require exactly two distinct physical eligible cards for Dowsing's genuine payment prompt before native dispatch, while separately preserving valid payment and Trainer recovery. The native Dowsing reducer does not stamp `sourceCard` on that prompt, so a guard must establish provenance from the genuine Dowsing root; a generic unmarked `ChooseCardsPrompt` check risks misclassifying unrelated options. Preserve actual owner-only information boundaries and ensure an auxiliary speculative Store is not treated as the real selected source game.

A proposed guard code submission during this invocation was **blocked by host safety checks**. That change was not committed and should not be described as available or tested. Existing shared [v10 paper-payment portfolio](../../simulation/twinleaf/agent41-paper-prompt-contract-portfolio.cjs) guards specific other costs but does not claim a Dowsing proof. No candidate deck is promoted; no simulator game or rank26 win is qualified by this result.

**Defect verdict:** one-card paper-invalid Dowsing recovery **reproduced 2/2 native physical seats** on a conditioned board. **Field verdict:** still only 29/32 authenticated original sixties, zero competitively qualified games, and no demonstrated 99.5% win rate.
