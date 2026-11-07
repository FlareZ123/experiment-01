# Original Aichi rank31 has a source-compatible direct Fog Crystal→Basic Psychic→Unown payoff candidate

**Agent49 | 7 November 2026 | actor-public planning only.**
[Original rank31 Dusknoir Chimecho 60](../aichi-2026/full-decklists.json)
contains **4 Fog Crystal CRE**, **3 Unown AOR** and
**2 Basic Psychic Energy**. It contains **zero Secret Box**, so the
already demonstrated Box→Fog native attack is not a valid recipe for
this original opponent. Nevertheless, a simpler, genuinely
source-compatible one-Energy line is possible in principle.

The printed `Unown xy7-30` has
`Hidden Power` with one Colorless Energy cost and 10 base damage;
Fog Crystal can find a Basic Psychic Energy and does not require a
discard. If the acting owner has an unfunded Active Unown, physically
holds Fog, still has a normal Energy attachment, can use Items and
attacks, and an opposing Active has **10 HP remaining** with no
applicable protection, this line could yield a Knock Out if the Basic
Psychic is actually present in the deck.

## Read-only owner-root proposal

[`agent49-owner-direct-fog-one-energy-reply.cjs`](../../simulation/twinleaf/agent49-owner-direct-fog-one-energy-reply.cjs)
is a separate **no-Store-action** pure selector. It accepts a
detached actor-visible owner-root observation and **only that
player's registered original60**. It verifies:

- Held original `Fog Crystal CRE`, no Basic Psychic currently in
  hand and zero Energy already attached to Active.
- Public item/attack restrictions and unchanged normal attachment
  quota; ordinary first-player opening-turn attack prohibition.
- Active attack printed base damage and exact one-Psychic or
  one-Colorless native cost; prospective target's **public**
  remaining HP.
- At least one Basic Psychic printing could remain in the owner's
  deck after accounting for own known hand, discard, Lost Zone,
  Stadium, attached cards and other publicly known own cards,
  without inspecting unsearched deck or unknown Prize identities.

If all necessary conditions pass, it returns a **proposed** attack
line with explicit `prizeTakeCertified:false`; no native action,
paper damage reduction/Weakness/Resistance check, actual target
availability or winning outcome is asserted. Even a real paid
native attack with 10 printed damage might be blocked by effects,
change a Special Condition, fail to take a Prize, or be strategically
dominated by a better line.

[Three pure regressions](../../tests/agent49-owner-direct-fog-one-energy-reply.test.cjs)
passed **3/3** against the actual fetched source:
an actor-owned synthetic root aligned to rank31's exact registered
source 60, exhaustion/first-turn/attachment negative controls,
and public attack/item lock or inaccessible damage negatives.
An explicit getter on forbidden opponent hidden data would throw if
accessed and remained untouched.

## Why rank31 is especially interesting

Rank31 also has **3× Dusclops PRE** and **3× Dusknoir PRE**.
The bundled exact English card corpus identifies *Cursed Blast*:
Dusclops can place 5 damage counters on an opposing Pokémon and
Knock itself Out; Dusknoir can place 13 counters and also Knocks
itself Out. This makes a prior-damage counter threshold plausible
under certain states and creates a real **Prize-exchange cost**
when used. These are paper source/card-text facts, not a claim
that the specific exposed synthetic Unown root or real sequencing
exists. The owner should account for its own self-Knockout Prizes
and opponent's possible response before choosing any such line.
Combined with Hidden Power, a 60-HP, unprotected target would
be in range after a 50-damage Dusclops Blast, but that
two-action sequence has **not** been played in a native game here.

Native outcome verification still requires Store-accepted Fog
play, correct owner-only Basic Psychic prompt answer, physically
attached Basic, attack resolution, potential KO/Prizes and
a competitive opponent reply on fixed original rank31.
No direct Fog adapter is installed into the selected shared
policy. The benchmark remains 29/32 complete original 60s,
zero qualified games, no proven single winning 60 and no
demonstrated 99.5% win rate.
