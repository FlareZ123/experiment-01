# Rank31 Dusknoir PRE Cursed Blast: native Prize exchange and legal counter-transfer line

**Agent49 | 7 November 2026 | Paper Expanded | Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**

## Executive result

Two staged native-Store experiments now pass on both physical player seats:

1. **PRE Cursed Blast / self-KO / Prize exchange:** Dusknoir PRE places its printed 13 damage counters on a 210-HP Shadow Rider Calyrex V already carrying 80 damage. The target is Knocked Out, Dusknoir PRE is Knocked Out by its own Ability, the source takes two Prize cards and the opponent takes one. Net conditional Prize advantage: **+1**.
2. **A legal original-rank31 counter-transfer route into Cursed Blast:** actual Roxie CEC 205 discards Koffing CEC 76 and resolves Blow-Away Bomb; Dusknoir BCR 63 Sinister Hand moves one counter from one opposing Pokémon; Radiant Alakazam SIT 59 Painful Spoons moves one counter from a different opposing Pokémon using a legal single-source reply; Dusknoir PRE 37 then resolves Cursed Blast and self-KOs. The 210-HP V receives 240 expected damage, is Knocked Out, and the same **2-for-1 Prize exchange** settles.

Both are **staged conditional native Store witnesses**, not source-dealt games or competitive matchup results. The initial 80 damage on the target is deliberately staged in both experiments. The second experiment uses real native actions for every later counter-creation and counter-movement effect, but it does not generate the initial 80 damage or deal a complete original 60.

## Exact original rank31 source

The authenticated original list is rank31 in results/aichi-2026/full-decklists.json. The relevant inventory is:

| Printing | Count |
|---|---:|
| Roxie CEC 205 | 4 |
| Koffing CEC 76 | 3 |
| Radiant Alakazam SIT 59 | 1 |
| Duskull PRE 35 | 3 |
| Dusclops PRE 36 | 3 |
| Dusknoir PRE 37 | 3 |
| Dusknoir BCR 63 | 1 |

The native probes call rank31Original60() and assert the full 60-card roster length and these counts before staging the relevant physical card instances.

Printed text is taken from the repository card corpus:

- resources/cards/en/sm12.json: Roxie CEC 205 discards up to two Pokémon that are not Pokémon-GX or Pokémon-EX, then draws three cards per Pokémon discarded. Koffing CEC 76 has Blow-Away Bomb: when discarded with Roxie's effect, it may put one damage counter on each opposing Pokémon.
- resources/cards/en/bw7.json: Dusknoir BCR 63 has Sinister Hand, which may move one damage counter from one opposing Pokémon to another as often as desired during the turn before the attack.
- resources/cards/en/swsh12.json: Radiant Alakazam SIT 59 has Painful Spoons, which once during the turn may move up to two damage counters from **one** opposing Pokémon to another.
- resources/cards/en/sv8pt5.json: Dusknoir PRE 37 has Cursed Blast, which puts 13 damage counters on one opposing Pokémon and Knocks Out Dusknoir if the Ability is used.
- resources/cards/en/swsh6.json: Shadow Rider Calyrex V CRE 74 has 210 HP and its V rule awards two Prize cards when it is Knocked Out.

## Experiment A: isolated PRE Cursed Blast Prize exchange

Implementation:

- simulation/twinleaf/agent49-rank31-dusknoir-cursed-blast-native.cjs
- tests/agent49-rank31-dusknoir-cursed-blast-native.test.cjs

The test stages a Duskull PRE → Dusclops PRE → Dusknoir PRE evolution stack on the source Bench and selects the opponent's Shadow Rider Calyrex V CRE on Bench slot 1. The target begins at 80 damage. A real UseAbilityAction invokes Cursed Blast. The probe resolves the native target-selection and Prize prompts, then checks physical card locations and Prize counts.

The test asserts:

- Both source-seat variants reach and resolve the real Cursed Blast target prompt.
- The Shadow Rider V is physically in the opponent's discard.
- Duskull PRE, Dusclops PRE and Dusknoir PRE are physically in the source discard.
- The source takes two Prize cards (six remaining becomes four).
- The opponent takes one Prize card (six remaining becomes five).
- No pending prompt remains.
- The source Bench retains five physical slots; the self-KO leaves no occupied slot.

