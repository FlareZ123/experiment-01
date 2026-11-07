# Agent 20: root-93 Powerglass attack bridge

I independently inspected the archived native game `11:1000:B:new-moon-lockbreaker-v1` (seed `626469135`, rank 11 source seat 0, candidate seat 1, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`).

## Candidate-side evidence

At candidate turn 14, root ordinal 93 is a Pass. The exact owner-hand receipt includes `Powerglass SFA`. The public board has:
- candidate Active `Unown AOR`, 60 HP, 0 damage, no attached Energy and no Tool;
- candidate Bench `Mewtwo & Mew-GX`, `Lunatone`, `Duskull`, `Trevenant & Dusknoir-GX`;
- source Active `Trubbish FST`, 70 HP, 60 damage, three Darkness Energy;
- no Stadium in play and no public Tool/Ability lock visible.

The candidate's earlier root actions 25 and 38 are `PlayCardAction Psychic Energy`, followed by `Hidden Power` attacks at roots 26 and 39. The candidate's earlier Active Unown is then Knocked Out: source `Super Poison Breath` at root 86, source Prize choice at root 88, candidate promotion at root 89. The New Moon print map distinguishes Basic Psychic Energy (Twinleaf `Psychic Energy SVE`) from Special Telepathic Psychic Energy (Twinleaf `Telepath [P] Energy M3`); the ledger's `Psychic Energy` action labels support the two prior attachments being Basic. Subject to confirming the two physical printings from a richer root receipt, those Basic Energies are in the discard after the KO.

## Paper-plausible alternative

Attach the held Powerglass to the new Active Unown at root 93. The card's end-of-turn effect can attach a Basic Energy from the discard pile to its Active holder. The uploaded advanced manual, E-21, explicitly says an end-of-turn Tool effect can trigger even when the player ends the turn without attacking. The existing compiled pinned-Store Secret Box/Powerglass test also demonstrates a real end-of-turn Powerglass Basic-Energy attachment, though on a staged Mewtwo & Mew board.

The actual source reply after root 93 is Super Poison Breath at root 96 (turn 15). On the printed 20 damage plus ordinary Poison checkup (10), the new 60-HP Unown should survive at 30 damage. It could then use the one-Colorless Hidden Power at candidate turn 16 to deal 10 and Knock Out the 70-HP Trubbish already carrying 60 damage, before the next source turn. This is a one-card Tool setup followed by a known attack, conditional on the two discarded cards being Basic Energy and the native Powerglass trigger working on this Active.

This is a candidate-policy counterfactual, not a replayed result. The source's hidden hand is absent from the candidate observation, and the source policy may respond differently to the changed board. The native opponent actually chose only Super Poison Breath at root 96. Forest Seal Stone is not a direct line here: the candidate has no Pokémon V in play, so there is no legal recipient on this board. The existing Agent41 Powerglass helper is specifically Mewtwo & Mew/Gengar-oriented and declines this Unown state.

## Request

Please independently verify the two physical Basic Energy identities and whether the root-93 source/candidate state can be replayed with an owner-only Powerglass intent. If useful, generalize the existing Powerglass frontier to any active Pokémon whose one-Basic-Energy next-turn attack can KO a public Active, with a public survival gate; keep the policy symmetric, source-independent, and strictly owner/public-information-only. Do not use the candidate identity, rank, seed, hidden deck or Prize identities in the decision. Preserve the baseline and run same-seed A/B/A with exact physical-deal parity before drawing conclusions.

Evidence pointers: `results/methodology/agent7-v9-symmetric-known-dead-source-aba-20261107.md`, `results/methodology/agent8-independent-agent36-v9-native-terminal-bilateral-weakness-audit-20261107.md`, `results/als/new-moon-powerglass-energy-gate.md`, `results/als/new-moon-secretbox-real-store-multiaxis.md`, `simulation/twinleaf/agent41-powerglass-root-frontier.cjs`, `simulation/twinleaf/agent34-actor-only-root-policy.cjs`.

Evidence tier: exact native root/hand/public-board observation plus printed-rule and prior staged Store support; counterfactual alternative legality and strategic value remain to be tested. No competitive qualification or win-rate claim.
