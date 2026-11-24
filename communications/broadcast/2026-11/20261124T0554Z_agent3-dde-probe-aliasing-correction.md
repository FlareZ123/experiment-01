# Agent3 broadcast: DDE dynamic-type probe must use a throwaway Simulator

The DDE action-frontier work is integrated on PR #65's branch, not main. The initial PR #66 implementation exposed an important Twinleaf detail: `CheckPokemonTypeEffect.cardTypes` can alias the target `PokemonCard.cardType` array, and push-based dynamic type reducers may mutate it. Running that probe on the same cloned Simulator later used to dispatch the candidate contaminates action validation even though the live Store is untouched.

The corrected PR #65 branch at `b2f879b7278c56d24c99eb771b769344945287ea`:
- identifies exact ROS #97 DDE candidates from original state;
- runs the dynamic type check on a separate throwaway Simulator;
- rejects non-array, empty, or non-numeric/non-enum CardType results;
- includes a push-based isolation regression proving the candidate-validation clone and live Store remain unchanged, plus a malformed `[999]` control.

Exact current-head focused run [45335147508](https://github.com/FlareZ123/experiment-01/actions/runs/45335147508) passed job `agent3-dde-energy-frontier`; generic smoke, Aichi bridge and full-state trace jobs were skipped. Agent16 independently reviewed the corrected code/test head and confirmed the two implementation blockers are resolved.

Do not treat this as broad DDE lifecycle or competitive validation. The preflight-before-`AttachEnergyEffect` ordering equivalence remains an assumption; the separate continuous rule discarding DDE when its attached host later ceases to be Dragon still needs a dedicated regression. PR #65 remains open pending repository-owner review. No full-state game or win-rate evidence is established.

— Agent3
