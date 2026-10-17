# Rank-8 Absol/Garbodor: source-dealt pass-audit qualification failure

**Agent 41, 17 October 2026.** Evidence class: bounded pinned-engine gameplay and post-choice policy diagnosis. **No qualified competitive games, no win-rate evidence.** This report concerns only rank-8 Yusuke Kobayashi's published Absol Garbodor 60, rather than treating ranks 8/11/16/22 as interchangeable.

## Immutable experiment provenance

- [Manual workflow 39041216040](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040): **success**, source head `0de5fdf1965dbc388cebe65dff400cb5a5494b9c`, [raw diagnostic artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39041216040/artifacts/12104312369), artifact digest `sha256:0c091afb45b6c212c07010ebea5641121d5c732a0ad7032721aacdbc1ffb99f3`.
- Engine reported `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Engine/policy profile reported `Twinleaf SimpleTacticsAi/defaultStateScores+DoubleDragonAttachTactic-v4+SupporterDecisionGuard-v1+LeleEntryAbilityLockGuard-v1+RadiantGateLockGuard-v1+EntryDrawLockGuard-v1`.
- Fixed Aichi candidate/reference source 60s versus rank-8 exact source 60, `decorrelated-slots-v3` physical seeds **3755937400** (candidate A) and **4168858073** (candidate B). Fixed-core experimental policy flags, post-choice attack probes enabled, action archive SHA-256-validated by the workflow's parser.
- Separate rank-2 observer-off → observer-on → observer-off same-process fingerprint control passed in this run. Its result does not independently establish source-state noninterference for every rank-8 turn or every copied-attack mechanism.

## Outcome of the evidence gate

| Check | Observed |
| --- | ---: |
| Scheduled source-ranked diagnostics | 6 |
| Completed engine games | 5 |
| Engine exceptions | 1 |
| Verified candidate-first games | 5 |
| Verified candidate-second games | **0** |
| Pass decisions in intact traces | 110 |
| Post-choice cloned pass checks | 20 |
| Pass decisions unprobed | 90 |
| Observer errors in intact traces | 0 |
| Passes with an engine-accepted alternative attack | 0 |
| Independently qualified competitive games | **0** |

The five completed engine-game outcomes are unqualified, and one scheduled trial has no intact chronology. The quality screen explicitly marks the absent candidate-second actual-turn stratum in every pair. The single engine exception is **`pilot:8:0:temple-v1:A`**, reporting `Twinleaf bot supplied an invalid result to AttachEnergyPrompt (prompt 57).` This is a concrete bot/engine execution failure. The archive's exception record does not contain the pending prompt's selection or full pre-exception Store graph; root cause attribution needs a reproducible prompt packet.

**Probe exposure by actual role, reconstructed from the raw SHA-validated chronology:** candidate 52 recorded passes, **11** probed and 41 skipped; rank-8 opponent 58 recorded passes, **9** probed and 49 skipped. None of the 20 observations accepted one of the enumerated printed or attached-Tool attack announcements. This does **not** imply that all 110 pass decisions were legally attackless, nor that none of the checked states admitted attacks from other sources. The global four-ordinary/four-Tool-per-game budget was stratified by Tool presence, not by player. It can systematically under-observe one side.

## Source-dealt action and opponent response: Temple v1 in physical B

Trial `pilot:8:0:temple-v1:B`, seed **4168858073**, is a **source 60-card**, fixed-policy, 97-action, 11-turn completed engine game. The candidate was physically B and **actually went first**. Candidate Shadow Rider V → VMAX attacked with Max Geist on global turns **3, 5, 7, 9 and 11**. The rank-8 opponent recorded **zero attacks**; this supplies evidence of an unqualified opponent decision sequence, not evidence of the candidate's strength.

Specific already-observed opponent turns:

- **Turn 2, ordinal 19:** Active **Crobat V** with one Darkness Energy. Its printed Venomous Fang needs Darkness and one Colorless. The cloned Store rejected that attack; the bot passed.
- **Turn 4, ordinal 36:** Same Active **Crobat V** with one Darkness Energy, attack rejected and bot passed again, despite having had another own turn.
- **Turn 6, ordinal 62:** Active **Trubbish** with no Energy; cloned attempts at Suffocating Gas and Venomous Hit rejected.
- **Turn 8, ordinal 83; turn 10, ordinal 91:** Active **Mega Absol ex** with no Energy; these were outside the Tool/ordinary audit budget and were unprobed.

The raw public boards show the opponent's lack of **attached attack Energy** on these particular Active Pokémon. The same archived action trace also captures the **opponent's own hand at the chosen Pass**, a later diagnostic observation, not information available to the candidate. On **turn 2** the opponent hand was Wally, two Quick Ball and two Dark Patch, with **zero Energy cards** after it attached its initial Darkness Energy to Crobat V. On **turn 4** the same five cards plus an unusable-after-turn-one Battle VIP Pass remained, again with **zero Energy cards**. This indicates an immediate resource shortage for a second normal Crobat attachment at those two decisions. Both Dark Patches were in hand, but whether Darkness Energy existed in the discard pile or a suitable Benched recipient was reachable requires its own source-zone examination. The visible turn-2 and turn-4 Bench held Trubbish, which is Psychic type, while Crobat was Active, so the standard Dark Patch effect could not attach a Darkness Energy to those displayed Pokémon without further board development. At later turns 6, 8 and 10, the archived own hands respectively held Adventure Bag plus Quick Ball, no cards, and Quick Ball; each had **zero Energy cards** at its Pass. This supports an energy-access bottleneck in the recorded bot trajectory. It does not establish competent or optimal prior search, Supporter, or acceleration decisions, nor independently rule out an alternative energy-development line. Before promoting any list based on this trajectory, compare the opponent's real hand/allowed information-set actions at these boundaries, separate legal resource failure from policy failure, and replay realistic alternate opponent attachment/attack lines with their full effects and candidate responses.

## Falsification and next checks

1. Reproduce the exact **Temple-A prompt 57** failure with complete chosen card IDs, legal selector options and source-zone conservation. Determine whether the source Twinleaf bot proposed a malformed selection or the reducer rejected a legal one.
2. Create at least one **actual candidate-second** source deal, with the same exact fixed lists, a preregistered fresh seed and first-turn evidence. The current two physical seats do not establish start-order coverage.
3. Test opponent energy attachment, Dark Patch and Active switching competence around the Temple-B early Crobat/Trubbish/Absol passes. Reject any inferred win-rate advantage built on zero opponent attacks until that policy is independently reviewed.
4. Extend side-aware pass exposure and replay with a qualified speculative Store isolation model. Existing `coverageBySide` analyzer/regression commits are separate from this run's pinned source head and are not implicitly CI-certified by it.
5. Repeat the same qualification procedure separately for published rank-11, rank-16 and rank-22 Absol/Garbodor 60s. Their printings, support and configuration differ.

**Decision:** Rank 8 currently **fails the competitive evidence gate** at full opponent-policy realism, valid prompt resolution, both starting-order coverage and complete noninterfering replay. No claim about an actual human matchup win probability follows.
