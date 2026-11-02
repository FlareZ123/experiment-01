# Actor-owned pre-Lillie hand shows nontrivial preservation costs even when native draw is legal

**Agent 7 | 2 November 2026. Retrospective diagnostic on an already-exposed registered source seed. No independent performance validation.**

## Why inspect the hand?

In the fresh prospectively registered rank6 paired panel, six native candidate Lillie's Determination plays were successfully executed when the existing actor policy would otherwise Pass. The unconditional rule generated no candidate wins and changed one New Moon trial's native disposition from an incomplete action cap to an original-source win. A Supporter may be mechanically playable while its hand-shuffle opportunity cost makes it strategically weak, especially when the owner already holds several useful but not immediately usable cards (the UDP/DCI/AMR issue in `resources/human_concepts.md`).

The original prospective cohort [CI 41483117649](https://github.com/FlareZ123/experiment-01/actions/runs/41483117649), [report](agent7-prospective-rank6-lillie-policy-paired-native-20261102.md), registered seed `4153138373`, candidate physical seat B, was already observed before this experiment. These are therefore *descriptive retrospective receipts*, with no claim of discovering an independent causal mechanism or another held-out sample.

## Method and strict replay verification

Updated read-only candidate intervention receipt `simulation/twinleaf/agent7-prospective-candidate-lillie-after-pass.cjs` records `view.ownHand.slice()` **before** the selected real candidate Lillie root, using the acting owner's own cards, not concealed opponent deck, hand or Prizes. The player policy is unchanged.

Two native treatment games (same source seed, different unchanged candidate 60s) were re-executed in compiled pinned Twinleaf by `simulation/evaluation/agent7-rank6-lillie-dci-hand-development.cjs`. Both replayed original selected actor decisions **exactly**, measured by matching the previously archived complete native root-action-ledger SHA256:

| Fixed candidate 60 | Verified exact native ledger SHA256 | Lillie turn | Before → after hand/deck | Original treatment native disposition |
|---|---|---:|---|---|
| Champion reference | `b15c2dfbb86da2fc23f0ec6cdf581d79d2223aac4c942634a4483e6abb14c7a5` | 49 | 22 hand / 17 deck → 6 hand / 32 deck | Action cap |
| New Moon lockbreaker | `6537359eac9b9ddba6bc044151942664d7f75fd489a592454701aeebf4c4ef86` | 3 | 5 hand / 43 deck → 8 hand / 39 deck | Original source native win |

Real [CI 41484158966](https://github.com/FlareZ123/experiment-01/actions/runs/41484158966) passed pinned compilation, reran the original 16-game controlled native panel unchanged, and produced both exact full-root ledger SHA matches. [Posthoc raw owner-hand artifact 13161626402](https://github.com/FlareZ123/experiment-01/actions/runs/41484158966/artifacts/13161626402), ZIP SHA256 `d69140072cd129f1920f7bb7c75337be8692b218210528f9e95e8a574f2d9c6a`.

## The exact owned hand before Lillie

At the New Moon trial's early turn3 root, the candidate had five cards:

`Rescue Carrier EVS`, `Field Blower GRI`, `Lillie's Determination M1L`, `Battle Compressor PHF`, `Ace Trainer AOR`.

The selected Lillie shuffled the *entire* hand (including its other four named resources) into the deck and drew eight because the candidate still held six Prize cards. The actual printed native shuffle/draw fully settled. Whether any coheld card would have been useful before Lillie depends on Item locks, card targets, available Bench and the candidate's concrete plan; **we have not yet established any specific feasible superior line**. Source Iron Thorns Initialization and that turn's board matter. The native outcome later ended with the source as winner, whereas the original control reached its action cap. Those two different end states do not explain why they diverged.

At the Champion trial's late turn49 root, the candidate held 22 cards, including four Shadow Rider Calyrex VMAX, two Sky Field, two Mysterious Treasure, Forest Seal Stone, Mimikyu, Tapu Lele-GX, Guzma, Iono, VS Seeker, Float Stone, Quick Ball, Battle Compressor, and other cards. This Lillie shuffled an extremely large hand and drew **only six**, because four Prize cards remained, resulting in a six-card hand and 32-card deck. Mechanical legality and settlement are confirmed. Retaining 22 cards may also have had costs, but the arithmetic establishes a significant option-set contraction even though the library’s simplistic `chooseLillieAfterPass` judged the action eligible.

## Interpretation

- **Native legality is a necessary low-level gate, never a positive strategic-value oracle.** The Champion Lillie trades current access to 22 known own cards for six new draws, while the New Moon Lillie reshuffles four other named resources. The exact physical hand now documents the strategic cost the automatic policy ignored.
- **State-dependent hand preservation is an actionable optimization target.** Future candidate policies can use card-specific accessibility, available opponent lock, the owner's Supporter quota and Prize count, and current attack prerequisites before selecting a shuffle Supporter.
- **No proven sign of causal improvement or deterioration** follows from the observed native winner/cap difference. One source seed and two related candidate lists are insufficient; the difference between action cap and true engine-game-end is a censoring effect, and full paper legality/strong opposing policy remain missing.

The static derived result supports **testing** DCI/UDP/AMR-aware Supporter selection and de-emphasizing automatic draw volume in a deck optimizer. It does not justify selecting any fixed 60 or claiming progress toward the 99.5% game-win target. Competitive-qualified games remain **zero**.
