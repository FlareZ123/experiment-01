# Field Blower's rank11 Garbotoxin break is transient: original rank11 bot itself searches and re-equips Float Stone on turn 3

**Agent 1 | 1 November 2026 | one authentic retrospectively selected source 60 physical deal; two real original-Store arms | zero competitive-qualified games.**

## Decision question

In an original rank11 Wataru Yano Absol/Garbodor versus original rank1 Yasunori Kato Shadow Rider game, the rank11 source's owner-selected first-turn Oranguru V -> Back Order / Forest Seal Stone / Star Alchemy / Battle VIP Pass / Trubbish / Float Stone / Boost Shake native plan established Garbotoxin. The rank1 opponent's **actually held** Field Blower GRI removed Float Stone on its next turn, leaving Garbodor without a Tool at the rank11 source's first turn-3 owner decision root (see [independent six-deal two-owner finding](agent1-owner-conditional-two-seat-starvip-blower-native-20261101.md)).

The next unresolved tactical problem was whether the original rank11 source can **restore the same lock** during its next turn. An apparently successful Item countermeasure can overstate strategic durability if the original source reestablishes Garbotoxin before the opponent's subsequent turn.

## Frozen physical comparison and negative control

[Native two-arm executable](../../simulation/evaluation/agent1-rank11-turn3-return-retool-pair.cjs) uses both unchanged, authentic source 60s, original pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and **the exact original K0 physical index 299 seed 2387754768** from the registered six-source setup frame. Its source original K0 hand SHA-256 and Bench, first-player authentic physical receipt, 11 settled source plan steps and one publicly verified opponent Tool removal are asserted in *both* arms.

- **Control:** use the first-turn owner K0 source plan and owner's Field Blower opponent response, then let the original generic source bot decide its actual turn-3 actions.
- **Treatment:** preserve the same first-turn source and opponent policies, but offer a new default-off owner-visible source restoration action at the first genuine turn-3 root, when Garbodor has no Tool. An experiment callback accepts that restoration offer; a source-owned Oranguru V uses Back Order, selects Float Stone from only its **legitimately exposed owner-deck ChooseCardsPrompt**, and targets its untooled Garbodor with the actual native PlayCardAction.

The repair adapter is in [the pre-existing source-owner module](../../simulation/twinleaf/agent1-owner-oranguru-starvip-native.cjs), under `chooseReturnRepair` which defaults to false. It never looks at opponent-private information or at its own unknown deck before the native search prompt. It checks acceptance of each proposed action in the real Store, then verifies the source's public Bench after attachment. It changes no card counts and no vendor code. Source's first-turn source policy is identical in both arms.

## Native evidence and precise outcome

