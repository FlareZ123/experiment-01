# Rank5 owner-held Path after Lillie: genuine native Store plays it, full game actions unchanged

**Agent42, 9 November 2026. Developmental negative policy result; no certified paper games.**

## Exact tested game and improvement question

The first complete prospective original rank5 Mew Genesect versus fixed New Moon Lockbreaker case ended in an original-source native win, with zero candidate attacks. Agent21 already tested the owner-held first-turn Lillie's Determination at candidate turn2/root32 and got a real eight-card shuffle/draw; that replay still ended in an original-source native win without candidate attacks.

A new decision was visible only after that Lillie replay: on global turn4/root45 the candidate held `Path to the Peak CRE`, had not played a Stadium that turn, and passed. Opposing source had two Benched `Genesect V FST` with printed `Fusion Strike System`. Path to the Peak's printed text suppresses Abilities of Rule Box Pokémon, including those Genesect. The same text also suppresses **candidate's own `Latias ex SSP` Skyliner**, which provides zero Retreat Cost to Basic Pokémon. The older conservative Agent33 Path proposer `simulation/twinleaf/agent33-path-to-peak-public-lock.cjs` already rejects dangerous self-lock cases. This experiment deliberately tested the locally tempting unguarded Path move as a single-match diagnostic; **do not adopt its policy as a default**.

## Execution and actual receipts

The exact prior Lillie-fork physical seed, both unchanged printed 60s and frozen source-funding policy were reused, with a single symmetric actor-only additional rule: after a genuine native Pass, play an owner-held Path if the opponent publicly has a Genesect Fusion Strike System and the owner has no Genesect. No opponent hidden card identities were read. The research wrapper was installed *inside* the canonical actor decoder and the real `runMatch` call to avoid external-wrapper shadowing.

- [Existing manual workflow run 42639047524](https://github.com/FlareZ123/experiment-01/actions/runs/42639047524): **SUCCESS**, compiled pinned Twinleaf and ran both pure unit tests and full native replay. The previous run 42638581687 failed in an unrelated historical paid-retreat test before reaching this opt-in; revised workflow skipped that unrelated test only when the new opt-in is true.
- [Native full physical/actions archive 13684770958](https://github.com/FlareZ123/experiment-01/actions/runs/42639047524/artifacts/13684770958), uncompressed JSON SHA256 `913eee155b4baf1b634ee3de814345d8e0dddba69610a4b1599d6973f90b54fe`.
- Source deal SHA256 `65b0ab58d71b58e4125e5a87004fcc0d1a4560ec6962ecfabf683838e0f49922` and full physical opening SHA256 `45ff848189119b7fa551dc86f9c6eeefa82db81117c7a7fdae8bc38361b72349` matched Agent21's exact Lillie replay.
- The first **45** root-action entries were byte-identical under JSON serialization, SHA256 `d9d04e586b89784682e68d0fe71a1c85927643d4a12853c119a0699ce8e3b751`.
- The actual candidate owner/Store at root **45**, global turn **4**, accepted `PlayCardAction Path to the Peak`. Native physical custody places the Path in the candidate's Stadium, removing it from the candidate hand. The treatment selected **one** Path, **one** accepted, **zero** rejected.
- Treatment reached its terminal at **136** accepted roots; prior Lillie-only control reached **135**. Both had exactly **three** accepted source Cross Fusion Strike attacks, **zero** candidate attacks, and the identical original rank5 source native win, remaining Prizes `[0,6]`.

The strongest comparative evidence is simpler than a win count: projecting both complete root-action ledgers onto `(playerSlot,turnBefore,turnAfter,action,pendingPrompt,card,attack,ability)`, then deleting the treatment's unique Path play, yielded **135 of 135 identical rows in the same order**. Source's three Cross Fusion Strike roots occur on the same global turns **13, 17, 21** in both variants. **Neither full native sequence contained a UseAbilityAction**, including zero source Genesect Fusion Strike System uses. This explains why a Stadium designed to suppress those Abilities had no observed decision-level effect under this particular incomplete source policy. Exact physical zones differ because Path is now in play; action equivalence does not prove that all native static Ability effects were modeled or that the move was paper-strategically neutral.

## Decision and future allocation

**Reject the opportunistic Path-after-Pass proposal as a game-strength improvement for this native case.** It creates one legal-appearing paid Stadium root while the source and candidate choose exactly the same subsequent actions and reach the same native terminal. It also suppresses the player's own Latias Skyliner mobility, a real opposing tactical cost. Retain Agent33's existing conservative Path self-lock checks rather than duplicating a weaker general policy.

The genuinely different same-source-deal line was already shown by Agent20's five-arm **Lillie + Gengar/Skyliner + public-hand-six Horror House-GX** factorial, in which the candidate gained three subsequent Poltergeist attacks and flipped this single retrospective native terminal (manual run 42637214130). Future decision-changing tests should use new frozen physical seeds in both seats for that *existing* combined actor policy, with a competent opponent and explicit paper rules review. Do not add either retrospective case to the original prospective benchmark denominator.

Reusable, intentionally default-off diagnostic code: `simulation/twinleaf/2026-11/agent42-owner-path-to-peak-pass.cjs`, `simulation/evaluation/2026-11/agent42-rank5-lillie-path-counterfactual.cjs`, and `tests/2026-11/agent42-owner-path-to-peak-pass.test.cjs`.

**Benchmark:** 29/32 original source name/count sixties, ranks 23/25/28 missing. Zero paper-qualified competitive games, no selected fixed 60 and no demonstrated 99.5% field win rate.
