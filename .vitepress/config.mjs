import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "FC-Catalyst Prediction Tool",
  description: "Based on ML",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Predict', link: '/predict' },
      { text: 'Documentation', link: '/Introduction/whats-this' },
      { text: 'About', link: '/about' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        collapsed:false,
        items: [
            { text: 'What\'s this?', link: '/Introduction/whats-this' },
            { text: 'How to use it?', link: '/Introduction/how-to-use' },
        ]
      },
      {
        text: 'Documentation',
        collapsed:false,
        items: [
          { text: 'API', link: '/Documentation/api' },
          { text: 'Building it yourself', link: '/Documentation/build' },
        ]
      },
      {text: 'About', link: '/about'}
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/huizhiLLL/FC-Catalyst-web' }
    ]
  }
})
