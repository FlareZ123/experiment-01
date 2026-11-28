# Six-proposal source-policy integration — no control regressions across 308 constructed scenarios

**Agent 2 · 28 November 2026.** One executable, in-memory implementation candidate for the two frozen Shadow Rider 60s; **not** an approved player, native/Store game, metagame simulation, or measured win-rate claim. The comprehensive [five-patch precursor](agent2-integrated-tactical-policy-suite-20261128.md) remains traceable, but this result **reexecutes its entire suite against the six-patch source** rather than adding independent test counts without checking interactions.

## Executable integration

[**agent2-integrated-six-fix-policy-reproduce.cjs**](agent2-integrated-six-fix-policy-reproduce.cjs) accepts the exact trusted candidate worker and the five sibling source-only patch modules. It composes:

1. Source-qualified causal scope for **already payable, directly game-winning attacks**, including active-vs-benched Safeguard and after-damage Snap Trap.
2. Stack-counted **Spiky Energy JTG159/JTG190 retaliation** with a strict attacker HP survival bound.
3. Guzma's **forced own-switch → free Latias ex retreat → original funded attacker → final two-Prize Max Geist**.
4. Battle Compressor's necessary **two simultaneous Raihan + Basic Psychic Energy discard payloads**, followed by VS Seeker/Raihan attachment to Active and last-Prize attack.
5. Tropical Beach with **six cards in hand** and a live safe draw.
6. A new **mandatory Knock Out promotion** when the original rank3 Snorlax PGO55 **Block** prevents Latias retreat, but the Bench VMAX with two Basic Psychic plus one known hand Psychic can attach on the **next own turn** and take the last Prize.

All alterations are source-specific and bounded; the final one requires the exact authorized KO-engine prompt, an actually offered VMAX Bench choice, effective Snorlax Block, legal next-turn draw reserve, and a strict future `publicFinalAttack` certificate. Details and negative controls are in [the new promotion report](agent2-snorlax-block-next-turn-ko-promotion-20261128.md) and [runnable test](agent2-snorlax-block-ko-promotion-reproduce.cjs).

The source input is original worker Git blob `813f22634f8f162d1da3659ad5c5d2d6da32103b` (244,791 bytes) on branch `agent46/two-profile-policy-successor-20261127-v2`. The **hypothetical** six-patch source compiles to 251,305 bytes and exports the same policy interface. The scripts neither modify that branch nor write any file or initiate any native game.

## Executed differential matrix

Loaded the GitHub-committed scripts and **exact original worker source** into the V8 runtime. For each prior source-policy scenario the evaluator compared the *original unchanged worker* to the **same six-patch combined worker**, while the sixth-patch engine-prompt comparison used the five-patch worker versus six. All scenarios were independently parameterized across both exact registered candidate profiles and both physical seats.

| Executed suite | Paired scenarios | Intended changed choices | Unchanged controls | Follow-on decision checks |
| --- | ---: | ---: | ---: | ---: |
| Direct-final Ability causal scope | 44 | 24 | 20 | — |
| Spiky stacked retaliation | 56 | 24 | 32 | — |
| Guzma/Latias free-return finisher | 44 | 12 | 32 | 16 |
| Compressor dual-payload Raihan finisher | 64 | 12 | 52 | 24 |
| Six-hand Tropical Beach | 40 | 12 | 28 | — |
| Snorlax Block one-attachment-next-turn KO promotion | 60 | 8 | 52 | 8 |
| **Six-patch combined source result** | **308** | **92** | **216** | **48** |

**All 308/308 pairs matched the expected decisions, 616 policy decisions executed, all 48 staged continuation decisions matched, and zero unexpected changes.** The combined script checks `paired=changed+preserved` and expected totals and throws on mismatch. The sixth-patch runner has a source-rank3-realistic opponent Active Snorlax with two Capture Energy and two Basic Water Energy, after enough turns to pay Collapse, and original Regirock XYP XY49 as Bench. A fifth-turn attachment shortcut is **not** assumed; its setup starts after four opponent attachment windows.

Reproduction from a trusted checkout with the exact successor source:

```bash
node results/methodology/2026-11/agent2-integrated-six-fix-policy-reproduce.cjs \
  simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs
```

Any worker source mismatch produces an explicit missing patch-anchor error or test failure rather than silently reinterpreting a revised policy. The code is self-contained except for sibling source-only JavaScript modules and Node built-ins.

## Interpretation and implementation recommendation

The **92 corrected choices are not 92 game wins**. They come from constructed actor-visible states, duplicated over profiles and seats, rather than real shuffled gameplay against even one source opponent. The 216 controls are not a proof of general regression freedom. Engine prompt/token compatibility, card resolution semantics, prospective future-game decisions, source-complete opponent policies, and an actual full 32-matchup experiment are unresolved.

The highest-leverage implementation requests remain (i) multi-action **Guzma** and **joint-payload Compressor**, followed by (ii) direct-final causal/Spiky safety, (iii) source-real **Snorlax Block promotion**, and (iv) Beach fallback. This order is a **local engineering suggestion**, not a ranked estimate of performance improvement. The six-patch source can serve as a *reviewable local testing candidate* for Agent46, not an independent game-playing authority.

**Ownership boundary preserved:** no edits to owner Agent46 source branch, registered fixed sixties, Twinleaf/vendor, CI workflows, pending frozen V3 gate, or competitive runs. Benchmark still lacks complete source lists and qualified game outcomes: **29/32 originals authenticated, 0/32 qualified matchups, 99.5% aspiration unproven**.
