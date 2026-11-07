# Root 93: exact-development replay proves paid Secret Box is a native alternative to Pass

**Agent 44 | 7 November 2026 | post-exposure retrospective only.** This is a precise counterfactual at one previously observed native decision, **zero qualified competitive games**.

## Source and identity

The earlier registered v9 development record `11:1000:B:new-moon-lockbreaker-v1`, archived in [run 42332015390](https://github.com/FlareZ123/experiment-01/actions/runs/42332015390), artifact `13558301530`, contains 209 accepted real Store actions and a first candidate Pass at **action ordinal 93, global turn 14, physical candidate seat 1**. Its owner-hand SHA-256 of canonical compact JSON is `9ad521c3355b19e9c3cda272b2bd1942fb09200d01b377785b0839014505cca6`.

I replayed the same registered fixed deck/deal and **unaltered common bilateral policy** until the proposed `PassTurnAction` for exactly that state. The native wrapper verified the same owner-hand hash, physical seat, global turn and **prior accepted action ordinal 92**. This establishes a matching prefix as far as those identity checks reach. The opponent's concealed hand was never read by the intervention. The action replacement is a deliberately retrospective developer test, not an actor-only autonomous policy selected without prior exposure.

## Observed physical resources before the chosen Pass

The ten owner-hand cards, in the original recorded order:

| Quantity | Exact printing | Role at global turn 14 |
| ---: | --- | --- |
| 2 | Battle VIP Pass FST | Dead after turn 1; legal Secret Box discard choices |
| 1 | Secret Box TWM | ACE SPEC Item to play |
| 2 | Rescue Carrier EVS | Retain both for now |
| 1 | Powerglass SFA | Retain |
| 2 | Lillie's Determination M1L | Discard one duplicate, retain one draw Supporter |
| 1 | Forest Seal Stone SIT | Retain |
| 1 | Mysterious Treasure FLI | Retain |

Candidate Active: Unown AOR with **zero attached Energy**, 6 Prizes remaining. Candidate Bench: Mewtwo & Mew-GX UNM, Lunatone OBF, Duskull VIV, Trevenant & Dusknoir-GX SMP, one vacancy. Source Active: Trubbish FST with **60 damage**, three Darkness Energy, with five source Benched Pokémon and 5 Prizes remaining. No Stadium was in play. This was a compelling action opportunity, but a full strategic comparison requires subsequent play.

## Native Store transaction

`simulation/evaluation/agent44-root93-secretbox-paid-store-retro.cjs` intercepts only that exact original Pass. It dispatches the real owner-held `PlayCardAction` for `Secret Box TWM` with an Item target, then settles the genuine native `ChooseCardsPrompt` payment with **three distinct physical objects**: Battle VIP Pass, Battle VIP Pass, Lillie's Determination. The engine requires exactly three; its validator approves the selection. The later genuine owner-deck search prompt contains 35 offered cards and an actual `Fog Crystal CRE`; it approves selecting that one Item, which enters the owner's hand. ShowCards and ShuffleDeck prompts are resolved, leaving no pending prompts. Secret Box and the three selected physical costs are in the discard pile, with one Lillie's Determination still held.

The original owner discard already contained two Basic Psychic Energy and one Unown. The newly obtained Fog Crystal is a resource-access option, but **this test does not yet prove whether a remaining Basic Psychic Energy is in the owner's deck or whether the subsequent attack is possible**. The owned deck identities were only inspected once its real native search prompt was active, respecting K1 information timing.

### Verification

[Manual GitHub Actions run 42345532369](https://github.com/FlareZ123/experiment-01/actions/runs/42345532369), head `b7d25b1602b7b0c9ed268324faecb7c57b36e47f`, **SUCCESS**. Its downloaded artifact `13564045054` is `agent44-root93-secretbox-paid-store-retro.json`. The artifact includes exact hand/board fingerprints, accepted payment and search flags, prompt transcript, final owner-hand/discard custody, and null error. It is reproducible by manually dispatching `.github/workflows/agent44-root93-secretbox-preflight.yml` on the recorded code revision, with the original pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## What this does and does not establish

The original common policy **passed while physically able to spend 3 naturally expendable/duplicated cards to reach an available Fog Crystal**. Thus a plausible resource-development action was lost. This is a concrete paid native alternative to the first targeted Pass, more informative than connector reachability alone. It still needs a same-root tactical continuation and a comparison against the opportunity cost of retaining Secret Box and those three cards. There is **no qualified gameplay result, win-rate result, counterfactual winning line, or proof that consuming Secret Box now is strategically dominant**. The earlier v9 native 209-action terminal remains unqualified; replaying it with knowledge of its own first mistake is post-exposure development, not fresh validation.

A high-value next test is to **play the newly found Fog Crystal**, check whether it can find a Basic Psychic, and if so attach to the currently unpowered Active Unown. Unown AOR's printed *Hidden Power* deals 10 with one Colorless; Trubbish FST has 70 HP and already has 60 damage in this state, so the attack might knock it out if all intervening legality and timing conditions hold. Confirm through the actual Store, including attack settlement and Prize-taking. Record the physical deal and leave other game-policy behavior unchanged in an A/B/A replay before considering shared policy adoption.
