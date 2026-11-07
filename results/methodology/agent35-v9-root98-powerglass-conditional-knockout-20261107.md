# Agent35: root98 held Powerglass opens a conditional next-turn one-Prize line

**7 November 2026 | Agent35 | exact historical Aichi rank11 vs New Moon v9 owner Pass | conditional paper line, not played or win-rate qualified**

## Why this matters

The independent [Lillie after-Pass A/B audit](agent35-v9-lillie-pair-pass-regret-20261107.md) found a Store-accepted Lillie on candidate turn14, followed by eleven further candidate Passes and zero later attacks. The first of those Passes, **native root98 on global turn14**, already contains a concrete prospective attack setup that the native actor overlooked.

Actual archived B native [CI42333343834](https://github.com/FlareZ123/experiment-01/actions/runs/42333343834), artifact13558074462, extracted JSON SHA256 7c9c95e37cf9c466d87e053f8ed481844d7acdbc54a619415e8a9d8ab8e5d659, records:

- The candidate **Active Unown AOR** at zero damage, zero Energy and **no Pokémon Tool**. Its hand of seven includes **Powerglass SFA**.
- The original source's **Active Trubbish FST** has **60 damage** on its printed **70 HP**, no Tool. Neither public Stadium slot has a card. The opponent Bench is Tapu Lele-GX, Trubbish, Crobat V, Latias ex and Mega Absol ex. The owner Bench has five Pokémon.
- The source's prior actual **Super Poison Breath attack at root86** had knocked out an earlier Active Unown with **two physically attached Basic Psychic Energy**, reducing source Prizes from six to five. The newly promoted Unown was empty. Between that source KO and root98, the candidate's only accepted card plays were Mewtwo & Mew-GX, Lillie's Determination and Squawkabilly ex; no observed recovery action accounted for the KO-discarded Basic Psychic.
- The root98 base actor chose Pass without playing the held Tool.

## Exact printed-card mechanics, conditional counterfactual

The supplied card database identifies Unown as **AOR 30 / xy7-30**, 60 HP, **Hidden Power: one Colorless Energy, 10 damage**; Trubbish as **FST 168 / swsh8-168**, 70 HP, **Super Poison Breath: 20 damage and Poison**; and Powerglass as **SFA 63 / sv6pt5-63**. The Advanced Player Rulebook v3.4 explicitly states in **E-21, End of turn** that Powerglass's effect still applies after ending a turn *without* attacking. That Tool permits **one Basic Energy from the owner's discard pile** to be attached to its Active Pokémon at the end of the turn. These are card-text and rule-derived facts.

The concrete possible line, with all outcomes after root98 **hypothetical**, is:

1. **Candidate turn14:** attach the held Powerglass to Tool-free Active Unown, then end the turn. At end of turn choose one Basic Psychic from the prior KO's discard-pile resources. This supplies the one Colorless Energy cost for Hidden Power on the next turn.
2. **Source turn15, conditional:** if Trubbish stays Active and uses the same printed Super Poison Breath it used in the archived unchanged branch, then 20 attack damage plus one ordinary 10-damage Poison check leaves the 60-HP Unown in play at the start of candidate turn16, absent further effects.
3. **Candidate turn16, conditional:** a surviving Unown with one Basic Psychic can announce Hidden Power for 10 damage. If the opponent has kept Trubbish Active at 60 damage and no new prevention or healing applies, 60 + 10 equals its printed 70 HP, resulting in a Knock Out and **one candidate Prize card**.

The line requires **no new Bench slot, manual Energy attachment from hand, Item search, or discard payment** beyond the Tool's permitted single Basic Energy from discard. Its Tool action is independent of the Lillie Supporter quota already consumed on turn14. As a generalizable tactic, converting earlier lost attackers' Energy into a same-deal revenge Knock Out can be decisive.

## Essential limitations

The archive certifies root98's own hand and public board, native root86's preceding Knock Out and Prize delta, and the three exact card printings. **It does not show a direct owner-discard card-object snapshot at root98.** The availability of at least one Basic Psychic is inferred from the rules of KO and the absence of intervening recorded recovery; it must be confirmed on an actual pinned Store fork. Although no visible relevant Item/Tool lock was present, full legality and resolution remain under the native Store's authority.

Agent41 already supplied a separate [real staged pinned Store Powerglass-after-Pass test](../../simulation/twinleaf/agent41-powerglass-after-pass-native.cjs), proving the end-of-turn Tool mechanism in a constructed state. That is useful mechanical prior evidence, **not** a root98 intervention or competent source reply. The source may switch, gust, heal, disrupt or otherwise respond differently when the Tool is played. The resulting Prize is a conditional outcome and has **never** been observed in this branch.

The next highest-value experiment is to use an **owner-only, both-seat Powerglass Tool root policy** at the newly identified root98, with actual Store Tool acceptance, an authenticated owner-discard Basic Energy prompt, end-of-turn attachment receipt, following opponent action and a genuine funded Hidden Power attack. Preserve the original source sixties, card-print manifest, physical setup and post-exposure status. Run new unseen deals only after the policy is frozen; avoid retrofitting a 99.5% inference from this episode.

## Reproducible certificate

The independent [conditional certificate](../../simulation/evaluation/agent35-v9-powerglass-root98.cjs) cross-checks the real archived turn14 Pass witness, printed card databases, root86 KO and physical prior Energy, root history, public Tool and Stadium state, 10-damage KO breakpoint, and the opponent's single ordinary next-attack survival condition. [Four fail-closed unit tests](../../tests/agent35-v9-powerglass-root98.test.cjs) passed locally on Node 22. The output explicitly marks that the counterfactual was **not executed**, no live opponent response was established, and no competitive paper game is qualified.

**Collective status unchanged:** 29 of 32 opponent lists authenticated, three source ranks missing, zero qualified games and no demonstrated 99.5% win rate.
