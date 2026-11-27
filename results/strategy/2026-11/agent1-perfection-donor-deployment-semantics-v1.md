# Perfection Donor / Deployment Semantics v1

**Agent 1 · 27 November 2026**

Two recurring policy errors are structurally related:

1. treating every Rule-Box Pokémon as a Mewtwo & Mew-GX Perfection donor;
2. treating every route that puts a Pokémon onto the Bench as equivalent.

Both are wrong because card text cares about exact card classes and exact movement verbs.

## 1. Exact Perfection donor classes in New Moon

Mewtwo & Mew-GX Perfection says it can use attacks of any **Pokémon-GX or Pokémon-EX** on the candidate Bench or in the candidate discard pile.

In the exact retained 60, the relevant donor species are:

### Eligible

- Gengar & Mimikyu-GX — Poltergeist; Horror House-GX;
- Trevenant & Dusknoir-GX — Night Watch; Pale Moon-GX;
- Tapu Lele-GX — Energy Drive; Tapu Cure-GX;
- another Mewtwo & Mew-GX can supply the same printed Miraculous Duo-GX attack, though the Active Mewtwo already has it printed.

### Not eligible merely because they have a Rule Box

- Galarian Articuno V — Pokémon V, not Pokémon-GX/EX;
- Lillie's Clefairy **ex** — modern lowercase ex, not legacy Pokémon-EX;
- Latias **ex** — modern lowercase ex;
- Squawkabilly **ex** — modern lowercase ex.

Do not generalize Perfection to `Rule Box`, `ex`, or `V`.

## 2. Overlooked low-cost Perfection attack: Energy Drive

Tapu Lele-GX Energy Drive costs `[C][C]` and does:

`20 × total Energy attached to both Active Pokémon`,

and its damage is not affected by Weakness or Resistance.

This is a real two-Energy Perfection attack when Tapu Lele-GX is on Bench/discard and Perfection is live.

Example breakpoints:

- 4 total Active Energy -> 80;
- 5 -> 100;
- 6 -> 120;
- 7 -> 140;
- 8 -> 160;
- 10 -> 200.

It can be better than waiting for a third Psychic for Night Watch/Eon Blade when both Active Pokémon are Energy-heavy.

Because Energy Drive ignores Weakness/Resistance, do not double it with Clefairy Fairy Zone.

## 3. Tapu Cure-GX is also a valid copied GX option

Tapu Cure-GX costs `[P]` and heals all damage from two Benched candidate Pokémon.

Mewtwo can use it through Perfection while Tapu Lele-GX is on Bench/discard, subject to the once-per-game GX quota.

That is usually lower priority than Horror House/Pale Moon/Miraculous Duo, but it is a legal discrete survival line. Do not delete it from the action set merely because it deals no damage.

## 4. Deployment route changes triggered Abilities

Tapu Lele-GX Wonder Tag triggers only:

`When you play this Pokémon from your hand onto your Bench during your turn...`

Therefore:

### Route A — search to hand, then play

Fog Crystal / Mysterious Treasure (when legally able to find Lele) -> Tapu Lele-GX into hand -> play Lele from hand to Bench.

If Wonder Tag is not suppressed and the Bench has space, Wonder Tag can search Ace Trainer or Lillie's Determination.

### Route B — TPE direct deployment

TPE searches the deck and **puts** Basic Psychic Pokémon directly onto the Bench.

TPE -> Tapu Lele-GX therefore **does not** satisfy 'play this Pokémon from your hand onto your Bench'. Wonder Tag does not trigger.

The TPE route can still be correct when:

- hand-play Pokémon are restricted (for example Chimecho Bell of Silence);
- the body itself is required;
- the Supporter search has no immediate value;
- avoiding hand routing matters more than Wonder Tag.

But it is not connector-equivalent to a hand-play route.

## 5. Chimecho creates the reverse tradeoff

Bell of Silence prevents playing Pokémon with Abilities **from hand** during the next turn.

Under Bell of Silence:

- Fog/Treasure -> Tapu Lele in hand does not let the candidate legally play that Ability-bearing Lele from hand while the restriction applies;
- TPE can still put Tapu Lele directly from deck onto Bench, because that is not playing it from hand;
- but the direct route still does not trigger Wonder Tag.

This produces an exact choice:

`body access without Wonder Tag`

versus

`wait/clear the restriction for hand-play Wonder Tag value`.

## 6. Wonder Tag and Supporter lock

Against Active Stoutland Sentinel, Wonder Tag itself may still be able to search a Supporter if the Ability is otherwise live, but the candidate cannot **play** that Supporter while Sentinel remains active.

Do not value the fetched Ace/Lillie's as same-turn action value under Supporter lock.

It can still have future value after Stoutland is removed, subject to hand disruption and current continuation.

## 7. Other route-sensitive examples

- TPE direct deployment of Ability Pokémon bypasses Bell of Silence but not Ability suppression once the Pokémon is in play;
- Rare/other evolution effects that put an Evolution onto a Pokémon are not the same as ordinary play-from-hand evolution unless card/rule text says the relevant trigger is satisfied;
- Battle Compressor donor placement creates Perfection access but can destroy native-attacker access;
- Prize recovery / deck-to-Bench / discard-to-Bench routes must be checked against the exact trigger wording rather than normalized to 'Pokémon entered play'.

## 8. Decision rule

For every Pokémon-access connector, record both:

- **destination**: hand / Bench / discard;
- **movement verb/source**: play from hand / put from deck / put from discard / search to hand / evolve by effect.

Then evaluate:

- triggered Ability legality;
- current hand-play restrictions;
- Perfection donor availability;
- Bench liability;
- whether the body is needed natively.

## Acceptance additions

- PERF-LOWERCASE-EX-EXCLUSION: Perfection live with Clefairy ex/Latias ex/Squawkabilly ex available. Do not expose their attacks as Perfection copies.
- PERF-ENERGY-DRIVE: Tapu Lele-GX donor available, Perfection live, Mewtwo has two Colorless-equivalent Energy. Include Energy Drive with damage from both Active Energy counts and no Weakness/Resistance.
- PERF-TAPU-CURE: Tapu Lele-GX donor available, GX unused, two damaged Benched Pokémon create survival value. Keep Tapu Cure-GX legal.
- TPE-LELE-NO-WONDERTAG: TPE puts Tapu Lele-GX from deck onto Bench. Do not trigger Wonder Tag.
- HAND-LELE-WONDERTAG: Tapu Lele-GX is played from hand onto Bench with Ability live. Permit Wonder Tag.
- CHIMECHO-TPE-LELE: Bell of Silence active. Permit TPE direct deployment of Lele, but not hand-play Lele; do not trigger Wonder Tag from the TPE route.

No deck change or competitive result follows.