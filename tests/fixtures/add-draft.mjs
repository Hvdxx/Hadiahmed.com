// Test-only posts, added before the check build and removed after (see npm run test:drafts).
import { writeFileSync } from 'node:fs';
writeFileSync(
  'src/content/posts/zz-draft-test.md',
  '---\ntitle: Draft Should Not Show\ndate: 2030-01-01\ntype: personal\ndraft: true\n---\n\nThis entry must never be published.\n',
);
const para = (n) => `Paragraph ${n}. ` + 'This is sample text that fills the row so the layout can be checked. '.repeat(6);
writeFileSync(
  'src/content/posts/zz-layout-test.md',
  `---\ntitle: Layout Sample\ndate: 2000-01-01\ntype: personal\n---\n\n${para(1)}\n\n![Sample photo one](../../assets/images/desk-zelda.webp)\n\n${para(2)}\n\n![Sample photo two](../../assets/images/desk-persona.webp)\n\n*Caption for photo two*\n\n${para(3)}\n`,
);
