# K1 Continuation Viability / Dynamic DCI v1 — corrected for Hisuian Heavy Ball

**Agent 1 · corrected 27 November 2026**

New Moon is singleton-heavy, but it **does have direct Basic-Pokémon Prize recovery**: two Hisuian Heavy Ball.

Hisuian Heavy Ball looks at the candidate's face-down Prize cards and may exchange itself for a Basic Pokémon found there. It is an **Item**, so the recovery exists only while Item play is legal.

The first legitimate deck search still creates a major K1 policy discontinuity, but 'Prized' is not equivalent to 'unavailable'. The policy must distinguish **recoverable Prized Basics** from **unrecoverable-in-current-state prerequisites**.

## Structural pre-K1 prize priors

- specified singleton Prized: **10.0000%**;
- at least one of two specified singletons Prized: **19.1525%**;
- both copies of a 2x card Prized: **0.84746%**.

These are priors only. K1 uses exact Prize knowledge plus current recovery access.

## Recovery classes at K1

### Class P-Basic-HHB

A Prized **Basic Pokémon** can be recovered if:

- at least one Hisuian Heavy Ball is accessible;
- Item play is legal;
- the relevant Basic is actually in the Prizes;
- using the Heavy Ball does not create a more important opportunity cost.

New Moon HHB-recoverable examples include:

- Gengar & Mimikyu-GX;
- Trevenant & Dusknoir-GX;
- Galarian Articuno V;
- Lillie's Clefairy ex;
- Solrock;
- Lunatone;
- Duskull;
- Tapu Lele-GX, Latias ex, Mewtwo & Mew-GX, Klefki, Unown and other Basics.

### Class P-nonBasic

Prized non-Basic Pokémon such as **Dusclops** are not recoverable by Hisuian Heavy Ball.

### Class P-Trainer/Energy

Prized Forest Seal Stone, Tool Jammer, Sky Field, Path, Energy and other non-Pokémon cards are not recoverable by Hisuian Heavy Ball.

Other exact recovery must come from a different card/effect or from taking Prizes.

## Continuation families

### Horror House / Poltergeist

If Gengar & Mimikyu-GX is Prized:

- do **not** immediately delete the line;
- first check HHB access and Item legality;
- if HHB can recover Gengar now, the line remains live with an added Item/Prize-recovery cost;
- if AOR Item lock or another Item prohibition is active, HHB cannot be played and the Gengar line is temporarily unavailable until the lock clears or the Prize is naturally taken.

### Night Watch / Pale Moon

Same logic for the Prized Basic Trevenant & Dusknoir-GX.

### Asymmetric Path pair

Solrock and Lunatone are both Basic.

If exactly one is Prized:

- asymmetric Path is **degraded, not automatically dead**;
- HHB can restore the missing pair member while Item play is legal;
- under AOR Item lock, the Prized partner cannot be retrieved with HHB and the pair is temporarily broken.

### Forest Seal Stone family

Forest Seal Stone requires a Pokémon V host; Galarian Articuno V is the fixed list's only Pokémon V.

If Articuno V is Prized:

- HHB can recover Articuno while Item play is legal;
- if HHB is inaccessible/Item-locked, FSS temporarily has no host and its immediate DCI falls.

If **FSS itself** is Prized, HHB cannot recover it. That one-shot any-card-search line is unavailable until FSS is naturally taken from Prizes.

### Clefairy family

Prized Clefairy ex can be recovered by HHB while Items are legal. Under Item lock, the Rondo/Fairy-Zone line is temporarily unavailable until another recovery route exists.

### Duskull -> Dusclops

Duskull is Basic; Dusclops is Stage 1.

If both Duskull are Prized:

- one accessible HHB can recover one Duskull while Items are legal, restoring the evolution chain;
- under Item lock, the chain is temporarily blocked unless a Duskull is already elsewhere.

If both Dusclops are Prized:

- HHB cannot recover them;
- Cursed Blast / Stage-1 attack line is unavailable until a Dusclops Prize is naturally taken or another exact non-HHB recovery exists.

This asymmetry is strategically important: `both Duskull Prized` and `both Dusclops Prized` are not equivalent failure states.

## Dynamic DCI rule

At K1 evaluate:

`DCI(card | state, exact prizes, recovery access, selected continuation)`.

Examples:

- Articuno Prized + HHB playable -> FSS remains protected because its host is recoverable;
- Articuno Prized + AOR Item lock -> FSS immediate value falls because HHB is shut off;
- Lunatone Prized + HHB playable -> Solrock remains protected for the reconstructed pair;
- Lunatone Prized + Item lock -> Solrock's immediate pair value falls;
- Gengar Prized + HHB playable -> preserve the Horror continuation if it dominates;
- both Duskull Prized + HHB playable -> do not call Dusclops stranded;
- both Dusclops Prized -> Duskull's Stage-1 continuation is genuinely unavailable to HHB.

## K1 sequencing rule

After the first deck search and before major discard/search costs:

1. infer exact six Prizes;
2. classify each Prized prerequisite by card type;
3. identify live Prize-recovery channels, especially HHB + Item legality;
4. recompute continuation-family availability and the added recovery cost;
5. recompute DCI;
6. only then pay Secret Box / Treasure / Reconstitute costs or abandon the line.

## Corrected acceptance cases

- K1-FSS-HOST-PRIZED: Articuno V Prized. If HHB + Item play are live, keep Star Alchemy continuation recoverable; if Items are locked/unavailable, treat FSS as temporarily hostless.
- K1-NEWMoon-PAIR-COLLAPSE: one Solrock/Lunatone Prized. Pair is recoverable through HHB when Items are legal; temporarily broken under Item lock.
- K1-GENGAR-PRIZED: Gengar Prized. Permit HHB recovery when legal; otherwise remove Horror/Poltergeist continuation until recovery.
- K1-DUSKULL-ALL-PRIZED: both Duskull Prized. Permit HHB to recover one while legal; do not confuse with both Dusclops Prized.
- K1-DUSCLOPS-ALL-PRIZED: both Dusclops Prized. HHB cannot recover Stage 1; remove Cursed-Blast continuation until a Dusclops Prize is taken or another exact route exists.
- K1-FSS-PRIZED: FSS itself Prized. HHB cannot recover Trainer cards; Star Alchemy unavailable until natural Prize recovery.

No deck change or competitive result follows.