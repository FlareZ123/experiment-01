# Registered Powerglass end-turn versus pending KO Prize semantics

**Agent 3, 19 October 2026, before any trial.** Mechanistic rules-fidelity investigation, no qualified gameplay samples.

## Motivation

The genuine source-dealt published Aichi rank-11 versus provisional New Moon reports already preserve one copied-Poltergeist KO followed by a **Powerglass** `AttachEnergyPrompt` and only then a `ChoosePrizePrompt` (Agent35 turn22, source CI 39157953757). In a separate authentic source continuation, the final Prize and engine win occur during resolution of an `AttachEnergyPrompt` (Agent13 turn50, source CI 39173019118). Prompt order alone cannot distinguish genuine Prize timing from deferred UI bookkeeping.

The supplied **Advanced Player's Rulebook v3.4**, A-01 Attack steps4–7, D Knock Out steps1–4 and E-21 end-of-turn effects, establishes a default paper ordering of attack damage/effects, KO and Prize-taking, and only then Powerglass's optional end-turn Energy attachment.

## Frozen source and proposed staged Store test

- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` with no vendor edits, compile through the existing manual `aichi-powerglass-energy-filter.yml` workflow.
- Construct one controlled live Store with two players, full six nonempty Prize groups apiece, Active source player **Mewtwo & Mew-GX UNM** equipped with **Powerglass SFA**, a legal **Basic Psychic Energy MEE** in discard, and an opponent's Active **Shadow Rider Calyrex V CRE** at zero remaining HP and a healthy Benched Pokémon. Board is a *post-lethal-damage pre-turn-end state*, not an autonomous game. Keep the same player/deck/prize entities in two separately instantiated arms.
- Run the same `EndTurnEffect` to model the attack's end-of-turn transition, once **with** Powerglass and once **without** the Tool. Inspect the immediate pending prompt, opponent's knocked-out Active presence, both Prize counts and end phase. With Powerglass, legally answer its `AttachEnergyPrompt` selecting only the Basic Psychic Energy. Observe whether Prize cards were already taken *before* Energy moved, and what prompt occurs next. The without-Tool control is expected to immediately expose a `ChoosePrizePrompt`.
- Record anonymized physical counts, prompt kinds, outstanding KO/reward state, basic attachment and game-phase transitions. No opponent hidden card identities or Prize faces required.
- **Falsification:** if a Powerglass-enabled arm has completed the Prize award before Energy attachment, the previous source root ordinal sequence alone did not demonstrate an engine paper-order defect; report negative. If it physically attaches Energy while Prize award remains pending after a KO, report a reproducible semantic ordering issue confined to this state class.

Relevant pinned code path to challenge: `Store.reduceEffect` applies card-specific `propagateEffect` before `gamePhaseReducer` on `EndTurnEffect`, thus Powerglass may create an attach prompt before `gamePhaseReducer` calls `checkState`. The `checkState` generator yields when any prompt is pending between KO resolution and Prize choice. The program should verify actual outcomes rather than inferring solely from source review.

This test represents **zero natural games** and **zero competitor-quality evidence**. All 29 known source lists and three missing ranks are unaffected. Any inference about all 32 matchups, tournament clock, or the 99.5% target is prohibited.
