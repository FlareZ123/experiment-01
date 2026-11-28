# A paired Battle Compressor payload solves an otherwise missed final-Prize Raihan turn

**Agent:** 2 · **Date:** 28 November 2026 · **Evidence:** actual two-profile JavaScript candidate worker, source-bound synthetic game-state root and prompt decisions. **Not:** pinned Twinleaf Store match, full game, Aichi matchup evidence, or proof of any win rate.

## Concrete line

Both unchanged candidate 60s include **Battle Compressor PHF 92 ×1**, **VS Seeker PHF 109 ×2**, **Raihan EVS 152 ×1**, and basic Psychic Energy. Printed Battle Compressor can move **up to three cards simultaneously from deck to discard**. Raihan is playable after a Pokémon was Knocked Out during the opponent's immediately preceding turn, can attach a basic Energy from discard to one of our Pokémon, then searches the deck for a card. Its attachment is an effect separate from the one manual attachment allowed each turn. VS Seeker retrieves a Supporter from discard to hand.

Consider a source-real opponent Dedenne-GX UNB57 Active (160 HP, 80 damage already on it; awards 2 Prizes), with a Regidrago VSTAR on their Bench. We have an Active Shadow Rider Calyrex VMAX CRE75 carrying **two basic Psychic Energy**, only **two Prizes** remaining, **normal Energy attachment already used this turn**, a Battle Compressor and VS Seeker in hand, an accessible **Raihan and Basic Psychic Energy in the deck**, no Psychic Energy yet in discard, and a certified previous-opponent-turn Knock Out. A Teammates-only search can retrieve the Energy into hand but **cannot attach it this turn** (ordinary attachment spent; Underworld Door is not an Active attachment). The following legally available attack sequence finishes the game instead:

```text
Battle Compressor — choose Raihan + Psychic Energy, both from deck to discard
VS Seeker — recover Raihan from discard to hand
Raihan — attach the Basic Psychic from discard to the Active VMAX (now 3 attached)
       — also search deck for one card, per the printed Supporter instructions
Max Geist — 10 + 30×3 = 100 damage, KO damaged Dedenne-GX,
            take the last 2 Prizes
```

The independent card-search action for Raihan remains required by its own text; choosing it does not prevent the attached Energy's effect. The candidate's actual native action frontier and associated prompt chains must still offer valid choices; the source policy test below cannot guarantee that runtime compatibility.

## Why the current successor misses it

`simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs` exact worker Git blob `813f22634f8f162d1da3659ad5c5d2d6da32103b` has `compressorSeekerSupporterNeed` for a *single* Raihan discard only when Raihan's own potential is already unlocked, and `compressorRaihanFuelNeed` for **one Psychic discard when Raihan is already in hand**. Neither establishes the necessary joint pair when *both* Raihan and Energy begin in the deck. The `chooseCardCombination` Battle Compressor branch hard limits ordinary selection to `slice(0, Math.min(1, maximum))` even though its native prompt provides `maximumCount=3`. In the tested state the original worker picks **Teammates** as the single discard candidate, or even picks zero when Teammates is absent; both miss the current-turn winning attack.

## Exact bounded policy change

The executable reproducer below patches **only in memory**:

- Admit the pair only when `receipt.priorOpponentTurnKO.any===true`, Supporter use is available, **normal Energy already spent**, VS Seeker in hand, Raihan not in hand/discard/Lost Zone or known fully Prized, Basic Psychic not already in discard, and the deck has at least three cards so the later Raihan tutor remains meaningful.
- Project only the one Basic Psychic attaching to the **current Active** via Raihan's effect; call the existing *source/Ability/damage/effective-cost/Prize guarded* `publicFinalAttack(projected, new Set(['Max Geist']))` for certification. Do not infer a match win from mere access to the two cards.
- In a **Battle Compressor exact source** native deck-selection prompt with at least `maximumCount=2`, require both Raihan and Basic Psychic to be among the *actually revealed eligible choices*; select exactly these **two** cards. If either is absent or any guard fails, preserve the existing 0–1-card scoring.
- Integrate the new need in the existing root-level Battle Compressor score so the worker voluntarily plays that Item **only when useful**, rather than prematurely passing or consuming VS Seeker for an inferior line.
- Do not broaden to all Supporters, speculate hidden Prize identities, bypass manual-attachment limits, skip the mandatory Raihan deck search, or silently treat other Pokémon as currently payable.

The implementation owner should consider this as a source-bound single two-payload exception rather than making Battle Compressor always choose two or three cards.

## Actual policy-source differential result

**Reproducer:** [agent2-compressor-double-payload-raihan-reproduce.cjs](agent2-compressor-double-payload-raihan-reproduce.cjs). Exported `run(originalWorkerSource)` compiles the unchanged fetched source and the bounded in-memory patch, invokes the *actual* two-profile worker on both physical seats, and throws on unexpected decisions. It was fetched back from GitHub and executed after commit.

| Test coverage | Result |
| --- | --- |
| 16 prompt scenarios × 2 actual source-bound profiles × 2 physical seats | **64 paired groups / 128 actual worker calls; 64 expected** |
| Joint Raihan+Psychic available, manual Energy spent, certified prior KO | **12 corrected two-card prompt selections** |
| Competing lines, missing prerequisites, nonlethal/improper Prize outcomes | **52 unchanged paired controls** |
| Action and prompt continuation: Battle Compressor root, VS Seeker root + exact target, Raihan root + active attachment target, final offered Max Geist root | **24/24 decisions matched** |
| Unexpected worker decisions | **0** |

Negative controls include an available ordinary Energy attachment (Teammates remains the choice), no prior KO, missing VS Seeker, Raihan already held or discarded, Psychic already discarded, only one payload actually available in the native selection, maximumCount=1, full-health Dedenne, a two-Prize KO with three of our Prizes remaining, insufficient deck reserve, and Raihan in Lost Zone. Existing policy's baseline also legitimately picks *zero* cards where no supported payload is available; the paired test treats this as a prior failure to find the winning pair, not as a reason to reject the test fixture.

**Evidence boundary:** Executed source worker calls establish exact policy behavior only. The continuation checks are separately constructed actor-visible states with legal-action tokens; there was no end-to-end reducer execution to verify the complete sequential script or relative decision strength across natural games. This is a meaningful tactical line and an owner-policy implementation request, **not** qualification for a competitive win-rate claim.

## Owner boundary

Only Agent46 currently owns the bounded successor implementation branch, with authorization for code and local tests only. This report and reproducer did not change the owner branch, the candidate lists, CI, Twinleaf/vendor, the frozen V3 gate, or start any games. Include the two-card-combination and negative controls in the owner's approved local-test suite if adopted. The wider single-fixed-60 objective still lacks a nominated final deck and qualified Aichi matchups.
