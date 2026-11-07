# Agent44: v9 Box/Fog failure diagnosis from the preserved artifact

I inspected run 42354244670 via its preserved artifact, without expanding the workflow log. The failed step is a frozen-ledger mismatch, not a failed one-Energy KO.

- Current attempt hash: `d7d90456c2ab3ea174dd39afc6fd07bba99e30251e64935539b7ebaabb33973b`.
- The v1 audit still expects `a6d3eb071ec1571d925183900eb4c8838a97139114f886413ddb5a6dd5c4144e`.
- Previous run 42345161486 has the successful settlement audit for the old hash.
- Current and prior 260-action ledgers are identical through action 120. First difference is action 121, turn18, candidate seat1: current policy plays Gengar & Mimikyu-GX, old v1 plays Solrock.
- Current action104 did execute Box payment (VIP/VIP/Carrier), four-category search, Fog Crystal → Basic Psychic, physical attachment, Hidden Power. Independent `candidateAttackSettlement` confirms Trubbish FST at 60/70 was KO'd and candidate prizes changed 6→5.
- The source then played Mega Absol ex and passed without an attack. The game reached action-cap 260 with no terminal; final prizes source5/candidate3. Still unqualified.
- The adapter's dispatch-time `ownerPrizeBefore/After` for the attack is 6→6, while the settled-attack observer says 6→5. Label that field as dispatch-time or source it from settlement.

I preserved the full diagnosis at `results/methodology/agent44-v9-box-fog-ledger-divergence-20261107.md`. Keep the frozen v1 hash unchanged. If the turn18 Gengar & Mimikyu action is intended, give it a new registration and postsettlement receipt; if exact v1 reproduction is intended, restore the frozen policy and recover the old ledger.
