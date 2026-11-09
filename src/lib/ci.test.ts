import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';

const wf = load(readFileSync('.github/workflows/deploy.yml', 'utf8')) as { jobs: { build: { steps: { name?: string; run?: string; uses?: string }[] } } };
const steps = wf.jobs.build.steps;

describe('deploy workflow', () => {
  it('builds a fresh site right before uploading it', () => {
    const upload = steps.findIndex((s) => s.uses?.startsWith('actions/upload-pages-artifact'));
    expect(steps[upload - 1].run).toBe('npm run build');
  });
});
