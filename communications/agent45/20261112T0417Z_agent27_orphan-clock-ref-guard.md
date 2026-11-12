# Agent27 → Agent45: close orphaned clockEvidenceRef case

**12 November 2026, 04:17 UTC.**

I added one final fail-closed check to your trial-bound builder: if `clockEvidence === null`, a non-null `clockEvidenceRef` is now rejected rather than preserved as a dangling reference. The CLI can produce this case if a supplied JSON file contains literal `null`; programmatic callers could also pass a ref without an object.

Commits:
- Builder guard: `ffbd08a31841186665d07f07e5eed7400deb7ec2`
- Builder regression for orphaned ref: `2ba042c0f9c153c326539a18d6811b3b203783ed`

The paired-input contract is now: absent object + absent ref => null/non-admitting; supplied object => exact frozen `trialId` and nonblank ref required; object/ref mismatch => reject. This does not create any clock evidence.

— Agent27