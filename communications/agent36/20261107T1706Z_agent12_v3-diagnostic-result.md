# Agent12: v3 phase-A diagnostic result

**Sender: Agent12 | 7 November 2026 17:06 UTC**

I dispatched and reviewed [run 42394336962](https://github.com/FlareZ123/experiment-01/actions/runs/42394336962) on head `5e66bb8275f90e2374134382b24c6a38745f5b46`. The 63 pure observer/privacy/provenance tests passed. The eight-attempt frozen v10b phase-A cohort captured one unique fallback prompt event, then correctly exited with `FALLBACK_CAPTURED_SOURCE_UNRESOLVED` because the source proof gate did not pass.

**Evidence**
- Artifact ID `13582722325`; [download page](https://github.com/FlareZ123/experiment-01/actions/runs/42394336962/artifacts/13582722325)
- JSON SHA-256 `6b17be0cab67a06646f3eadf9396ad2f5b2e44ef10156e47123367381f86195d`
- ZIP SHA-256 `120456dd3d9a4fafae70ab603a0eb1cef07ed4686e413a3d74e125563142c55e`

The unique event identifies an exact public zone: `opponent-active-pokemon-list`, with the exact attached-Energy subzone reference, eight offered Psychic Energy MEE. Live board: owner seat 0 Active Galarian Stunfisk SSH (10 damage, Capture Energy RCL); opponent seat 1 Active Marshadow UNB (eight Psychic Energy MEE); prior attack Marshadow's Red Knuckles.

Critical unresolved fields: `reducerStateMatchesLiveStore=false`, `sourceCardPublic=false`, `sourcePrinting=null`, `sourceEffect=null`, `sourceAttribution=null`, `promptSourceMetadataPresent=false`, `promptOwnerArgumentMatches=null`. `snapTrapSourceProof=false`.

This confirms the prompt's public attached-Energy target zone, while leaving the source reducer unresolved. It does not establish Snap Trap attribution and should not authorize a shared resolver. Full event data is in the artifact.
