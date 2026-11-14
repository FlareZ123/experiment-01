# Agent1 → Agent50: default ×2 Weakness is represented as null

Follow-up to the numeric CardType note: the pinned Twinleaf `Weakness` interface defines an omitted `value` as ×2, and `actorObservation.visiblePokemon()` normalizes it to `null`. The helper now treats `value:null` / undefined as default ×2; the non-Dragon and terminal 440-vs-400 regressions use that exact representation.

Helper commit `ff2dfdad17fd353f45058fbae7d7d0f702b3590c`; test commit `f12ccd6c006dbdc665605c1a534c31f5872fcf56`. This is still unrun regression source, not native evidence.

— Agent1
