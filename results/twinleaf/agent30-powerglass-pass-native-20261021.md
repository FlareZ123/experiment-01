# Powerglass after Pass: pinned native Store confirmation

**Agent 30, 21 October 2026 UTC.** This is a constructed-board mechanics regression. It contributes **zero competitively qualified games**.

## Exact question

Can a held Powerglass SFA be equipped to a zero-Energy Active Mewtwo & Mew-GX UNM, followed by a Pass without attacking, and can its optional end-of-turn effect attach a physical Basic Psychic Energy card from its owner's discard? The question matters because Agent 41 observed the same kind of unused Tool/Energy resource on a genuine **rank-11 source-first** New Moon development game at turns 42–58. See [that separate genuine-owner observation](../aichi-2026/agent41-sourcefirst-powerglass-discard-window-20261021.md).

## Compiled native evidence

- Pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, unchanged `vendor/twinleaf`.
- Final research revision **`df52a3cccfd19a7f370eeb9de5f1887881885a31`**.
- [Manual GitHub Actions 39689163838](https://github.com/FlareZ123/experiment-01/actions/runs/39689163838), job `canonical-four-arm`, **SUCCESS**. Its `Verify genuine Powerglass after-Pass native attachment` step **SUCCESS** and the unchanged canonical four-arm historical runner step **SUCCESS**. Earlier failed script iterations are identified below.
- [Executable source](../../simulation/twinleaf/agent41-powerglass-after-pass-native.cjs), originating from Agent 41 and repaired in this invocation. The test uses native `Store`, genuine `PlayCardAction`, `PassTurnAction`, `AttachEnergyPrompt`, and `ResolvePromptAction`. The staged board sets both players' six Prizes and actual Pokémon/Tool/Energy objects.
- Printed rule provenance: supplied *Advanced Player's Rulebook* v3.4, E-21, permits end-turn effects after ending without attacking. Pinned `power-hourglass.ts` checks the attached Active Tool at `EndTurnEffect` and permits choosing zero or one Basic Energy cards from owner discard.

The compiled process printed:

```json
{
  "source": {
    "active": "Mewtwo & Mew-GX UNM",
    "copyDonor": "Gengar & Mimikyu-GX TEU",
    "tool": "Powerglass SFA",
    "energy": "Psychic Energy MEE"
  },
  "rootActions": ["PlayCardAction", "PassTurnAction", "ResolvePromptAction"],
  "observedPrompts": ["AttachEnergyPrompt"],
  "after": {
    "activeToolCount": 1,
    "activeEnergyCount": 1,
    "ownDiscardPsychicRemaining": false,
    "usedGX": false
  }
}
```

The native test additionally asserted physical Tool hand consumption, target ownership, prompt source identity, `min=0,max=1`, exact card/target assignment validation, and source Basic Energy removal after attachment. This establishes a **mechanically legal and executable after-Pass path** in the constructed scene.

## Failure/repair trail

1. A proposed 26th `workflow_dispatch` input caused a GitHub workflow parsing failure. It was immediately removed; canonical manual-only workflow retains its original **25 input** limit and no automatic per-commit experiment was introduced. The native and pure tests were added to the existing manually dispatched test steps, without activating Powerglass during baseline games.
2. First compiled [run 39688430875](https://github.com/FlareZ123/experiment-01/actions/runs/39688430875) failed on an existing unescaped apostrophe at the test's assertion. Fixed in `d87407715d48402e510fbc2dbad3c1492c668b7a`, source syntax checked before rerun.
3. Second compiled [run 39688769266](https://github.com/FlareZ123/experiment-01/actions/runs/39688769266) failed constructing an empty native `Player.bench`. The pinned `Player` defaults its Bench to an empty array; `df52a3c` explicitly creates a `PokemonCardList` before adding the donor. The final successful run is the first to reach and settle the Tool/Pass/Energy action sequence.

## What remains unproven

The staged scene does **not** establish that the weak unmodified bot would choose a nonempty optional `AttachEnergyPrompt`. The native `simple-bot/prompt-resolver/attach-energy-prompt-resolver.ts` includes the empty array as a scored option when `min=0`; a genuine source-dealt owner prompt and the selected physical Energy must be audited separately. Existing [Special Energy filter defect](powerglass-special-energy-filter.md) requires a source-validity guard for any custom resolver.

There has been **no same-head source-first candidate Powerglass root-versus-Pass comparison**, opponent follow-up, payable and settled copied attack, or game-level gain. The historical rank-11 opportunity is retrospectively selected and competitively unqualified. The stage establishes one missing mechanical seam, not strength against the full opponent field. The repository still identifies **29/32** exact Aichi opponent 60s, with **zero** qualified competitive games and no demonstrated 99.5% list.

## Next testable question

Under a genuine source-first owner root with held Powerglass, visible own Basic Psychic in discard, empty Tool slot, and unlocked Mewtwo, compare the identical physical deal under opt-in `AGENT41_ACTOR_POWERGLASS_ROOT_DEV=false/true`. Retain both actor and source continuations and audit: accepted Tool play, end-turn AttachEnergy prompt, **actual chosen Basic** versus empty, later Perfection prompt, copied attack settlement, Prizes, caps and errors. Preserve a control with every other common-policy option fixed. The canonical `workflow_dispatch` is at its 25-input cap; coordinate a safe trigger arrangement with its caretaker rather than changing an unrelated experiment's semantics.
