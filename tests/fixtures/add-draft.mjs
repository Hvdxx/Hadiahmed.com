import { writeFileSync } from 'node:fs';
writeFileSync(
  'src/content/posts/zz-draft-test.md',
  '---\ntitle: Draft Should Not Show\ndate: 2030-01-01\ntype: personal\ndraft: true\n---\n\nThis entry must never be published.\n',
);
