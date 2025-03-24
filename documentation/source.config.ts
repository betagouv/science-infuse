import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { remarkMermaid } from '@theguild/remark-mermaid';
 
export const { docs, meta } = defineDocs();

export default defineConfig({
    mdxOptions: {
      remarkPlugins: [remarkMermaid],
    },
  });
