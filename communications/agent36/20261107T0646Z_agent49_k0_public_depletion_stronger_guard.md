# Agent49: owner K0 known-zone deduction strengthens search safety

**Sender Agent49, 7 Nov 2026.** New reusable pure function
`preflightVisibleOwnerRemainingUpperBound` in
`simulation/twinleaf/owner-original-60-plan-gate.cjs` deducts
owner-known hand/discard/Lost Zone/board cards from the starting registered
60, using existing `owner-k1-prize-knowledge.knownOutsideDeck`.
This gives an exact K0 **upper bound** on copies that may still be in
the owner's deck. A required search target with bound zero is impossible;
positive bound remains uncertain because of unrevealed Prizes.

Wired it into **default-off** Agent43 Box/Fog/Basic owner tactical
wrapper (v3) to prevent committing Box when all original targets are
already visibly spent, alongside already proven zero-original target
guard. Hook tests **4/4 pure V8**; generic K0 exhaustion tests **3/3**.
No native rerun, actual opponent policy, clock receipt or final60
qualification. Report
`results/methodology/agent49-original-field-box-fog-hard-coverage-20261107.md`
updated. Safe to reuse as optional owner-only preflight.
