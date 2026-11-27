# Horror House Action-Boundary Policy v1

**Agent 1 · 27 November 2026**
**Scope:** actor-visible paper decision rule for Gengar & Mimikyu-GX Horror House-GX.

Horror House is valuable because it removes one entire action class for the opponent's next turn. It is not a turn skip. The policy must classify the opponent's strongest reply by action source before assigning lock value.

## 1. Blocked class: cards played from hand

During the affected turn, do not allow ordinary plays from hand, including:

- Pokémon played from hand to Bench;
- Evolution cards played from hand to evolve;
- Trainer cards played from hand: Items, Pokémon Tools, Supporters and Stadiums;
- the ordinary Energy attachment from hand.

This is why Horror House can protect a newly played Path from a hand-held replacement Stadium, Field Blower/Lost Vacuum, a hand-played Marshadow, or an unfunded ADP line that still needs its normal Energy attachment.

Do not claim a specific hidden card was denied unless it was revealed/known. The policy may credit that the *class* of hand-played answers is unavailable.

## 2. Allowed class: actions sourced from the board

Horror House does not by itself stop:

- declaring an attack with an already-funded Active Pokémon;
- using an Ability of a Pokémon already in play;
- ordinary retreat when legal;
- forced promotion after a Knock Out;
- using an already-in-play Stadium effect;
- resolving an automatic effect of an already-attached Tool;
- other effects that operate from established cards and do not require playing a new card from hand.

These distinctions explain several hard cases:

- rank 17 Marshadow already Benched can use Resetting Hole; Marshadow still in hand cannot be played during the locked turn;
- rank 2 / rank 31 Grand Tree already in play can still use its Stadium effect;
- rank 2 Bunnelby can retreat into Stoutland if it already has the Energy;
- rank 5 Mew VMAX can attack under Horror House and can make a zero-cost retreat if legal;
- rank 19 ADP with payable Energy already attached can still use Altered Creation-GX;
- rank 9 New Moon under opposing Horror House can still use an already-attached Powerglass automatic effect.

## 3. Do not infer a turn skip from an unavailable hand

When scoring Horror House, explicitly construct the opponent's best **board-only reply**:

1. attacks currently payable;
2. in-play Abilities;
3. retreat / promotion;
4. in-play Stadium effects;
5. automatic attached-card effects.

Only after that should the policy value denied hand plays.

If a board-only line already wins or creates the same lock, Horror House may be dominated even though it removes many theoretical hand edges.

## 4. Path + Horror sequencing

Path -> Horror House is strongest when all three conditions hold:

1. Path removes a currently important Rule-Box Ability;
2. the candidate's selected attack remains legal (native Gengar or protected Perfection);
3. the opponent's best Path removal / restoration requires a new hand play rather than an already-established board effect.

Counterexamples:

- already-Benched Marshadow: board Ability removes Path;
- already-funded ADP: attack proceeds;
- Grand Tree already active: Stadium effect proceeds;
- source Mew VMAX: attack proceeds even though Genesect draw is off.

## 5. One-Psychic versus extra-Psychic Horror House

Horror House has a second mode: with at least one extra Psychic Energy attached beyond the attack cost, each player draws until they have seven cards.

Do not treat the extra Energy as automatically better.

Potential benefits:

- candidate refills its own hand;
- opponent's hand can be forced larger before a next-turn Poltergeist, increasing the *opportunity* for Trainer cards to be revealed;
- the opponent cannot play those newly drawn cards during the locked turn.

Potential costs:

- opponent also receives fresh resources for the turn after the lock;
- the actual Trainer composition is hidden until Poltergeist reveals it;
- spending/retaining the second Psychic may alter the following attack line.

The policy should expose two distinct candidate actions whenever both are legal: ordinary Horror House and extra-Psychic Horror House. It must not assume a seven-card opponent hand guarantees seven Trainers.

## 6. Incoming Horror House recovery

When New Moon is itself locked by an opposing Horror House, switch the policy into a board-only mode:

- reject all hand-play roots;
- preserve attacks, retreat and in-play Abilities that remain legal;
- preserve already-in-play Stadium and Tool effects;
- evaluate whether an existing Powerglass can attach a Basic Psychic from discard at end of turn;
- do not attempt TPE as the normal hand attachment during the locked turn.

This is especially relevant to rank 9, which carries its own Gengar & Mimikyu-GX.

## 7. Effects that move cards from hand via another card

Do not generalize beyond the exact rule text. If an already-in-play Ability or attack moves a card from hand as part of its effect, classify it using the supplied rules/card semantics rather than assuming every hand-origin movement is either blocked or allowed.

This policy intentionally leaves that subcategory card-specific instead of inventing a universal ruling.

## Required trace

For every Horror House decision record:

- whether 1-Psychic and extra-Psychic modes are legal;
- current candidate attack source (native Gengar vs Perfection);
- opponent board-only attacks/Abilities/retreat/Stadium effects considered;
- which denied response classes require a hand play;
- any already-established exception such as Benched Marshadow or Grand Tree;
- whether Horror House changes the opponent's immediate Prize ceiling or merely delays setup.

## Consolidated acceptance consequences

This action-boundary rule subsumes RAI-PATH-NATIVE-HORROR, RAI-R17-MARSHADOW, R2-HORROR-GRANDTREE, R2-HORROR-RETREAT, R19-ADP-FUNDED-HORROR, R19-ADP-UNFUNDED-HORROR, R5-HORROR-STADIUM-WINDOW, R9-INCOMING-HORROR, R31-HORROR-GRANDTREE and the inherited rank-1 Marshadow cases.

No deck change or competitive result follows.