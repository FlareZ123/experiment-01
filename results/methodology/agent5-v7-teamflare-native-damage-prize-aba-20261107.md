# Agent5 v7 Team Flare native damage, Knock Out, Prize and promotion audit

**Status:** completed retrospective native-engine forensic replay. This is a single historical matched-deal trace. It is not a competitive match sample, a deck-strength estimate, or evidence of a 99.5% win rate.

## Question

After resolving the actual Team Flare Grunt owner prompt, does the pinned Twinleaf Store apply the intended physical Energy discard, and can the resulting Energy Drive damage, Knock Out, Prize-card transfer and promotion sequence be observed on the same unchanged physical deal?

## Provenance and reproduction

- Manual workflow run: [42371350624](https://github.com/FlareZ123/experiment-01/actions/runs/42371350624), run number 4.
- Workflow-head research revision: a7681377c8200e62c75c2b3271c50ff76921ef7a.
- Pinned Twinleaf revision: a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.
- Registration: [agent5-v7-teamflare-damage-prize-aba-v4-20261107.json](../aichi-2026/registrations/agent5-v7-teamflare-damage-prize-aba-v4-20261107.json).
- Raw machine-readable result: [run 4 JSON](../aichi-2026/forensics/agent5-v7-teamflare-damage-prize-aba-v4-run-4.json).
- Result checksum: [SHA-256 sidecar](../aichi-2026/forensics/agent5-v7-teamflare-damage-prize-aba-v4-run-4.json.sha256).
- Runner: [agent5-v7-teamflare-damage-prize-aba-v4.cjs](../../simulation/evaluation/agent5-v7-teamflare-damage-prize-aba-v4.cjs).
- Attack observer: [agent5-native-attack-damage-observer.cjs](../../simulation/twinleaf/agent5-native-attack-damage-observer.cjs).
- Physical Team Flare witness: [agent5-v7-teamflare-physical-witness.cjs](../../simulation/twinleaf/agent5-v7-teamflare-physical-witness.cjs).
- Independent Prize custody observer: [agent3-owner-ko-prize-settlement-evidence.cjs](../../simulation/twinleaf/agent3-owner-ko-prize-settlement-evidence.cjs).
- Manual workflow: [agent5-teamflare-damage-prize-audit.yml](../../.github/workflows/agent5-teamflare-damage-prize-audit.yml).

The registered cohort contains eight trials, replayed in A, B and ARepeat phases for 24 native attempts. Each attempt retained its 96-root limit. The target was 6:201:B:champion-reference, with source seat 0, candidate seat 1, seed 2732132720 and a turn-5 intervention. The original decks and trial identities were unchanged.

## Reproducibility gates

All registered attempts returned a row. Each phase contained six returned-unqualified matches and two engine-error matches. No match reached a native terminal. The target match reached its 96-root cap in all three phases.

The following checks passed:

- All initial physical deals were identical across the three phases.
- The target treatment physical deal matched its control deal.
- The A and ARepeat target public-root tapes were identical.
- The A and ARepeat target attack-observation tapes were identical.
- The generic owner-prompt handler reproduced the frozen v2 target public root.
- One Team Flare root was physically accepted and its owner prompt settled.
- The source-side owner-prompt provenance and same-deal checks passed.

The target root SHA values were:

| Phase | Target root SHA-256 |
| --- | --- |
| A | 7595a416b33efe8d741de8efe2478473f714161ede1974ebb35d0b0073779466 |
| B | 585a0644f7451c393e5cbab916fe8e057eae33bc4bfc29fb731c646b116f3e0e |
| ARepeat | 7595a416b33efe8d741de8efe2478473f714161ede1974ebb35d0b0073779466 |

The control repeat therefore reproduces the original public root and attack trace exactly.

## Card-text cross-check

The local card pool lists Team Flare Grunt XY1-129 as Expanded legal. Its effect discards an Energy attached to the opponent's Active Pokémon.

Tapu Lele-GX SM2-60 is Expanded legal. Energy Drive does 20 damage for each Energy attached to both Active Pokémon, and its printed text excludes Weakness and Resistance.

Iron Thorns ex SV6-77 is Expanded legal and has 230 HP.

The observed native DealDamageEffect values match the Energy Drive formula for the public Active Energy counts in every recorded attack.

## Physical Team Flare settlement

The B root at global turn 5, action ordinal 32, played Team Flare Grunt. The following root action resolved the ChooseCardsPrompt. The source then passed. The generic owner handler proposed and settled one real Energy choice.

The physical receipt identifies:

- Original source seat: 0.
- Team Flare Grunt printing: Team Flare Grunt XY.
- Opponent Active before the effect: Tapu Lele-GX GRI.
- Original Active Energy: two Psychic Energy MEE cards.
- Exact physical card moved to the source discard: Psychic Energy MEE.
- The original Flare card left the source hand and reached its discard pile.
- The owner prompt was accepted and settled.
- The observer did not inspect the opponent's concealed hand or other concealed zones.

The target B root window shows the Team Flare Grunt PlayCardAction at ordinal 32 and its ChooseCardsPrompt resolution at ordinal 33. In the control A root, ordinal 32 is PassTurnAction. The candidate later plays a Psychic Energy at turn 6. The treatment Active nevertheless remains one Energy behind the control during the following three Energy Drive attacks.

## Native Energy Drive damage and Knock Outs

Each row below uses the native DealDamageEffect value and the public Energy count immediately before the attack. The source Active has one Energy throughout these four attacks.

| Phase | Global turn | Candidate Active Energy | Total Active Energy | DealDamageEffect | Target damage after attack | Knock Out |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| A | 4 | 2 | 3 | 60 | 60 | No |
| A | 6 | 3 | 4 | 80 | 140 | No |
| A | 8 | 4 | 5 | 100 | 240 | Yes |
| A | 10 | 4 | 5 | 100 | 100 on promoted Active | No |
| B | 4 | 2 | 3 | 60 | 60 | No |
| B | 6 | 2 | 3 | 60 | 120 | No |
| B | 8 | 3 | 4 | 80 | 200 | No |
| B | 10 | 3 | 4 | 80 | 280 | Yes |
| ARepeat | 4 | 2 | 3 | 60 | 60 | No |
| ARepeat | 6 | 3 | 4 | 80 | 140 | No |
| ARepeat | 8 | 4 | 5 | 100 | 240 | Yes |
| ARepeat | 10 | 4 | 5 | 100 | 100 on promoted Active | No |

In A and ARepeat, the first Iron Thorns ex reaches 240 damage after three Energy Drive attacks and is Knocked Out on turn 8. In B, it receives 60, 60, 80 and 80 damage, reaching 280 and being Knocked Out on turn 10. The treatment therefore lowers the damage by 20 on turns 6, 8 and 10, adds one Energy Drive attack to the first Knock Out, and delays that Knock Out by two global turns.

The A and ARepeat turn-10 attacks target the newly promoted Iron Thorns ex. They are not part of the first Active's 240-damage total.

## Prize transfer and promotion

The native KnockOutEffect identifies the seat-0 Active Iron Thorns ex as the target. Its damage immediately before the Knock Out is 240 in A/ARepeat and 280 in B. The associated Prize prompt is owned by candidate seat 1 and selects two physical Prize cards.

| Phase | Candidate's first Prize prompt | Physical cards selected | Cards transferred to owner hand | Source seat's later Prize prompts |
| --- | ---: | ---: | ---: | --- |
| A | Turn 8 | 2 | 2 | Turn 11: 2; turn 15: 1 |
| B | Turn 10 | 2 | 2 | Turn 11: 2; turn 15: 1 |
| ARepeat | Turn 8 | 2 | 2 | Turn 11: 2; turn 15: 1 |

For each phase, the independent Prize observer recorded three resolved Prize selections, three exact owner-hand transfers, zero transfers to a Lost Zone and zero other or unverified destinations. The source-seat ChoosePokemonPrompt also resolved, promoting Iron Thorns ex TWM from the Bench into the Active position.

The Prize observer explicitly leaves two stronger claims uncertified: Knock Out source-origin completeness and paper-rule Prize-redirection certification. Its physical custody evidence establishes the recorded card movement and prompt resolution. It does not independently certify every preceding rule condition.

## Interpretation

On this exact matched physical deal, Team Flare Grunt removes one Psychic Energy from the opponent's Active Tapu Lele-GX. The following Energy Drive damage is reduced by 20 per attack while the candidate remains one Energy behind the control. The first Knock Out and two-card Prize transfer occur on turn 10 instead of turn 8.

The effect is tactically measurable and repeatable in A/B/A. It does not change the final observed Prize vector, which is [3,4] in all phases at the 96-root cap. No phase has a native winner. This is evidence about one historical decision and its engine-resolved consequences, not evidence that the candidate deck is stronger across a matchup or across the Aichi field.

## Measurement limitations

- The cohort was selected retrospectively around a known Team Flare root. It is not a prospective sample.
- All 24 attempts stopped at the 96-root cap or an engine error. There were zero terminal games and zero competitively qualified games.
- The opponent policy is not independently validated as a competent adversarial player.
- No official 25-minute paper clock or tournament adjudication was applied.
- The Prize observer reports knockoutSourceOriginFullyCertified=false and opponentPrizeRedirectionPaperCertified=false.
- The v1 physical-witness helper's nativeError field is not scoped to the Team Flare action. It logged NOT_ENOUGH_ENERGY later in its observation window, while the target Team Flare root itself had one accepted Store root and zero rejected Flare roots. The generic prompt audit recorded one settled real Energy choice, and the attack observer recorded the subsequent Energy Drive attacks. Do not attribute that later error to the Team Flare root.
- The v1 attack observer's observedDamageEffects summary counts multiple nodes in the damage pipeline. The table above uses the individual DealDamageEffect records. For non-KnockOut effects, its victimSeat field reflects effect.player, which can be the attacker; the target.seat field identifies the actual damaged slot.

**Competitive games qualified: 0. Estimated win rate: none. Final-deck nomination: unchanged.**
