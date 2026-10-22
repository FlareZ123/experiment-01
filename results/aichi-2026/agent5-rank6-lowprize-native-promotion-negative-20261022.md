# Agent 5: Source-first rank-6 native T15 one-Prize promotion is a losing tempo trade

**22 October 2026.** Preregistered, native Store, same physical deal, unchanged 60-card lists. **0 competitively qualified games.**

## Direct result

The exact preregistration is at [registrations/agent5-rank6-lowprize-promotion-20261022.md](registrations/agent5-rank6-lowprize-promotion-20261022.md). The candidate New Moon Lockbreaker v1 with the exact Aichi rank-6 Iron Thorns ex source first, seed **407516727**, accepted root-control SHA-256 **20203d34d1f9149f7229b147a4906e8a4a80b7192e129a293d68cdc69bfcb419** and source-deal SHA-256 **14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de**. Twinleaf pin **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**. Exact two 60s and all three non-target development arms frozen.

Source turn T15 Volt Cyclone Knocked Out Solrock. Control promoted an unpowered three-Prize Mewtwo & Mew-GX. Treatment instead physically promoted one-Prize **Duskull VIV** from a genuine native candidate-owned ChoosePokemonPrompt (prompt ID 70). The native legal menu contained Mewtwo & Mew-GX, Trevenant & Dusknoir-GX, two Duskull, and Unown. Owner-only public board and prompt menu determined the intervention. It was genuinely accepted by Store: **1 eligible / 1 selected / 1 accepted / 1 physically confirmed / 0 rejected / 0 unresolved**; Duskull became Active and vacated its Bench slot.

| Native measure | Untouched control | T15 Duskull treatment |
| --- | --- | --- |
| Source Prizes after T13 | 5 | 5 |
| Source Prizes after T15 | 4 | 4 |
| Source Prizes after T17 | 4 (damaged Mewtwo) | 3 (Duskull Knock Out) |
| Source Prizes after T19 | **1** (Mewtwo 3-Prize KO) | **3** (Mewtwo damaged) |
| Candidate first settled attack | T52 Psyray | **none** |
| Final source attack | T57 Volt Cyclone | **T33 Volt Cyclone** |
| Remaining Prizes at terminal [source,candidate] | **[0,4]** | **[0,6]** |
| Winner | rank-6 source | rank-6 source |
| Candidate attack count | 3 Psyray | **0** |

The single Duskull promotion does postpone the three-Prize collapse at T19. However, the candidate then has no working attack or continued defensive plan, leaving its subsequent Mewtwo & Mew-GX vulnerable to a full knock out at T33. The selected same-deal game **ends 24 global turns earlier in the treatment**, and the candidate takes zero Prizes rather than two. This is a **negative causal policy result** for the declared narrow intervention; it does not refute other early Prize-protection lines or prove that the underlying card is weak.

## Verification and reproducibility

- [Manually dispatched compiled CI **39711827100**](https://github.com/FlareZ123/experiment-01/actions/runs/39711827100), head **6d7c2ce62777a6a4083ff9d85cb3b36e65e8468f**, **success**.
- [Raw artifact 12397367850](https://github.com/FlareZ123/experiment-01/actions/runs/39711827100/artifacts/12397367850) includes the original native 4-arm control JSON, 4-arm treatment JSON, and the strict paired audit; ZIP SHA-256 **721584c4ee9753acafd9a7c49db14071f9c7ad77a7a845df73fca4ce1bddae08**.
- [Owner-only reversible native Store hook](../../simulation/twinleaf/agent5-rank6-lowprize-promotion.cjs), [single-deal wrapper](../../simulation/evaluation/agent5-rank6-lowprize-development.cjs), [audit](../../scripts/agent5-rank6-lowprize-native-audit.cjs), [pure tests](../../tests/agent5-rank6-lowprize-promotion.test.cjs), existing manual-only workflow.
- Control preserved the original archived full root digest. All three non-target arms retained the same root digest and source deal. Rank-6 treatment digest **9626b719fbb911cbfbd2e8b33eeed104b0783bb1ddb302bdaf782e0bf9b12083**. No other cards or policy options changed.

## Scope and next discriminating check

The setup was historically selected because its source early Prize collapse was known. The native engine, bot action competency, paper-clock behavior, and broader rules remain unqualified. The run is not a prospective match trial and contributes **zero** matches to any win-rate estimate.

At T17, a second one-Prize Duskull is potentially still available on the Bench, and the actual T17 native promotion currently defaults to Mewtwo. A separately registered **second one-Prize promotion T17** could test whether a two-turn Prize-denial chain changes the attack setup or merely adds one more pass and delay. This hypothesis is not an established answer. Results must preserve the exact original T15-only control as well as original zero-intervention replay.
