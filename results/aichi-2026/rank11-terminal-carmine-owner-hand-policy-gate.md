# Rank-11 final-hand policy gate: held Carmine before terminal Poltergeist

**Agent 14, 18 October 2026.** This report isolates a real *opponent decision opportunity* in one source-dealt engine game previously selected for a favorable New Moon terminal. No independent competitive win is established.

## Immutable source and observation

- Exact Aichi 2026 rank-11 Absol/Garbodor source 60 versus unchanged New Moon Lockbreaker English **mechanics-proxy** 60; main deck identity hashes `ca1a7ce02983c438146f30bf01f303cf8210836f9e442e0d21a2513850ffcb18` and `7e9db4be171ba050342e7814555b0e9e05b8dc87b0ed16d61e1ffa386de2a95b`.
- Actual rank11 first (physical A/0), New Moon second (physical B/1), verified source original draw log, seed `1111464409`. The seed was selected **retrospectively** from a favorable complete engine game; never add it to a prospective win-rate denominator.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Existing native-Gengar opening pivot is enabled and other reported policy guards are preserved. Code `simulation/twinleaf/rank11-lastturn-hand-window.cjs` is read-only; unlike the follow-up counterfactual, it changes no actions.
- [Manual compiled workflow 39163698223](https://github.com/FlareZ123/experiment-01/actions/runs/39163698223), source head `334fa4cab172277535da5f108dafa406bcbaf867`, passed the targeted source rank11 turn35 hand-inventory step. Artifact `rank11-lastturn-ownhand-positive-control`, ID **12150131443**, raw ZIP SHA-256 `1c10f5a2358b55c1810be58ec61e0f2ee921ace8ac8e2242b1835bcf7e441035`. Source JSON contains exact own-hand decision records, public board and terminal attack attribution.

## Observed decision, before any intervention

At global turn **35**, rank11's real root ledger had a preceding WaitPrompt resolution at ordinal **266**, its selected **PassTurnAction** at ordinal **267**, and a turn-ending WaitPrompt resolution at ordinal **268**. No Supporter or other card was played during that turn. The agent's *own-hand* evidence at the selected Pass, never inserted into the decision policy, was:

| Rank11 own-hand printing | Quantity | Relevant class |
| --- | ---: | --- |
| Oranguru V ASR | 1 | Pokémon |
| Temple of Sinnoh ASR | 1 | Stadium |
| Carmine TWM | 1 | Supporter |
| Boost Shake EVS | 2 | Item |
| Trubbish FST | 1 | Pokémon |
| Secret Box TWM | 1 | Item, ACE SPEC |
| Escape Rope BST | 1 | Item |

Rank11's Active was **Mega Absol ex** with **280 printed HP**, **zero damage**, one attached Darkness Energy and a Float Stone. Its Benched **Garbodor had no Tool** and thus did not establish the cited Tool-gated Garbotoxin lock. The candidate Active was Mewtwo & Mew-GX with three attached Energy cards. Original rank11's player also had Shopping Center in play.

In the following global turn **36**, candidate owner-selected Perfection copied **Gengar & Mimikyu-GX TEU Poltergeist**, at root ordinal **272**. As [Agent 35's source printed-multiplier audit](../twinleaf/poltergeist-source-printed-multiplier-audit.md) documented independently, the six Trainer cards in rank11's hand yielded a printed base of **300** damage, sufficient for the undamaged 280-HP Mega Absol; the Store then awarded the candidate its last Prize at root 273. The mechanical KO depends on a six-Trainer threshold **absent other damage modifiers**: five Trainers would give only 250 base damage.

This establishes a **strategic sensitivity**, not the legality or strength of an alternative. The fact that a Supporter remained in hand and the recorded turn contained no played Supporter is observable. Whether Carmine could be used on that exact board also depends on the source deck count, support-use marker, active effects and engine implementation.

## Predeclared concrete falsification

The pinned Carmine TWM card's text is “Discard your hand and draw 5 cards,” and its engine `canPlay` implementation checks the turn's prior Supporter marker and nonempty deck. On the next exact-source experiment, `simulation/twinleaf/rank11-turn35-carmine-counterfactual.cjs` changes only the original source owner's turn35 **PassTurnAction** to a real `PlayCardAction` for the actual held Carmine *if* all current source-observable legal gates pass. This is explicitly a **forced owner-information-correct counterfactual**, not an autonomous bot ability. It must preserve all root actions before ordinal 267, the original decks, seed and actual start. It will record source deck availability, support-use marker, the legal selected action, candidate's response, and resulting terminal. The decisive question is whether the previous six-Trainer lethal is robust to this one genuine legal alternative. Never count the alternate branch as an independent game.

The intervention workflow is manual only, with no per-commit CI trigger. The code path is `simulation/twinleaf/rank11-turn35-carmine-counterfactual.cjs`; the CI job is in `.github/workflows/aichi-lock-board-tests.yml`. At this writing the alternate has been dispatched but remains **unverified**. Once it resolves, add its exact artifact and distinguish any engine change from paper legality, human opponent competence and broad matchup inference.

## Qualification boundary

The opposing SimpleTacticsAi policy is known to miss legal strategic actions elsewhere, and the favorable seed was selected after outcomes were observed. Printed card timing, all attack modifiers, official 25-minute paper-match clock and full source-policy competitiveness remain unqualified. The tournament field still has **29/32 exact lists, zero qualified competitive games and no demonstrated fixed-deck 99.5% win rate**.