The first independently compiled [manual CI 41346579148](https://github.com/FlareZ123/experiment-01/actions/runs/41346579148) **SUCCESS**, with original source hand/Bench K0, actual opponent Field Blower and 2/2 turn-3 return roots. The source repair treatment selected one candidate, accepted exactly **three genuine native Store actions** (UseAbilityAction Back Order, ResolvePromptAction own deck choice of Float Stone BKT, PlayCardAction attaching it), and had **one positive post-attach public Tool check**. Zero native exceptions or plan aborts.

The augmented [manual CI 41346893649](https://github.com/FlareZ123/experiment-01/actions/runs/41346893649) **SUCCESS** at tested head `c1953d289ec633b006c7bc70237d7e5ae07fbddb`, full [two-arm artifact 13099413867](https://github.com/FlareZ123/experiment-01/actions/runs/41346893649/artifacts/13099413867), ZIP digest `sha256:dd31099dc2d108b596796875aa9f0cbaaa2d08e4525ff7d181642d86af080f9e`. The recipient's **authentic first owner root on turn 4** supplies an independent read-only *public* post-source-turn Tool recipient receipt.

| Evidence checkpoint | Original rank11 bot control | Opt-in owner-conditioned repair |
| --- | --- | --- |
| Same original K0 physical 60s and source first-turn completed setup | Passed | Passed |
| Opponent's genuine turn-2 Field Blower Store play/removal | 1 / confirmed | 1 / confirmed |
| Garbodor Tool attached at source's first turn-3 owner root | No | No |
| Source turn-3 native action sequence (named roots) | Attach Darkness Energy, Back Order, attach Float Stone | Back Order, attach Float Stone, attach Darkness Energy |
| Extra repair module Store accepts | 0 | 3 |
| Garbodor Tool visibly attached at opponent's first turn-4 owner root | **Float Stone BKT** | **Float Stone BKT** |

This is a genuine **negative result for a purported recovery-policy improvement**: the unchanged original bot **already used Back Order and physically re-equipped Garbodor with Float Stone on its first return**. The intervention changes the ordering of those named source actions. Both source boards had the same Tool-equipped Garbodor at the next opponent root. No claim is made that every other public/private game detail, intermediate board or future outcome was identical.

## Actual owner's Back Order source-deck search multiplicity

An expanded prompt-identity audit [manual CI 41347488577](https://github.com/FlareZ123/experiment-01/actions/runs/41347488577), **SUCCESS**, archive [13099139027](https://github.com/FlareZ123/experiment-01/actions/runs/41347488577/artifacts/13099139027), selected cards only from the actual source **owner-deck ChooseCardsPrompt**, rather than inferring search from the PlayCard names:

- **Generic baseline:** `Back Order` owner search `CHOOSE_CARD_TO_HAND`, native min0/max2, **selected [Float Stone BKT, Float Stone BKT]**.
- **Scripted opt-in recovery:** Same actual native prompt and original physical setup, **selected [Float Stone BKT]**.

One Float Stone went onto the Garbodor in both arms. The original bot's selection kept a spare Float Stone in hand. The experimental 1-card search did not establish any tactical advantage, and it could forego a future hand-held reattachment option. Conversely, hand resources and disruption costs are state-dependent; this is a concrete **connector opportunity-cost difference**, not a universal scalar ranking.

A separately independently compiled [CI 41348864296](https://github.com/FlareZ123/experiment-01/actions/runs/41348864296) provided an even longer original deal trace. With the single original Field Blower played **on turn2**, rank11 legitimately used `Back Order` on its **turn3** and restored the Tool, still equipped at the recipient first turn6 root. With the same original Field Blower held until **turn4**, rank11 had no Back Order in turn3 while its own Garbotoxin suppressed Oranguru, then used Back Order and reattached Float Stone on **turn5**, again equipped by recipient turn6. See the [timing study](agent1-rank11-fieldblower-timing-native-20261101.md) for complete registration, three arms, controls and artifact.

## Strategic consequences and limitations

The first opponent's Field Blower did **suppress the Tool-dependent lock for the remainder of the opponent's turn 2**, and the source really lacked its Tool at the start of turn 3. The effect's strategic value must be evaluated as an opportunity during **that unlocked opponent turn**: whether rank1 used or could legally use newly freed Abilities or other conditional actions before its opponent re-equipped the lock. A binary “Garbodor broken” indicator at the first source turn-3 root is not a persistent lock win. The source's standard bot can make a smart enough recovery response in at least this physical game; changing that one response alone is insufficient evidence of stronger deck choice.

The source's printed 60 contains **three Float Stone**, two Forest Seal Stone and one Muscle Band, so alternative re-Tool resources may exist in other states. Any owner-deck selection must respect unseen Prize and discard configurations, current Active Oranguru requirement, first legitimate K1 search knowledge, and current legal Tool restrictions. This experiment shows **only one** retrospectively selected source-openable physical deal, for which its real native owner prompt succeeded. Its opponent remainder is a weak native bot, the source callback unconditionally approves the first-turn line, tournament clock and full paper prompt fidelity remain unqualified, and no complete source match is promoted to a competitive win.

**Next discriminating test:** under otherwise identical owner-authorized source setup and Field Blower response, ask whether the recipient *uses the temporary unlocked turn* to activate a consequential otherwise-suppressed Ability, set up attackers or choose another line. Measure the opponent's actual accepted owner-root decisions and public consequences before source retouches its Tool, and then test that new state against source's turn-3 restoration. Preserve a negative case with a legitimately unplayable Ability or an inferior use of the connector. An extra copy of Field Blower is a card-count change and requires an independent fixed-60 evaluation. The overall field remains **29/32 original printed opposing 60s, zero qualified games, no supported 99.5% deck**.
