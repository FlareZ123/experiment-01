"""Standard-library tests for the PyYAML-backed manual dispatch preflight."""
import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from manual_dispatch_preflight import inspect_workflow


def workflow(count, *, trigger='workflow_dispatch', bad_reference=False):
    inputs = '\n'.join(
        f'      choice_{i}:\n        type: boolean\n        default: false'
        for i in range(count)
    )
    expressions = '\n'.join(
        f'          A{i}: ${{{{ inputs.choice_{i} }}}}' for i in range(count)
    )
    if bad_reference:
        expressions += '\n          BAD: ${{ inputs.nonexistent }}'
    return f'''name: Test
on:
  {trigger}:
    inputs:
{inputs}
jobs:
  test:
    runs-on: ubuntu-latest
    env:
{expressions}
    steps:
      - run: echo checked
'''


class PreflightTests(unittest.TestCase):
    def test_25_inputs_allowed(self):
        self.assertEqual(inspect_workflow(workflow(25), 'x', canonical=True)['remaining'], 0)

    def test_26_inputs_rejected(self):
        with self.assertRaisesRegex(ValueError, '26 inputs'):
            inspect_workflow(workflow(26), 'x', canonical=True)

    def test_missing_binding_rejected(self):
        with self.assertRaisesRegex(ValueError, 'undeclared input'):
            inspect_workflow(workflow(1, bad_reference=True), 'x', canonical=True)

    def test_unused_input_rejected(self):
        with self.assertRaisesRegex(ValueError, 'not used'):
            inspect_workflow(workflow(1).replace('A0: ${{ inputs.choice_0 }}', 'A0: true'), 'x', canonical=True)

    def test_push_trigger_rejected_on_canonical(self):
        source = workflow(1).replace('on:\n', 'on:\n  push:\n')
        with self.assertRaisesRegex(ValueError, 'manual-only'):
            inspect_workflow(source, 'x', canonical=True)

    def test_duplicate_input_keys_rejected(self):
        source = workflow(1).replace('jobs:\n',
          '      choice_0:\n        type: boolean\n        default: false\njobs:\n')
        with self.assertRaisesRegex(Exception, 'duplicate key'):
            inspect_workflow(source, 'x', canonical=True)

    def test_yaml_on_key_preserved(self):
        report = inspect_workflow(workflow(2), 'x', canonical=True)
        self.assertTrue(report['has_dispatch'])

    def test_optional_other_workflows(self):
        self.assertEqual(inspect_workflow('on: schedule\njobs: {}', 'x')['inputs'], 0)

    def test_canonical_boolean_must_default_disabled(self):
        with self.assertRaisesRegex(ValueError, 'default false'):
            inspect_workflow(workflow(1).replace('default: false','default: true'), 'x', canonical=True)


if __name__ == '__main__':
    unittest.main()
