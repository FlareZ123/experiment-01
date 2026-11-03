"""SFT-style deterministic proof cases for the paid Muk/Regidrago opening audit."""
from __future__ import annotations

import importlib.util
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('alchemy_paid_muk', ROOT/'simulation'/'evaluation'/'agent2-alchemy-paid-muk-turn1.py')
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def deck():
    return MODULE.input_decks(ROOT)[2][0]


def witness(held, initial=None, prized=None):
    return MODULE.turn_one_witness(held, prized or [], initial or held[:7], deck())


class PaidMukOpeningTest(unittest.TestCase):
    def test_registered_exact_60s_and_physical_pair(self):
        manifests, decks, counts = MODULE.input_decks(ROOT)
        self.assertEqual(len(decks[0]), 60)
        self.assertEqual(sum(x != y for x,y in zip(*decks)), 1)
        self.assertEqual(Counter(decks[0]) - Counter(decks[1]), Counter({'Quick Ball':1}))
        self.assertEqual(Counter(decks[1]) - Counter(decks[0]), Counter({'Boost Shake':1}))
        self.assertEqual(manifests[0]['deck_identity_sha256'],
                         '21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769')

    def test_true_paid_turn2_line_initial_regidrago_active(self):
        h = ['Regidrago V', 'Alolan Grimer', 'Boost Shake',
             'Regidrago VSTAR', 'Double Dragon Energy',
             'Basic Grass Energy', 'Battle Compressor Team Flare Gear', 'Guzma']
        self.assertEqual(witness(h), (True, True, True, True))
        print('PASS: first-turn Regidrago Active + paid Muk + DDE, held VSTAR and second Energy; Compressor gives Dragon payload')

    def test_energy_is_mandatory_for_second_turn_attack_readiness(self):
        h = ['Regidrago V', 'Alolan Grimer', 'Boost Shake',
             'Regidrago VSTAR', 'Basic Grass Energy', 'Carmine',
             'Battle Compressor Team Flare Gear']
        self.assertEqual(witness(h), (True, False, False, False))

    def test_search_requires_separate_spendable_donor_after_reserved_pieces(self):
        h = ['Regidrago V', 'Boost Shake', 'Regidrago VSTAR',
             'Double Dragon Energy', 'Basic Grass Energy', 'Mysterious Treasure']
        self.assertEqual(witness(h, initial=['Regidrago V']), (True, False, False, False))
        self.assertEqual(witness(h+['Dialga-GX'], initial=['Regidrago V']),
                         (True, True, True, True))
        print('PASS: mandatory discard donor is distinct from search, VSTAR and two Energy')

    def test_compressor_cannot_be_both_required_search_discard_and_item_play(self):
        h = ['Regidrago V','Boost Shake','Regidrago VSTAR',
             'Double Dragon Energy','Basic Grass Energy',
             'Mysterious Treasure','Battle Compressor Team Flare Gear']
        self.assertEqual(witness(h), (True, True, False, False))
        self.assertEqual(witness(h+['Guzma']), (True, True, True, True))
        print('PASS: native-free paper payment keeps held Compressor for its own effect')

    def test_muk_must_really_remain_in_deck(self):
        h = ['Regidrago V','Alolan Grimer','Boost Shake','Regidrago VSTAR',
             'Double Dragon Energy','Basic Fire Energy','Battle Compressor Team Flare Gear']
        self.assertEqual(witness(h, prized=['Alolan Muk','Alolan Muk']),
                         (False,False,False,False))

    def test_non_grimer_starter_and_active_position(self):
        h = ['Alolan Grimer','Boost Shake','Regidrago VSTAR',
             'Double Dragon Energy','Basic Fire Energy','Battle Compressor Team Flare Gear',
             'Crispin','Regidrago V']
        self.assertEqual(witness(h, initial=h[:7]),
                         (False, False, False, False))
        h[6] = 'Budew'
        self.assertEqual(witness(h, initial=h[:7]),
                         (True, True, True, False))
        print('PASS: Bench Regidrago is not credited with second-turn active Apex Dragon without mobility')

    def test_two_searches_need_two_donors(self):
        h = ['Budew','Boost Shake','Mysterious Treasure','Quick Ball',
             'Regidrago VSTAR','Double Dragon Energy','Basic Grass Energy',
             'Dialga-GX']
        self.assertEqual(witness(h, initial=['Budew']),
                         (True, False, False, False))
        h.append('Guzma')
        self.assertEqual(witness(h, initial=['Budew']),
                         (True, True, True, False))

    def test_payload_requires_actual_route_not_gratuitous_free_discard(self):
        h = ['Regidrago V','Alolan Grimer','Boost Shake',
             'Regidrago VSTAR','Double Dragon Energy','Basic Grass Energy',
             'Dialga-GX','Guzma']
        self.assertEqual(witness(h), (True,True,False,False))
        h.append('Quick Ball')
        self.assertEqual(witness(h), (True,True,True,True))
        # Surplus Quick Ball has a real discard payment and an eligible Basic target.

    def test_exact_mulligan_probability(self):
        bonus, source_valid = MODULE.opponent_bonus_probability(4)
        self.assertAlmostEqual(bonus, 0.5488513367202532, places=13)
        self.assertAlmostEqual(source_valid, 1-__import__('math').comb(56,7)/__import__('math').comb(60,7))

    def test_seeded_small_panel_monotonic_and_reproducible(self):
        a = MODULE.run(ROOT, trials=64, seed=300)
        b = MODULE.run(ROOT, trials=64, seed=300)
        self.assertEqual(a, b)
        for row in a['strata']:
            for candidate in ('v0','v1'):
                metrics = row['metrics']
                self.assertGreaterEqual(metrics['searchFundedMukRegi'][candidate],
                                        metrics['energyVstarReady'][candidate])
                self.assertGreaterEqual(metrics['energyVstarReady'][candidate],
                                        metrics['payloadReady'][candidate])
                self.assertGreaterEqual(metrics['payloadReady'][candidate],
                                        metrics['activeRegiApexTurn2'][candidate])
        print('PASS: 8 Basic-count strata; pinned RNG replay, four nested resource gates monotone')


if __name__ == '__main__':
    unittest.main(verbosity=2)
