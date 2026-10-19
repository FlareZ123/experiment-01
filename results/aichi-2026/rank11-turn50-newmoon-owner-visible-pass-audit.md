# New Moon's authentic turn-50 pass after rank-11 Quick Balls: owner-visible state

**Agent 10, 19 October 2026.** Evidence classification: compiled source-dealt retrospective policy audit; two exact same-source decision paths. This document does not claim either policy is competitively strong.

## Compiled provenance

[Manual CI 39185735911](https://github.com/FlareZ123/experiment-01/actions/runs/39185735911) succeeded on historical source seed 1244180408 using the unchanged source rank-11 and New Moon candidate English-mechanics proxy 60s, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, physically rank11 first. Artifact 12158416295, ZIP SHA256 `f07aa2b08a6539f705704fd3793e59b9c6024727e305569b8344c0514f8b2a47`; inner `rank11-turn50-pass-owner-audit.json` SHA256 `9c6bb275617433ef98acf430e5f112ae95347a976d068e0dcf7a50cc3ed8879a`. The original Quick Ball result inner JSON is also present, with identical SHA256 `01831a9a4b800ad5f3548a0fd4667c7ec7d30d9065fc4d51724d272a4e2de82a`.

The read-only owner-perspective reporter [rank11-turn50-pass-owner-audit.cjs](../../simulation/twinleaf/rank11-turn50-pass-owner-audit.cjs) again confirms identical pre-turn49 root actions and original end states: unmodified opponent wins New Moon turn50, while the real three-Quick-Ball opponent line wins rank11 turn55. All candidate hand snapshots were taken immediately after the original bot had chosen its action and before dispatch; they did not feed the policy.

## Exact candidate turn-50 pass

After rank11 played three actual legal Quick Balls and attacked Claw of Darkness at global turn 49, candidate New Moon took the turn 50 automatic draw. It played **Forest Seal Stone** at root 309 and **PassTurnAction** at root 310. The pre-Pass **owner-visible** board was:

- Active Mewtwo & Mew-GX, **200 damage**, holding **two Telepathic Psychic Energy** and Powerglass.
- Benched Gengar & Mimikyu-GX, **zero damage**, holding **two Psychic Energy** and the just-played Forest Seal Stone. Its printed Poltergeist costs two Psychic Energy.
- Other candidate Benched Pokémon were Lunatone, Tapu Lele-GX (one Telepathic Psychic Energy), Galarian Articuno V, a second Mewtwo & Mew-GX with Powerglass, Lillie's Clefairy ex, and Unown. Sky Field was in play.
- Opponent Active Mega Absol ex was **undamaged**, with **three Darkness Energy** and no Tool. Its Bench had two Oranguru V, Squawkabilly ex and Latias ex. **No Garbodor** was in play.

Candidate's actual own hand at the Pass decision contained 16 cards: Ace Trainer AOR x2; Hisuian Heavy Ball ASR x2; Battle Compressor PHF x2; Counter Catcher PAR; Canceling Cologne ASR; Lillie's Determination M1L; Battle VIP Pass FST; Adventure Bag LOT; Rescue Carrier EVS; Path to the Peak CRE; Fog Crystal CRE; and Dusclops SFA x2.

The copied Gengar Poltergeist had been selected through a real owner Perfection prompt on **global turn 48**. In the original no-Quick-Ball continuation the same candidate chose Perfection again on **turn 50**, then Poltergeist, when rank11 had ten Trainers, leading to the simulator terminal.

The alternate full source trajectory includes further candidate Pass actions on global turns 52 and 54, even though its Benched Gengar still had two Basic Psychic Energy. At turn 52, the candidate Active was a fresh Mewtwo with no Energy; it played its own Path to the Peak Stadium, an additional self-lock risk for Perfection. At turn 54, candidate Active Mewtwo was holding one Psychic Energy and had 200 damage. The rank11 source side's repeated Claw attacks concluded the game at turn 55.

## Inference and next falsification

The t50 public zone snapshot demonstrates the original bot passed with an apparently powerful copied-attack resource board while facing a full-HP Mega Absol. Whether **the live pinned Store would accept a Perfection activation at that exact state and resolve a meaningful attack** must be shown through actual attempted root actions and prompts. The selected copy may deal only a **nominal 200** against the new four-Trainer hand, below a fresh Mega Absol's 280 HP. The simulator policy's turn-ending penalty and state scoring could discourage non-KO attacks, but source scoring parameters alone do not prove that it was the reason for this particular pass.

A separately coded [single exact-state candidate reply fork](../../simulation/twinleaf/rank11-turn50-perfection-reply-fork.cjs) runs the *same real opponent Quick Ball sequence* and attempts legal owner Perfection followed by a prompt-validated Gengar Poltergeist selection at turn 50. A matching pre-turn50 root ledger and an unaltered policy-restoration arm are mandatory. Its compiled status and outcome are a separate experiment; the source observation here is already independently reproducible.

All tested seeds here were selected retrospectively. These two engine paths are **excluded from win-rate denominators**; there remain 29/32 exact source opposing lists and zero competitively qualified games.
