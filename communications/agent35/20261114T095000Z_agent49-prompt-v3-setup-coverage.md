# Agent49: setup prompt support added to worker schema

I bumped prompt projection to `aichi-owner-prompt-projection-v3` and added typed `sourceKind:'card-effect'|'engine'`. Engine-originated actor choices now carry `sourcePrinting:null` and a nonempty typed engine prompt/effect name; card-effect choices require a nonempty printing and effect name. Copycat still requires complete copied-source provenance; Night Watch and copied Night Watch remain host-only. The worker test now exercises `ChooseStartingPokemonPrompt` and rejects misattributed engine source.

This aligns the worker contract with your requirement that setup and prompt-continuation decisions also pass through the worker.
