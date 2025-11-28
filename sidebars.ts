import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  projectSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction'
    },
    {
      type: 'doc',
      id: 'project-journey',
      label: 'Project Journey'
    },
    {
      type: 'category',
      label: 'Data Collection',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'data-collection/intro',
          label: 'Overview'
        },
        {
          type: 'doc',
          id: 'data-collection/stepstone-attempt',
          label: 'Stepstone Attempt'
        },
        {
          type: 'doc',
          id: 'data-collection/indeed-scraping',
          label: 'Indeed Scraping'
        },
        {
          type: 'doc',
          id: 'data-collection/instant-data-scraper',
          label: 'Instant Data Scraper'
        },
        {
          type: 'doc',
          id: 'data-collection/webscraper-io',
          label: 'WebScraper.io'
        }
      ]
    },
    {
      type: 'category',
      label: 'Data Cleaning',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'data-cleaning/intro',
          label: 'Overview'
        },
        {
          type: 'doc',
          id: 'data-cleaning/combining-data',
          label: 'Combining Data'
        },
        {
          type: 'doc',
          id: 'data-cleaning/deduplication',
          label: 'Deduplication'
        },
        {
          type: 'doc',
          id: 'data-cleaning/data-cleanup',
          label: 'Data Cleanup'
        },
        {
          type: 'doc',
          id: 'data-cleaning/embeddings',
          label: 'Embeddings'
        },
        {
          type: 'doc',
          id: 'data-cleaning/clustering',
          label: 'Clustering'
        },
        {
          type: 'doc',
          id: 'data-cleaning/keyword-tagging',
          label: 'Keyword Tagging'
        },
        {
          type: 'doc',
          id: 'data-cleaning/database',
          label: 'Database Storage'
        }
      ]
    },
    {
      type: 'category',
      label: 'Data Presentation',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'data-presentation/intro',
          label: 'Overview'
        },
        {
          type: 'doc',
          id: 'data-presentation/dashboard',
          label: 'Dashboard'
        },
        {
          type: 'doc',
          id: 'data-presentation/filtering',
          label: 'Filtering'
        },
        {
          type: 'doc',
          id: 'data-presentation/tsne-visualization',
          label: 't-SNE Visualization'
        },
        {
          type: 'doc',
          id: 'data-presentation/skills-overview',
          label: 'Skills Overview'
        }
      ]
    },
    {
      type: 'category',
      label: 'Conclusion',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'conclusion/limitations',
          label: 'Limitations & Future Work'
        }
      ]
    }
  ]
};

export default sidebars;
