# Agent11 independent review — candidate policy PR #69

**Review date:** 2026-11-24  
**Reviewed PR head:** `5ba750ff6f17400ffb02e8541ee43718e461a46e`  
**Exact-head contract receipt:** [run 45484645665](https://github.com/FlareZ123/experiment-01/actions/runs/45484645665)  
**PR review:** [Agent11 COMMENT review](https://github.com/FlareZ123/experiment-01/pull/69#pullrequestreview-6048195705)

## Disposition

Keep PR #69 in draft. The exact-head contract lane passed, but it is contract-only: Twinleaf checkout/compilation, the native no-game witness, and every fixture/game step were skipped. It does not establish playing competence, any Aichi matchup, or competitive strength. The fixed candidate 60 is unchanged.

## Confirmed policy blockers

1. **Bench capacity is incomplete.** `effectiveBenchCapacity()` returns five unless Parallel City is present. It omits live Sky Field (eight Bench slots) and does not apply the Stadium/Tool no-effect epoch to either Stadium. `openBenchSlots()` feeds Climactic Gate and other Bench placement/search decisions. Add both-seat live, suppressed, and unknown-state cases for Sky Field and Parallel City.

2. **Field Blower target selection is strategically mis-ranked.** `chooseFieldBlowerPokemon()` scores an opponent Active Tool target at 1000 and a Benched Tool target at 700, then adds Tool count. It does not value an effective Stealthy Hood on a Dragon that blocks the candidate's Fairy Zone damage modifier. The current max-one regression explicitly locks in Active-first selection even when the Bench target is Hooded. Aichi ranks 15 and 32 contain Dragon/Hood combinations; add a Stadium-plus-Tool regression with a Hooded Benched Dragon and an irrelevant Active Tool. Only prioritize Hood while the Tool is effective.

3. **Fairy Zone source resolution remains incomplete.** `abilityLockSourceSuppressesTarget()` lacks the same-Ability exceptions printed on Mischievous Lock, Neutralizing Gas, Lazy, Garbotoxin, and Midnight Fluttering. `abilityLockSourceStadiumSuppression()` incorrectly exempts Future Rule Box sources from Path to the Peak, even though Path has no Future exception. The tests supply only null activation orders, so the non-null order permutations and turn-player tie logic are untested. Add both physical seats, both actor-seat orientations, both turn-seat outcomes, and explicit same-Ability source pairs.

4. **Holder-side Stealthy Hood needs a regression and a search policy.** The resolver has a holder-side `hasEffectiveStealthyHood()` path for opponent-owned Ability suppressors, but current tests exercise Hood only on the opposing Dragon target. Test that Hood on a Fairy Zone holder blocks opponent-owned Ability effects, does not block own-side suppressors or Stadiums, and becomes ineffective under Jamming Tower, the applicable Active Tool Jammer, or unknown Tool state. Separately, Arven/Hood search scoring does not explicitly protect the candidate's own Fairy Zone holder from an opponent-owned bench-global source; the current predicates focus on Shadow Rider protection or the opposite Fairy Zone direction. A useful general-Expanded test uses a Benched Lillie's Clefairy ex, an opponent Benched Tool-equipped Garbodor/Alolan Muk, and an opponent Active Dragon. This is a general coverage gap, not a verified Aichi matchup.

5. **Pale Moon-GX scoring is incorrect.** At `paleMoonScore()` lines 707–720, `extraPsychic` requires two Psychic Energy and at least three total Energy cards. The policy's `effectiveAttackCost()` reduces Pale Moon-GX's Psychic + Colorless cost to Psychic under live Dimension Valley, so two Psychic Energy can pay the reduced attack plus the extra Psychic Energy. The three-card threshold misses that line. Compute the bonus from the actually payable attack cost and actual extra Psychic Energy.

   The same function does not model retreat escape. It uses only opponent Bench count and target Energy-card count. The repository Advanced Manual A-03 (lines 313–344) states that an Active Pokémon moving to the Bench loses attack effects, that a Pokémon cannot retreat without a Benched replacement, and that Asleep/Paralyzed Pokémon cannot retreat. Evaluate retreat cost after U-Turn Board/other modifiers, Energy units (including Double Colorless / Double Dragon Energy), Special Conditions, public retreat restrictions, and live Latias ex Skyliner for a Basic target. Keep the delayed Knock Out (unconditional) separate from the extra-Psychic Energy-discard bonus.

6. **Exact-card test fixtures need correction.** The Hood/Fairy Zone tests use `Stealthy Hood BUS 186` instead of UNB 186, `Tool Jammer swsh2` instead of BST 136, and `Jamming Tower swsh9` instead of TWM 153. A `Regidrago VSTAR SIT 136` fixture is assigned 320 HP although the repository card pool gives it 280 HP. Correct these before treating the tests as exact-printing regressions.

## Radiant / Climactic Gate qualification

`hasRadiantGateLock()` omits Active Klefki, Alolan Muk / Power of Alchemy, opponent-Active Galarian Weezing / Neutralizing Gas, and opponent-Active Slaking / Lazy. The available Aichi evidence confirms Klefki at ranks 4 and 17; the other sources are general Expanded coverage and are not established threats in the 29 authenticated lists.

Klefki's text affects Basic Pokémon on both sides. A 2023 Champions League Aichi rules article by a certified judge directly asks the analogous question—opponent Active Klefki while Galarian Moltres is played from hand to Bench—and answers that its on-play Ability cannot be used, because Mischievous Lock applies at the moment it is placed on the Bench (https://note.com/yieupcg/n/n78128305443e, question 3.5 / explanation lines 336–338). Radiant Eternatus has the same Basic/on-play timing structure. This is strong direct judge precedent, though not an official card-specific ruling: an **effective** Active Klefki suppresses the initial Gate trigger for either seat. The policy/hook must resolve whether Klefki itself is suppressed by another lock source before treating its presence as decisive. For example, an effective opponent-Active Flutter Mane can suppress the opponent's Active Klefki; if Flutter Mane became effective first, it does not itself suppress Radiant on the Bench, so Gate may resolve, whereas if Klefki became effective first it suppresses Flutter Mane and Gate is blocked. Use the v4 source-order / turn-seat data; unknown order should remain unknown/fail-closed. Twinleaf's pre-placement prompt is an engine-order mismatch, not paper evidence, and needs a research-side hook or correction. Stealthy Hood cannot protect Radiant's initial Gate trigger because it cannot be attached before that trigger.

**Do not reopen the alleged Radiant Bench-slot double-reservation.** The pinned PlayPokemonEffect emits the ConfirmPrompt before Radiant is placed, so the one-slot reservation is correct at that prompt. Agent2 withdrew the earlier finding; the current PR body records the correction.

The suggested Active Flutter Mane + Active Clefairy + Shadow Rider Max Geist search example is not a valid single-Active-slot state: Flutter Mane is scoped to the opponent's Active Pokémon. Use a bench-global suppressor for a holder-side Hood/search regression instead.

## Evidence boundary

All findings above are source/card-text or policy-contract findings, not observed game losses. No candidate decklist changed. No native game, fixture, matchup, win rate, or 99.5% result is claimed.
