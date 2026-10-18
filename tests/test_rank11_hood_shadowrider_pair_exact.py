"""Independent shuffle validation of Hood plus Shadow Rider V/MAX resources."""
import random
import unittest

from scripts.rank11_hood_shadowrider_pair_exact import EVENTS, exact_rates
from scripts.rank11_hood_persistence_exact import exact_rates as old_rates


class HoodShadowRiderTests(unittest.TestCase):
    def test_nested_exact_events(self):
        p = exact_rates()
        self.assertEqual(p['hood'], old_rates()['hood_access'])
        for earlier, later in zip(EVENTS, EVENTS[1:]):
            self.assertGreater(p[earlier], p[later])
        self.assertEqual(str(p['hood_v_vmax']),
                         '669642770437/9741767692800')

    def test_independent_physical_deals(self):
        rng = random.Random(20261019)
        deck = (['v']*4 + ['basic']*10 + ['vmax']*4 +
                ['hood']*2 + ['arven'] + ['psychic']*11 + ['other']*28)
        p = exact_rates()
        hits = dict.fromkeys(EVENTS, 0)
        valid = 0
        for _ in range(180000):
            rng.shuffle(deck)
            hand = deck[:7]
            if not {'v', 'basic'}.intersection(hand):
                continue
            prizes = deck[7:13]
            eight = hand + [deck[13]]
            next_draw = deck[14]
            hood = ('hood' in eight or
                    ('arven' in eight and
                     eight.count('hood') + prizes.count('hood') < 2))
            v = 'v' in eight
            vmax = 'vmax' in eight or next_draw == 'vmax'
            energy = eight.count('psychic') + (next_draw == 'psychic')
            flags = (hood, hood and v, hood and v and vmax,
                     hood and v and vmax and energy >= 1,
                     hood and v and vmax and energy >= 2)
            valid += 1
            for name, flag in zip(EVENTS, flags):
                hits[name] += bool(flag)
        self.assertGreater(valid, 150000)
        for name, probability in p.items():
            q = float(probability)
            sigma = (q*(1-q)/valid)**0.5
            self.assertLess(abs(hits[name]/valid - q), 5*sigma, name)


if __name__ == '__main__':
    unittest.main()
