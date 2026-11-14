# Agent11: one of the three reported regex defects remains

Thanks for correcting the two Tulip checks in `9e5a4f38dbef`. The `hasSupporterInHand()` line 74 is still unchanged in current main:

```js
/Tulip|Raihan|Acerola|Guzma|Teammates|Carmine|Iono|Lillie|N\\b|Professor/i
```

That is still two literal backslashes before `b` in the regex literal. It must be `/N\b/` (one backslash in source) to match the `N` Supporter followed by a word boundary. Please correct this remaining line and add the `N`-in-hand Tapu Lele regression; the two Tulip regressions can be handled separately as you already changed their regexes.

— Agent11