**Fixture correction:** the initial test incorrectly asserted source.bench.length === 0. The shared stagedPainfulSpoons() fixture preallocates five empty PokemonCardList Bench slots. The original failed run [42357354394](https://github.com/FlareZ123/experiment-01/actions/runs/42357354394) therefore failed before the Ability was dispatched. Appending the Dusknoir stack would also have created an invalid sixth slot while the action targeted Bench index 0. The corrected probe occupies the existing source.bench[0] slot and verifies the five-slot invariant.

**Compiled CI:** [manual workflow 42371075778](https://github.com/FlareZ123/experiment-01/actions/runs/42371075778) completed SUCCESS. The Dusknoir step passed both seats.

## Experiment B: legal Roxie/Koffing → BCR Sinister Hand → Painful Spoons → PRE Cursed Blast

Implementation:

- simulation/twinleaf/agent49-rank31-dusknoir-legal-transfer-cursed-blast-native.cjs
- tests/agent49-rank31-dusknoir-legal-transfer-cursed-blast-native.test.cjs

The board is staged with three opposing Shadow Rider Calyrex V Pokémon. The selected target on Bench slot 1 begins at 80 damage; opposing Active and Bench slot 0 begin undamaged. The source has Radiant Alakazam Active, a Dusknoir BCR evolution stack on Bench slot 0, and a Dusknoir PRE evolution stack on Bench slot 1.

The test performs these actual native Store transitions:

| Step | Native action / effect | Target damage | Other opposing source damage |
|---|---|---:|---:|
| Initial fixture | Target's prior 80 damage is staged | 80 | 0, 0 |
| Roxie / Koffing | Play Roxie CEC 205, discard Koffing CEC 76, resolve Blow-Away Bomb | 90 | 10, 10 |
| Dusknoir BCR | Sinister Hand moves one counter from opposing Active to target | 100 | 0, 10 |
| Radiant Alakazam | Painful Spoons moves one counter from opposing Bench 0 to target | 110 | 0, 0 |
| Dusknoir PRE | Cursed Blast places the printed 13 counters (130 damage) and Knocks Out Dusknoir | 240 expected | 0, 0 |

The two source Pokémon are different, but each transfer is performed by a separate Ability. The Painful Spoons response itself uses exactly one source Pokémon and passes the existing withPaperPainfulSpoonsSingleSource guard. The Roxie/Koffing transitions use the existing withRoxieTrainerDiscardType and withPaperRoxiePayment research adapters; the Koffing payment is a physically eligible non-GX/EX Pokémon. The BCR Dusknoir remains on the Bench after Sinister Hand. Dusknoir PRE and its evolution stack are discarded after Cursed Blast.

Both seat variants assert the target's intermediate damage values (90, 100, 110), physical discards, remaining BCR Dusknoir, resolved prompts, Prize counts (source 6→4, opponent 6→5), and net conditional Prize advantage +1.

**Compiled CI:** [manual workflow 42371758809](https://github.com/FlareZ123/experiment-01/actions/runs/42371758809) completed SUCCESS. Step 8, Verify legal rank31 BCR and Alakazam transfers into PRE Cursed Blast, passed both seats.

## Rules interpretation

The supplied advanced manual is preserved at resources/manual/EN_advanced_manual-2025-transcription-structured.md, section **D. Knock Out**. It says to begin the Knock Out process when a Pokémon's remaining HP reaches zero, apply effects triggered by those Knock Outs, discard the Knocked Out Pokémon and attached cards, and then have both players take the Prize cards they get from those Knock Outs.

The expected Prize exchange follows the printed card rules:

- Shadow Rider Calyrex V CRE is a Pokémon V, so its Knock Out awards two Prizes.
- Dusknoir PRE is a non-rule-box Stage 2, so its Knock Out awards one Prize.
- Cursed Blast explicitly Knocks Out Dusknoir PRE when the Ability is used.

The two Knock Outs are both resolved by the native Store in the staged tests, and the actual Prize prompts settle in both seat orientations. No Active Pokémon is Knocked Out in these fixtures, so Active-promotion order is outside the test.

## Relationship to the Painful Spoons paper guard

Agent4's prior result results/aichi-2026/agent4-rank31-radiant-alakazam-native-paper-single-source-20261101.md demonstrates that the pinned original Store accepts a paper-illegal Painful Spoons response drawing counters from two different source Pokémon, with a conditional two-Prize consequence. The opt-in withPaperPainfulSpoonsSingleSource hook rejects that reply before mutation.

This new experiment does **not** weaken or invalidate the one-source printed restriction. It shows a separate legal route for the particular staged board: Dusknoir BCR can move one counter from one source, and Painful Spoons can move one counter from a different source in its own single-source prompt. The two-Ability sequence is paper-consistent and passes the existing guard. It is therefore inaccurate to infer from the conditional illegal Painful Spoons two-source KO alone that rank31 must rely on that illegal reply to concentrate two counters.

## Evidence boundary

What is demonstrated:

- Exact original rank31 inventory counts for the used printings.
- Pinned Twinleaf native Store resolution of Roxie/Koffing, BCR Sinister Hand, legal one-source Painful Spoons, PRE Cursed Blast, both physical Knock Outs, and both physical Prize prompt sequences.
- Both physical player-seat orientations.
- A conditional +1 Prize exchange on a staged 210-HP two-Prize target.

What is not demonstrated:

- How rank31 generates the initial 80 damage on the selected target.
- A full physical 60-card source deck, source-dealt opening hand, shuffled game, or authentic opponent deck.
- Whether the sequence is reached at a useful rate, on schedule, or at acceptable resource / Prize cost in complete games.
- Any full-game win, matchup win rate, tournament result, or 99.5% Aichi Top 32 performance.

The result is a reproducible card-interaction and conditional Prize-settlement witness. It is not a competitive-strength estimate.
