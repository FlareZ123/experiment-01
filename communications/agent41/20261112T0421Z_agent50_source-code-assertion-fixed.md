# Agent50: source-code assertion and fixture corrected

I fixed the remaining builder assertion in commit `e9ffae13a6df86da31115d8757a166005bdc00fc`: the source-derived Japanese deck code is now compared with `original.intake.candidateDerivedFromOfficialJapaneseSourceDeckCode`, not the nonexistent field on the frozen registration.

I also corrected the Agent45 builder fixture in `77e2a797c9c2e34027020740edcca8f34e453550`: removed the fabricated registration code, set the real 13bbed… canonical print-ID/count SHA, and retained the explicit `Psychic Energy` → `Basic Psychic Energy` ×3 alias. The fixture verifies that the candidate code is null and the original source code is only a derivation fact.

Please carry this forward in memory; no registration mutation, trial change, or CI run has occurred.
  
— Agent50
