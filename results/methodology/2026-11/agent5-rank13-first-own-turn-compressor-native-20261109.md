# Original rank13 source first-own-turn Battle Compressor changes a real native root and discards three Dragon payloads

**Agent 5, 9 November 2026.** Previously exposed matched source physical deal; developmental mechanism study only. **Zero paper-qualified competitive games.**

## Problem and intervention

The previously observed original rank13 Regidrago source (seat1, going second, original 60) passed its own first turn with a real `Battle Compressor PHF` in hand and `Regidrago V SIT` on the Bench. The source held `Crispin SCR`, `Regidrago VSTAR SIT`, and `Hisuian Heavy Ball ASR` after attaching Grass to its Active Tapu Lele-GX. Original source played no Trainers despite facing the candidate Mewtwo & Mew-GX Horror House-GX → Gengar & Mimikyu-GX Poltergeist route.

[Historical v3 run 42598351225](https://github.com/FlareZ123/experiment-01/actions/runs/42598351225) proved the older source challenger completely inactive on this physical deal. The inherited Agent49 Battle Compressor root only acted at native global turn1, excluding the original source's first own turn at **global turn2**.

We added an explicit `allowFirstOwnTurnTwo` option to the native-neutral Agent49 source-owned Item chooser. Its owner-turn check now permits a genuinely acting player in physical seat1 at global turn2. The default remains global-turn1-only. The native runner additionally gates the feature to the original source seat, and reuses the already present genuine native owner-deck ChooseCardsPrompt + physically selected Dragon donor policy. With the option disabled no behavior changes. Both source competence features (T2 Compressor and natural evolution) were enabled in the treatment, alongside the pre-existing source-only Quick Ball, Treasure and Bench Grass candidates; no change to either physical 60 or candidate paid pivot setting.

## Native v4 result

[Compiled four-cell CI run 42599403372](https://github.com/FlareZ123/experiment-01/actions/runs/42599403372) completed **SUCCESS**, artifact [13664668670](https://github.com/FlareZ123/experiment-01/actions/runs/42599403372/artifacts/13664668670) (ZIP SHA256 `6ce190656b9c592741276f3bb088376627dfea5b2ada55a51d967928e6b5865c`). Twinleaf pinned source revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The four real physical match openings matched exactly. Six focused source tests and the extended early-Compressor owner seat/lock tests passed, alongside workflow unit checks. Full action and source hand ledgers are preserved in the artifact.

| Fixed candidate paid pivot | Original source baseline, source root off | Source T2 Compressor + evolution root on | Native terminal winner |
| --- | --- | --- | --- |
| Off | 153 native roots; 14 source Play/Attack actions; 0 source Trainer plays | 163 roots; 18 source Play/Attack actions; 3 source Trainer plays | Original rank13 source, both arms |
| On | 95 native roots; 4 source Play/Attack actions; 0 source Trainer plays | 119 roots; 5 source Play/Attack actions; 1 source Trainer play | Candidate New Moon v1, both arms |

Both source challenger comparisons have an **actual first native Store action difference at root ordinal19, global turn2, source physical seat1**: baseline chose `PlayCardAction Grass Energy`; treatment chose `PlayCardAction Battle Compressor`. There is no earlier candidate-side action divergence. The first treatment source owner Pass later in that turn showed exactly `Dragapult ex TWM`, `Noivern ex PAL`, `Salamence ex JTG`, and the played `Battle Compressor PHF` in its real discard. Its real deck count fell from 46 to 43 after three native selected Dragon donor removals. The original source later played `Regidrago VSTAR SIT` onto the already Benched V, at global turn4 without paid pivot, or turn6 with paid pivot. Control never evolved to VSTAR in the same action windows.

The treatment's natural evolution is also an independent source-scoped intervention. We therefore attribute the **first accepted native root difference and three discarded donors** to the T2 Compressor, while treating later source continuation as the combined policy's effect. No source Apex Dragon attack followed. The original source's Active remained Tapu Lele-GX through its observed setup windows, and `Crispin SCR` stayed unplayed in hand even after three Dragon payloads entered discard. Thus this solves actual access and donor-selection failure while exposing the next specific bottlenecks: owner-paid Energy acceleration, positioning, and attack selection.

## Evidence boundary and reusable changes

- [Original v4 runner](../../../simulation/evaluation/agent5/rank13-source-policy-factorial.cjs), a **single previously exposed historical** source deal `13:2026:A:new-moon-lockbreaker-v1`, seed269814871. This does not establish a prospective sample or valid matchup win rate.
- [Source physical Pass witness](../../../simulation/twinleaf/agent5/rank13-owner-pass-trainers.cjs) captures the **actual source owner's** held Trainer cards, Bench, and public restrictions; no opponent hidden information.
- [First-own-turn Compressor owner choice](../../../simulation/twinleaf/agent49/early-regidrago-compressor.cjs) with explicit backwards-compatible T2 option.
- [Actual actor owner-seat gate and donor prompt handler](../../../simulation/twinleaf/agent34-actor-only-root-policy.cjs), [native runner source-only options](../../../simulation/evaluation/agent41-bilateral-v2-development.cjs), and [regression test](../../../tests/2026-11/agent49-early-regidrago-compressor.test.cjs).
- Four actual native games are **not competitively paper-admissible**. There are 29/32 authenticated full source 60s, no selected final deck, and no demonstrated 99.5% win rate.

**Decision:** Do not treat the candidate's paid pivot native victory as robust against the original Regidrago opponent while `Crispin SCR` remains held and the source has no live funded VSTAR attacker. Advance to real source owner Crispin selection and native energy recipient prompt, then exact paid Regidrago VSTAR activation and attack. Preserve immutable same-deal controls and obtain new fresh physical deals before any general-strength inference.
