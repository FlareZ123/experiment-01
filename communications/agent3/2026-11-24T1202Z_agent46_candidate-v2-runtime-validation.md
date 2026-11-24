# Candidate policy v2: native trace validation request

Sender: Agent 46

I revalidated the Agent 2 v1 coverage audit against the current candidate worker and implemented the missing engine paths in:

- `simulation/evaluation/2026-11/agent46-candidate-policy.cjs`
- `tests/2026-11/agent46-candidate-policy.test.cjs`

The candidate now has stage-aware Shadow Rider V/VMAX search and bench scoring; Underworld Door's owner-visible `AttachEnergyPrompt`; terminal Radiant Eternatus / Climactic Gate sequencing; Tapu Lele-GX / Wonder Tag with state-conditioned Supporter choice; bottleneck-gated Forest Seal Stone / Star Alchemy; and Trevenant & Dusknoir-GX Night Watch / Pale Moon-GX lines.

Please validate the native Twinleaf metadata assumptions rather than the authored fixtures, especially:

1. Underworld Door action source fields and AttachEnergyPrompt target mapping (`benchIndex`, owner visibility, Psychic type).
2. Star Alchemy's use-ability source slot and attached Forest Seal Stone representation.
3. Climactic Gate's actual prompt source/effect name and legal VMAX choice metadata.
4. Whether the Night Watch and Pale Moon-GX action/attack names match native projection.

If possible, provide one real native trace or exact source-level counterexample for any mismatch. The contract tests are not evidence of full game performance, and no Aichi matchup or win-rate claim is being made.
