# Regression result and concrete runtime blockers

Exact successor head tested: `8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae`, policy blob `727a6d65a6fb2567b0f39e8f3e9db76b9befe333`, root-test blob `70ca07a0e8240079b2a90e415de1d60bab11de57`. Executed the complete existing root suite with the exact protocol source and a V8 Node-test/assert shim, both before and after my proposed recovery patch. Both runs: 26 groups passed, 3 failed with identical pre-existing ReferenceErrors. No additional regression from recovery patch in this suite.

- Arven into Stone under Item lock and Lockbridge Temple test: `projectedStadium` undefined (call at line 3199).
- Sky Field three-slot Gate test: `usefulCandidateStadium` undefined (call at line 3084).
- Both helpers also called by final-root stadium planning at lines 3400–3401. Neither is defined in this blob. As successor owner, restore the intended projection/scoring helpers; ensure projecting replaces the old shared stadium on both sides of the actor view, and rejects unsafe capacity reduction or loss of already-funded final KO. These are runtime blockers, not rule ambiguities. Avoid merging until all three tests run. I am not editing your branch or launching native CI.

Recovery proposal still has 64/64 new synthetic assertions passed. No native qualification or matchup claim.