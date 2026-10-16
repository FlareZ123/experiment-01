# Garbotoxin Tool removal reactivates Vileplume Item lock midturn

**Agent 6, 16 October 2026.** Actual-action pinned Twinleaf staged-board regressions, with no full-game or competitive win-rate inference. These tests complement the [21-case Garbotoxin / Vileplume / Hood priority study](garbotoxin-vileplume-priority.md).

## Why the sequencing matters

Vileplume **AOR 3** prohibits both players' Item cards while Irritating Pollen is active. Garbodor **BKP 57** suppresses that Ability only while a Pokémon Tool is attached. A Tool-removal action therefore changes which cards are legal **immediately**, even during the acting player's own turn. Stealthy Hood **UNB 186** on opposing Vileplume prevents Garbotoxin from affecting it, so an Item-only Tool removal may already be unavailable.

The exact published Aichi [rank-2 Vileplume Control](../aichi-2026/full-decklists.json) includes **1 Faba LOT**, 3 Stealthy Hood, and 2 Vileplume AOR. Published Absol Garbodor ranks **8 and 22** each include one **Field Blower GRI**; ranks 11 and 16 use Garbotoxin without a published Field Blower. Every published Garbodor list includes Tools. These are card-presence facts, with no implication that an actual policy chooses a self-disabling Tool removal.

## Field Blower: six real Item action sequences

The [Field Blower script](../../simulation/twinleaf/garbotoxin-removal-tempo.cjs) executes `PlayCardAction(Field Blower GRI)`, the real `ChoosePokemonPrompt` selecting a Tool-equipped Garbodor, resolves its Tool discard, then attempts a distinct `PlayCardAction(Switch SVI)`. It checks the Tool in the discard pile, Garbodor's attachment, the Item's hand status, and the follow-up prompt or rejection.

| Starting board | Field Blower | Following Switch |
| --- | --- | --- |
| Garbodor with Tool, **no Vileplume** | Discards Garbodor's Tool | **Allowed** |
| Garbodor with Tool, **bare opposing Vileplume** | Discards Garbodor's Tool, ending Garbotoxin | **Blocked by restored Irritating Pollen** |
| Garbodor with Tool, **opposing Vileplume wearing Hood** | **Blocked by existing Item lock** | **Blocked** |

Each scenario was tested with either player as active seat, six cases total. Every expected state/action assertion passed [manual CI 38873257015](https://github.com/FlareZ123/experiment-01/actions/runs/38873257015). The initial [run 38872946040](https://github.com/FlareZ123/experiment-01/actions/runs/38872946040) failed because the fixture omitted the `state` required by `ChoosePokemonPrompt.validate(result,state)`. This is a test-harness repair, not a game-engine defect.

## Faba: eight real Supporter action sequences

The [Faba script](../../simulation/twinleaf/garbotoxin-faba-tempo.cjs) tests a different route: Vileplume's owner uses `Faba LOT` as their Supporter to send the opposing Tool on Garbodor to the **Lost Zone**, selecting a real `SelectPrompt` and a real `ChoosePokemonPrompt`. It then attempts Switch and checks that Faba was consumed or denied appropriately.

| Vileplume owned by Faba player | Supporter already spent | Faba's Tool removal | Following Switch |
| --- | --- | --- | --- |
| Absent | No | **Succeeds** | **Allowed** |
| Bare Vileplume | No | **Succeeds**; Vileplume lock resumes | **Blocked** |
| Hood-protected Vileplume | No | **Succeeds**, despite existing Item lock | **Blocked** |
| Bare Vileplume | Yes | **Denied**, Garbotoxin remains | **Allowed** |

Each scenario was run with the Vileplume player in both physical player seats (eight cases). The full matrix passed [manual CI 38874242873](https://github.com/FlareZ123/experiment-01/actions/runs/38874242873). A previous run failed in a test-harness action chain that retained references to a player across a denied Store dispatch. The passing version reacquires `store.state`, the acting player and target Pokémon after every attempt, using stable card IDs. Do not draw a game mechanic conclusion from that initial fixture failure.

## Evidence category and next gate

Both fixtures inject a physically coherent midgame board with stage stacks and nonempty Prize/deck zones. They use *actual pinned Store actions and prompt results* for the Tool removals and subsequent Item. They do **not** model the starting hand probability, stage evolution turns, Supporter contention beyond a single spent flag, K0/K1 knowledge, real-field opponent decisions, match completion, or deck win rates.

The result creates a decision-policy sequencing constraint: **use other necessary Items before deliberately removing the opponent's Ability lock when doing so activates your own Vileplume lock**, unless that lock is the immediate strategic objective. The opponent may have further counterplay. Conditional board truth does not establish how often this line should be taken.

Reproduction: [manual-only workflow](../../.github/workflows/aichi-garbotoxin-crosslock.yml), pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, explicitly sourced card printings in the scripts.
