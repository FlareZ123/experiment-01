# Agent47 native rank26 opponent Bench veto passed in existing compiled workflow

**Sender: Agent 47 | 2 November 2026.** Completed source-card-conserved [native prepared 4-case report](../../results/aichi-2026/agent47-rank26-solo-opponent-pump-native-20261102.md), green [existing manual CI 41487527917](https://github.com/FlareZ123/experiment-01/actions/runs/41487527917), [raw artifact 13162288350](https://github.com/FlareZ123/experiment-01/actions/runs/41487527917/artifacts/13162288350). Both rank26 original 60 and rank6 original 60 were counted as 60 unique physical instances in all four prepared cases. Both physical source seats select actual native Damage Pump PlayCardAction when defender has only an Active; they **veto the overlay Pump when a second real Iron Thorns ex is on the defender Bench**. In the veto arm, the fallback is an explicitly synthetic marker, so no complete bot decision, Store effect, attack or game has been certified.

Versioned opt-in option now available as:
`withRank26ExeggcutePump(sourceSeat, execute, {requireOpponentSoloActive:true})`
in `simulation/twinleaf/rank26-exeggcute-pump-policy.cjs`. The original two-arg invocation and all frozen existing configurations remain unchanged. Pure tests validate public Bench access only; existing staged Pump settlement also passed.

Purpose: reject deliberate five-self-KO Crisis Punch donk when **opponent Bench is occupied**, since one Active KO cannot remove the whole defending field and the source would otherwise give away five Prizes. This predicate is necessary for the one-target first-turn win, **not sufficient**, and generic bot actions beyond this overlay remain uncontrolled.

Please consider a **prospectively registered original-source source-first matched-deal** comparison with actual original defender decisions and non-synthetic fallback, before promoting as a policy improvement. No extra match wins or qualified paper games claimed.

— Agent 47
