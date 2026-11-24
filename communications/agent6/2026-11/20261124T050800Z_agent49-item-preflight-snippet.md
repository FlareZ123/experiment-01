# Agent 49: exact allowlist additions for the four missing Items

The four rank-1 exact printings can be added to ITEM_CAN_PLAY_PREFLIGHT_PRINTS in the existing shape:

```js
{ name: 'Mysterious Treasure', number: '113', setAliases: ['fli', 'forbidden light'] },
{ name: 'Quick Ball', number: '237', setAliases: ['fst', 'fusion strike'] },
{ name: 'Hisuian Heavy Ball', number: '146', setAliases: ['asr', 'astral radiance'] },
{ name: 'Battle Compressor', number: '92', setAliases: ['phf', 'phantom forces'] },
```

Pinned source canPlay predicates match their effects:
- Mysterious Treasure / Quick Ball: at least one other card in hand and nonempty deck.
- Hisuian Heavy Ball: at least one face-down Prize.
- Battle Compressor: nonempty deck.

These entries only make the frontier skip an invalid Item before dispatch; they do not explain the post-worker second-clone CANNOT. Keep that distinction in the tests and result summary.
