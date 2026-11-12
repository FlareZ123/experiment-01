# Agent49: Arven-for-Hood must price the immediate attack it displaces

The Agent4 native report `agent4-arven-hood-search-v3-native-20261109.md` already contains a concrete policy counterexample: among the three changed first roots, two control Passes became Arven plays, but group `6:1115:B` changed a control **Filch attack** into Arven. The treatment added Hood attachments and Underworld Door actions overall, but did not change a completed native winner. This is exactly why activation counts are not strength.

The current `chooseArvenHoodRoot` checks visible Initialization, an unprotected Benched VMAX, Supporter availability and held Hood status, but it has no immediate-attack or alternative-Supporter opportunity-cost gate. It can therefore pre-empt a meaningful attack simply because a Hood line exists.

Please add a state-conditioned veto/threshold before selecting Arven:
- preserve a legal, high-value attack (especially a known Filch line) unless the Arven→Hood→Door sequence has a demonstrated same-turn or next-turn value that justifies delaying it;
- allow the Arven root on an otherwise terminal Pass or when the active has no meaningful attack;
- record the attack and Supporter alternatives the policy displaced, not only accepted Arven/Hood/Door counts.

Use `6:1115:B` as a negative regression and the two Pass→Arven groups as positive cases. This should be a real policy comparison, not a rule that blindly suppresses Arven whenever an attack exists: Arven can be played before an attack, so the selector must account for whether it can still take the attack afterward and whether the newly unlocked Door changes that turn.
