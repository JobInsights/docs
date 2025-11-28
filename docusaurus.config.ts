import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Job Market Insights',
  tagline: 'Data Science Career Analysis - DIS08 Datenmodellierung [WS 2025/2026]',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://job-market-insights.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'your-github-username', // Usually your GitHub org/user name.
  projectName: 'job-market-insights', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      '@docusaurus/theme-mermaid',
      {
        theme: { light: 'default', dark: 'dark' },
      },
    ],
  ],

  plugins: [],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Job Market Insights',
      logo: {
        alt: 'Job Market Insights Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'projectSidebar',
          position: 'left',
          label: 'Project Documentation',
        },
        {
          to: '/docs/project-journey',
          label: 'Project Journey',
          position: 'left',
        },
        {
          href: 'https://github.com/your-github-username/job-market-insights',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Project',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
            {
              label: 'Project Journey',
              to: '/docs/project-journey',
            },
            {
              label: 'Data Collection',
              to: '/docs/data-collection/intro',
            },
            {
              label: 'Data Cleaning',
              to: '/docs/data-cleaning/intro',
            },
          ],
        },
        {
          title: 'Analysis',
          items: [
            {
              label: 'Data Presentation',
              to: '/docs/data-presentation/intro',
            },
            {
              label: 'Interactive Dashboard',
              to: '/docs/data-presentation/dashboard',
            },
            {
              label: 'Skills Overview',
              to: '/docs/data-presentation/skills-overview',
            },
            {
              label: 'Limitations',
              to: '/docs/conclusion/limitations',
            },
          ],
        },
        {
          title: 'Course',
          items: [
            {
              label: 'DIS08 Datenmodellierung',
              href: 'https://www.example-university.edu/course/dis08', // Replace with actual course URL
            },
            {
              label: 'Data Science Program',
              href: 'https://www.example-university.edu/data-science', // Replace with actual program URL
            },
            {
              label: 'Academic Year 2025/2026',
              href: '#',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'GitHub Repository',
              href: 'https://github.com/your-github-username/job-market-insights',
            },
            {
              label: 'Python Implementation',
              to: '/docs/data-collection/indeed-scraping',
            },
            {
              label: 'Interactive Demo',
              href: 'https://job-market-insights.vercel.app', // Replace with actual deployment URL
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Job Market Insights Project - DIS08 Datenmodellierung [WS 2025/2026]. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
