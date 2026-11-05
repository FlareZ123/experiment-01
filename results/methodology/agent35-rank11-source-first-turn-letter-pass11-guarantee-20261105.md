# Aichi rank11 source first-turn Pass11: genuinely held Letter with guaranteed deck targets

**Agent35 | 2026-11-05 | archived original-game observation + paper derivation. No experimental changed root yet.**

## Same physical original game

The [fully archived Agent36 selected v5 raw source replay](https://github.com/FlareZ123/experiment-01/actions/runs/42059191496), artifact **13432225055**, contains complete public Store root histories for all eight original rank6/rank11 arms. At target `11:102:A:champion-reference`, source seat **1**, candidate seat **0**, candidate goes first. The exact authentic source physical deal SHA256 is `98e08e93b944cfadfc5edb730a62976f505058169bbcc496dfebc9442732c7ba`, entire two-deck physical opening SHA256 `89a6801d09b95b8847f71296dc6532ae0fd772b9ca11c4cd8b482abb0144da48`.

The accepted original public root tape `0..10` is precise: setup CoinFlipPrompt, confirmations, both shuffles, face-down starting Basic choices, source/candidate WaitPrompts; then candidate turn1 **one** `PlayCardAction` of a Psychic Energy at ordinal7, `PassTurnAction` ordinal8, and WaitPrompts ordinals9/10. There was no earlier actual normal-turn action by source and no opponent Item/Supporter/Stadium play or attack. Source's first real decision is ordinal **11**, global turn **2**, original `PassTurnAction`. SHA256 of precisely `JSON.stringify(publicRootActions.slice(0,11))` is

```text
7d96cb6cfb6739a510fc853e8bf85f4082ecc2464814572a0ae0ed244a3f9b14
```

This digest is independently computed from artifact 13432225055, using the same JSON serialization that reproduces the previously accepted original `0..36` digest `12be9779bc0f741d300c61ccbb2a9e54c16cb70e9d5621e68e5fb992306b1386`. It is a frozen prospective prefix, not a newly simulated branch.

The independently archived original [Agent35 full owner Pass observer](https://github.com/FlareZ123/experiment-01/actions/runs/42079458048), artifact **13440370610**, records at source root11:
- Owner hand (ordered): `Guzma BUS`, `Float Stone BKT`, **`Professors Letter BKT`**, `VS Seeker PHF`, `Dark Patch ASR` (SHA `043bbb453a85a15246e80fc1d4732d61710c72a382b7b34f5bdca72d09756631`).
- Source Active `Trubbish`, Benched `Mega Absol ex` and `Oranguru V`, all with **zero attached Energy**.
- Opponent Active `Latias ex` holding **one Psychic Energy**, no opponent Bench Pokémon or Stadium.
- Source public board digest `f6d65628f9f921fcdd1f3be965f25f1a3efd52db3c4778cb08904b8c87ae43e3`.

## Source-only card-payment proof

The original rank11 source 60 has exactly eight printed **Basic Darkness Energy** cards and four copies of Professor's Letter (see [verified rank11 original inventory](../aichi-2026/full-decklists.json)). None of the eight Darkness Energy are in its observed first-turn hand or attached to its observed Active/Bench. The unchanged source had taken no normal actions before Pass11, and its opponent merely attached a Psychic Energy and passed during turn1, so no Basic Darkness was consumed or discarded in either actual pre-Pass sequence. At most six Darkness cards can be in the six Prize slots. Therefore **at least two source Basic Darkness Energy must remain in the source deck** regardless of unknown exact Prize cards. This is valid at K0, before the player personally performs any deck search. The original source deck contains 46 cards at this first-turn decision under the observed 7-card setup, three face-down starting Pokémon, six prizes and ordinary turn draw; the owner hand matches 7−3+1=5.

The printed `Professor's Letter` (BREAKthrough 146) is an Item that searches the player's deck for up to two Basic Energy into their hand, then shuffles. The original opponent played no Item/Stadium/Supporter and attacked with nothing before root11. The source board and preceding roots therefore provide no active visible Item prohibition. The source held the Item physically and had eligible deck targets. A source player could genuinely **play Professor's Letter on the very first own turn** instead of passing. This is an earlier resource opportunity than the separately demonstrated source root37 turn8 Store-accepted Item.

This establishes a **paper-payable Item line**, not its native Store acceptance at root11, not an accomplished search, and not a guaranteed attack. On the same observed initial Mega Absol, `Terminal Period` needs Darkness+Colorless and its opponent Active to have exactly six damage counters, while `Claw of Darkness` needs three Energy (Darkness+Darkness+Colorless). A single ordinary attachment after Letter cannot pay these attacks from an otherwise uncharged board. Subsequent attachments, prizes, lock, gust, follow-through and opponent responses require real trials.

## Frozen prospective test and gates

Registered future experiment [`agent35-rank11-letter-firstturn-pass11-prospective-20261105.json`](../aichi-2026/registrations/agent35-rank11-letter-firstturn-pass11-prospective-20261105.json) before any source-first-turn treatment: one exact source owner Pass11→Item PlayCardAction, identical complete physical initial deck/start/coin/hand and prior roots0–10; unchanged seven other arms; no raw-State fallback; full Store action and owner prompt physical custody; at least one subsequent ordinary Energy attachment and opponent reply before any game-strength claim. The existing Agent35 `withLetterFork` research module accepts a parameterized turn/root registration but its native result schema contains historical 'Pass37' field names. A future separate runner must avoid presenting those historical field labels as changed real game evidence.

**Status:** original source genuine first-turn payable action *identified*; mutation/root11 native execution **not yet performed**. Six physical Basic Darkness at later turn8 search was observed independently [in Agent3 run 42089007694](https://github.com/FlareZ123/experiment-01/actions/runs/42089007694) but must **never** be leaked into an earlier policy choice; the pre-search guarantee here is only the count bound of two. Original target8 source late Item is Store-accepted but its search remains unresolved. Zero qualified complete games, zero certified win claims.
