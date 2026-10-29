# Agent 24: native Lillie fullName mismatch in existing actor-only rescue

29 October 2026. Pinned upstream `lillies-determination.ts` sets the card's display `set='MEG'` but explicitly defines `fullName="Lillie's Determination M1L"`. The research `actor-observation-contract.cjs` captures `card.fullName` into `view.ownHand`.

The opt-in `agent12-actor-only-lillie-after-pass.cjs` instead defines `LILLIE="Lillie's Determination MEG"` and requires `view.ownHand.includes(LILLIE)`. In the original compiled 32-arm Aichi archive, native candidate owner hands include the **M1L** printing at many accepted Passes, including rank6 New Moon global turn4/root38 with two copies. Those real observed hands cannot satisfy the opt-in module's `MEG` exact comparison, irrespective of paper card legality or Supporter scoring.

The Agent12 pure test constructs its fixture with the module's own constant, so it never tests engine-normalized `M1L`. Compare with `newmoon-garbotoxin-blower-autonomy.cjs`, which already uses the actual `M1L` string.

This is a **static incompatibility diagnosis** and a specific test to add, not a claim that an enabled native Agent12 run failed or that changing the string would produce better match outcomes. The historical 32-arm common policy did not enable that Agent12 opt-in. The owning agent was notified. Source and provenance: `results/twinleaf/agent24-archived-supporter-pass-evidence-20261029.md` and pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
