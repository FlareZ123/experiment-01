# Original Mew Ultra Ball: dynamic dead-card DCI v2 on four fresh physical source deals

**Agent37 | 9 Nov 2026 | Fresh preregistered native sample | 0 competitive paper games**

## State-conditioned payment correction

A previous fixed protected-discard set treated Forest Seal Stone as valuable even after the owner had spent the once-per-game VSTAR Power, and treated Battle VIP Pass like an ordinary hand card after its first-turn-only play window closed. This produced an unnecessary resource-tradeoff class: a generic scorer could protect a strategically dead card while giving up a future gust or search resource. Implemented in `simulation/twinleaf/agent37/mew-ultraball-evolution.cjs` (v2) as an opt-in source-owner mandatory native Ultra Ball hand-payment selection: within the physical Store-validated two-card menu, preserve DCE/Secret Box/Mew/Genesect bodies and an **unspent** Forest Seal Stone wherever a completely unprotected choice exists; preferentially spend already expired `Battle VIP Pass` at owner global turn >= 3 and `Forest Seal Stone SIT` only when the owner's actual public `vstarUsed` is true; use the existing owner generic uniqueness heuristic only to break ties. The original native prompt object and physical card choice remain governed by Store validation. Two new pure tests certify dead-VIP and spent-VSTAR state changes without consulting hidden Prize/deck identity. Both candidate 60s, original source 60 and upstream pinned Twinleaf stay unchanged.

## Independently frozen experiment

[Preregistration](../../aichi-2026/registrations/agent37-rank5-mew-ultraball-payment-dci-v2-20261109.json), created before any v2 native games, contains four newly generated source seeds `292063553`, `742346033`, `1865883748`, `168985357`, both physical source seats and fixed champion / New Moon candidate sixties. The eight complete physical initial cases are each repeated under generic source Ultra Ball mandatory discard control and dynamic DCI v2 source-only treatment. Every other policy decision, including native Mew Ultra Ball root, Mew VMAX owner search, Quick Ball and DCE recipient, remains identical.

- [Native CI run 42592012326](https://github.com/FlareZ123/experiment-01/actions/runs/42592012326) **SUCCESS**, including pure native and dynamic DCI tests.
- [All 16 raw native rows artifact 13662021518](https://github.com/FlareZ123/experiment-01/actions/runs/42592012326/artifacts/13662021518).
- [Executable paired runner](../../../simulation/evaluation/2026-11/agent37-rank5-mew-ultraball-payment-dci-v2.cjs).

**16/16** registered native games completed without errors; all 16 reached the engine's natural terminal; all **8/8** treatment/control pairs shared exact source AND complete physical initial-deal fingerprints. Neither the source attack declarations nor native settled attacks, final Prize counts or native winning seat changed in any of the eight matched comparisons. Source attack declarations by group in both arms: `4, 4, 3, 6, 0, 4, 0, 3`.

Two groups (repeat9 source seat1 vs each fixed contender) completed authentic source Ultra Ball two-card payments on source turn3; the actual accepted card pair was `Quick Ball FST + Quick Ball FST` in both control and treatment. None of the other six physical cases presented a mandatory source Ultra Ball two-card payment with distinguishable v2 source DCI value. No native group encountered a spent Forest Seal Stone vs an unspent Stone payment ambiguity or a costly alternative where expired VIP would alter the accepted payment. The policy is thus **mechanically tested but not performance-exposed** in this new independent sample.

## Synthesis of the three payment investigations

The original selected-hand retrospective experiment proved an actual mechanistic rescue from an unguarded `Battle VIP Pass + Double Colorless Energy` payment into `Battle VIP Pass + Hisuian Heavy Ball`, leading to a genuine subsequent Mew VMAX Cross Fusion Strike for 210 damage with **zero native winner changes**. In the first independent four-seed panel, all four actual source Ultra Ball payments already used low-cost cards. The second independent four-seed dynamic DCI panel similarly encountered no target payment collision. This establishes a **real conditional correctness improvement**, yet gives **no independent population-level win-rate improvement evidence**.

**Decision:** Retain the dynamic DCI owner payment as opt-in. Prioritize policy work with direct demonstrated source setup/attack and strong contender opponent decisions over repeatedly drawing new low-exposure Ultra Ball payment panels. The future refinement is state-sensitive opportunity cost of one-off tactical Supporters and owner K1 Prize information; v2's automatic dead-card discard is narrow and paper-legality-driven.

Qualified paper game count: **0**; 99.5% versus full field: **not demonstrated**; single final 60: **not selected**.
