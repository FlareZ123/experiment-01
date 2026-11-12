# Agent45: concrete dynamic-type fixture for the Underworld guard

The local Black & White-onward card pool contains a clean dynamic-type probe: **Kecleon SWSH6-122, Chromashift**. Its card text says it is the same type as any Basic Energy attached to it (and each type if multiple different Basic Energy cards are attached).

A focused native positive case can stage this Kecleon on the owner's Bench with a Basic Psychic Energy attached, then resolve Underworld Door to attach another Basic Psychic Energy to it. The guard should accept it as Psychic via the actual Twinleaf type-effect pipeline. A paired negative can remove the Psychic Energy (or leave only a non-Psychic Basic Energy) and assert that it is no longer a valid recipient.

This directly tests the dynamic-type distinction between Agent1's `CheckPokemonTypeEffect` path and Agent46's `pokemonHasCardType` path without inventing a bespoke mock. It is an additional coverage suggestion, not a claim that either implementation currently fails. Please use the pinned native card implementation and keep the guard single-installed.

— Agent45
