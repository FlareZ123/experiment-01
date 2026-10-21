# Rank-11 source-first Rope: energy-development diversion within one original Store deal

**Agent 17, 21 October 2026. Evidence type:** independently downloaded and inspected original, same-checkout, source-first development artifact. This is a fixed historical replay and **zero competitive-qualified games**.

## Provenance and reproduction

- Original manual run: [39668297155](https://github.com/FlareZ123/experiment-01/actions/runs/39668297155), artifact [12378308188](https://github.com/FlareZ123/experiment-01/actions/runs/39668297155/artifacts/12378308188).
- Independently downloaded ZIP SHA-256: `9f2ac75ab15d6dc97af04540b09e14729d618b0fe16230b72336b7ddb2bf7b7f`, size 160,776 bytes.
- Same ZIP contains `agent8-near-term-no-ace-sourcefirst.json` (control) and `agent42-escape-rope-sourcefirst.json` (treatment). In each, select `rows[].trial.id === "11:retrospective-sourcefirst:2:B:new-moon-lockbreaker-v1"`.
- Both report the same physical source-deal fingerprint `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`, seed `482443328`, actual source seat 0 starting first and candidate seat 1.
- The initial **38 full post-Store root records (ordinals 0 through 37)** match, including order and contents; original root 38 is the candidate's T6 Pass while treatment root 38 is a native accepted Escape Rope. Each root ledger's SHA-256 matches its own archived `rootActionLedgerSha256`.
- Independent strict offline comparison is implemented by [`scripts/agent17-rope-source-energy-census.cjs`](../../scripts/agent17-rope-source-energy-census.cjs), using original `actorOnlyDecisionCoverage.detailedComponentAudits.root.nativeRootAcceptances` and `sourceAttackSettlement`. Each observed attachment has `accepted: true`, `nativePhysicalEffect: "confirmed-public-effect"`, and a physical +1 source Energy-card count.

## Direct source-owner Energy history

| Global turn | Control recipient / actor's intended attack | Escape Rope recipient / actor's intended attack |
| --- | --- | --- |
| 5 | Active **Oranguru V ASR** / Psychic, policy gap 3→2 | Active Oranguru V ASR / Psychic, gap 3→2 |
| 9 | Active **Oranguru V ASR** / Psychic, gap 2→1 | Active **Garbodor BKP** / Offensive Bomb, gap 4→3 |
| 19 | Active **Oranguru V ASR** / Psychic, gap 1→0 | Active **Garbodor BKP** / Offensive Bomb, gap 3→2 |
| 23 | A **Benched Pokémon** / Call for Family, gap 1→0 | Active **Oranguru V ASR** / Psychic, gap 2→1 |

All eight observed actions are an accepted physical attachment of `Darkness Energy MEE` under the actual Store. The displayed attack cost gaps come from the bot's **intent scorer**, which is an observational policy estimate and is **not** a verified native attack-payability certificate. The Bench recipient at T23 was not separately identified by the recorder field used here, so none is invented.

The major outcome difference is more precisely explained than a generic \"Rope is strong\" narrative: in the unchanged development policy, the forced Garbodor promotion redirected the source's next two physically accepted basic-Energy attachments, at T9 and T19, away from its previously developed Oranguru. The original attached to Oranguru on those turns, and the actor's recorded Psychic funding gap closed to zero at T19. The Rope line attached to Garbodor and retained a policy gap of two after T19. By T23, the source was back to attaching on Oranguru with a gap of one.

## Native consequences and claim limits

- Original no-Rope control: **17 source declared attacks, 17 settled attacks**, 228 actions, engine terminal with source/candidate Prizes left `[0,6]` and source winner.
- Rope treatment: **0 source declared attacks, 0 settled attacks**, 175 actions, engine terminal with source/candidate Prizes left `[6,0]` and candidate winner.
- Both are one historically selected rank-11 physical source deal with one frozen policy and an experimental owner-visible branch; the game endings are untimed Twinleaf engine outcomes. They do not estimate competitive strength or a paper tournament win rate.
- The same native root observer does **not** record the full source owner's hand, every candidate mobility line, or each legal/available retreat and switching alternative. It is therefore **unproven that Garbodor was genuinely inescapable against a competent opponent**. Source 0-attacks may be strongly policy-contingent.
- Separate first legal Pokémon selection by the source switch resolver remains a known weak-policy concern; the chosen Garbodor was the sole available promotion in this observed T6 native prompt, so improving that specific T6 selection cannot change it.

## Falsification target

The next shared canonical common-policy experiment should first ask: **does a source-owned, actor-visible, legal recovery sequence after T6 restore an energy-funded attacker before the candidate closes six Prizes?** Validate every source Switch/retreat/attachment proposal in the actual Store, preserve the original source physical deal and the candidate's real replies, then repeat on genuinely fresh, registered both-start cohorts. A successful recovery would weaken the apparent deck-selection implication; a failed recovery on this one deal still would not validate general strength.

The larger research status remains **29/32 exact Aichi Top-32 source 60s**, ranks 23, 25 and 28 unavailable, zero competitively qualified games, and no verified 99.5% deck.

## Mechanistic refinement: type-unfundable Active target and lost Tool mobility

The exact rank-11 source 60 at `results/aichi-2026/full-decklists.json` has **eight basic Darkness Energy and no Psychic or Special Energy**. The provided card database printing `Garbodor BKP 57` has **Offensive Bomb [Psychic, Colorless, Colorless, Colorless]** and a **three-Colorless retreat cost**. Darkness attachments can fund Colorless symbols but cannot fulfill the printed Psychic requirement without some further effect. Thus T9/T19 `Offensive Bomb` attachment intentions advanced two generic Colorless units toward an attack **unfundable from the source's own Energy inventory alone**. The native heuristic `gapBefore/gapAfter` decreases correctly for generic slots yet does not establish that this route can ever finish.

A complementary public-tool sequence is directly preserved in the archived row: source T1 plays **Float Stone** then **Boost Shake**, completing Tool-equipped Garbodor; candidate T2 plays **Field Blower**, and the authentic `garbotoxinWindowAudit.after.sourceGarbodorHasTool` is false. Float Stone normally removes retreat cost, so the same Tool removal also removes that mobility option. When T6 Escape Rope forces Garbodor Active, its printed retreat cost is three Energy and it has lost the T1 Float Stone. The source's two later basic attachments to that Active are insufficient for ordinary paid retreat, assuming no other live retreat-cost reduction. This is a **Tool-removal + forced-promotion + stranded-Energy-development** sequence.

The rank-11 source list also includes **two other Float Stone copies, two Guzma and one Escape Rope**. Their actual post-T6 accessibility, concealed hand/prize positions and tactical use were not audited. Their presence means a competent source might possess or find a legal switching option, and the actual bot's inability to use one must remain a qualification blocker. The observed source root ledger shows no later plays of these mobility cards in this treatment.

The general policy failure mode to test is in `simulation/twinleaf/agent44-actor-energy-recipient.cjs`: it gives an unready Active printed attack priority over a Bench attack even if every possible held Energy only reduces Colorless portions of an otherwise type-unfundable cost. Here a Bench Oranguru with the original Darkness attachment could have received further Energy instead. A safe candidate correction would require **owner-observable future type feasibility and attack/promotion opportunity cost**, followed by original native Store and adversarial source-continuation testing. Changing the sort order alone is unvalidated and may harm other scenarios.

## Source-owner action coverage qualification

The generic owner-root decision implementation in `simulation/twinleaf/agent34-actor-only-root-policy.cjs` has no normal-turn intent for Float Stone, Guzma or Escape Rope; its `pass` maps directly to `PassTurnAction`. Its Powerglass Tool selector is specialized. The initial source T1 Float Stone came from the separate scripted Boost Shake setup. After T6 the generic policy therefore lacks a path to play a replacement Float Stone or Guzma from hand, even if available. This is a demonstrable policy-coverage limitation, with actual source hidden-hand availability still unknown. Test a source-owned legal mobility recovery before interpreting the historical terminal as deck strength.
