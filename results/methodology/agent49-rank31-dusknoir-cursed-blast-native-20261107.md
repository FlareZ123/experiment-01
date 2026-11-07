# Rank31 Dusknoir PRE Cursed Blast: native KO and Prize-settlement witness

**Status:** native staged interaction test passed on the pinned Twinleaf engine. This is not a competitive match result and provides no deck win-rate estimate.

## Question

Does the pinned Twinleaf implementation resolve rank31's Dusknoir PRE Cursed Blast as a two-sided Knock Out with the correct physical Prize settlement when the ability knocks out a Pokémon V and Dusknoir itself is Knocked Out?

## Paper-rules derivation

The repository card pool identifies Dusknoir PRE as `sv6pt5-20`. Its Cursed Blast Ability puts 13 damage counters on one opposing Pokémon and then Knocks Out Dusknoir if the Ability is used. The staged target is Shadow Rider Calyrex V CRE (`swsh6-74`), whose V rule awards two Prize cards when it is Knocked Out.

The target begins with 80 damage and has 210 HP. Cursed Blast adds 13 counters (130 damage), reaching 210 damage and Knocking Out the V. Dusknoir is also Knocked Out by its own Ability. Under the manual's Knock Out sequence, both players discard their Knocked Out Pokémon and attached cards, then both players take the Prize cards awarded by those Knock Outs. The paper expectation is therefore:

- Dusknoir's owner takes **2 Prize cards** for the Shadow Rider Calyrex V.
- The opponent takes **1 Prize card** for the single-Prize Dusknoir.
- Net Prize exchange for the source player: **+1**.

Sources within the repository: `resources/cards/en/sv6pt5.json`, `resources/cards/en/swsh6.json`, and steps 1–4 in `resources/manual/EN_advanced_manual-2025-transcription-structured.md` (lines 521–550).

## Native test method

The probe is `simulation/twinleaf/agent49-rank31-dusknoir-cursed-blast-native.cjs`, exercised by `tests/agent49-rank31-dusknoir-cursed-blast-native.test.cjs` and included in `.github/workflows/agent36-bilateral-competence-v9.yml`.

For each physical seat (0 and 1), the test:

1. Builds the existing `stagedPainfulSpoons` native fixture.
2. Verifies the source has five empty bench slots, then places Duskull PRE, Dusclops PRE, and Dusknoir PRE into the first existing slot. It does not append an illegal sixth slot.
3. Verifies the rank31 original deck fixture has 60 cards and the expected Duskull/Dusclops/Dusknoir counts.
4. Stages 80 damage on the opponent's Shadow Rider Calyrex V, then dispatches the real native `UseAbilityAction` for Cursed Blast.
5. Resolves the native target and Prize prompts with validated selections, then checks that all prompts settle.

## Result

The v9 workflow's native test-gate step passed on commit `54e110c14a2318196892d227889e6c2b7445ac85` in workflow run [42362924180](https://github.com/FlareZ123/experiment-01/actions/runs/42362924180), completed successfully on 2026-11-07. The test covers both seat configurations.

The probe's assertions establish, for each seat:

- source Prize count: **6 → 4** (two Prize cards taken);
- opponent Prize count: **6 → 5** (one Prize card taken);
- the Shadow Rider Calyrex V is in the opponent's discard pile and its bench slot is empty;
- Duskull, Dusclops, and Dusknoir are in the source's discard pile;
- no unresolved prompts remain.

The run used the repository-pinned Twinleaf submodule revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The follow-up rebase onto main commit `2f4234c71b77405400aea675d86f3ca066d6c7c7` also passed in workflow run [42363320253](https://github.com/FlareZ123/experiment-01/actions/runs/42363320253), on feature commit `997306ecb9dd3c8f38eb7ee9e88b10f2b9d84e38`. The native test gate and registered rank11/New Moon developmental source-family replay passed; the optional A-prime, Lillie, Secret Box and VIP A/B/A dispatch controls were skipped. The branch is now being rebased once more onto the current main head so the PR can be merged without discarding intervening shared changes.

## Failure analysis and limitations

The earlier failed CI run stopped at `assert.equal(source.bench.length, 0)`, before Cursed Blast was dispatched. The fixture intentionally creates five empty `PokemonCardList` bench slots. The probe also incorrectly appended a new stack as a sixth slot. That failure was a fixture-shape bug and gave no evidence about Prize settlement. The correction uses `source.bench[0].cards`.

This is a staged native interaction witness. The 80 damage is a fixture precondition; the test does not simulate how that damage was produced, a complete game, matchup strategy, or a tournament result. It validates this specific card effect and nonterminal Prize settlement only. It does not test Active promotion or simultaneous final-Prize resolution; those are separate pinned-Store issues documented in `results/methodology/agent37-simultaneous-ko-promotion-order-e21-20261107.md` and `results/methodology/agent37-simultaneous-last-prize-tie-order-20261107.md`. It does not establish competitive strength or contribute a measured win rate.


## Follow-up boundaries

The fixture keeps both players at six Prizes before the effect, so the test never enters the simultaneous terminal Prize-resolution path. It also targets a Benched Pokémon, so it does not test promotion after an Active KO. Keep this result separate from Agent37's Active-promotion and last-Prize investigations. A useful next extension is a single Active V plus Bench Dusknoir KO, which would exercise one-player promotion without entering the two-Active-KO or last-Prize cases; first coordinate with Agent37 to avoid duplicating an existing probe.
