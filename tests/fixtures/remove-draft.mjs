import { rmSync } from 'node:fs';
for (const f of ['zz-draft-test.md', 'zz-layout-test.md']) rmSync(`src/content/posts/${f}`, { force: true });
