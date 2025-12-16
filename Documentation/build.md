# Building It Yourself

## Overview

This guide will walk you through setting up the FC-Catalyst Prediction Tool locally for development or deployment. The site is built using VitePress, a modern static site generator powered by Vue 3 and Vite.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js**: Version 18.0 or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm**: Version 9.0 or higher (comes with Node.js)
  - Verify installation: `npm --version`

### Optional Tools

- **Git**: For cloning the repository
  - Download from [git-scm.com](https://git-scm.com/)

- **VS Code**: Recommended editor with Vue and VitePress extensions
  - Download from [code.visualstudio.com](https://code.visualstudio.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/fc-catalyst-prediction.git
cd fc-catalyst-prediction
```

If you don't have Git installed, you can download the source code as a ZIP file from the repository.

### 2. Install Dependencies

Install all required npm packages:

```bash
npm install
```

This will install VitePress and all other dependencies defined in `package.json`.

::: tip
If you encounter permission errors on Linux/Mac, avoid using `sudo`. Instead, configure npm to use a different directory for global packages.
:::

### 3. Verify Installation

Check that VitePress is installed correctly:

```bash
npx vitepress --version
```

You should see the VitePress version number (e.g., `1.6.4`).

## Development

### Starting the Development Server

Run the development server with hot module replacement:

```bash
npm run dev
```

This command will:
- Start a local development server
- Watch for file changes
- Automatically reload the browser when changes are detected

The site will be available at:
```
http://localhost:5173
```

::: info
The port number may vary if 5173 is already in use. Check the console output for the actual URL.
:::

### Development Workflow

1. **Edit Content**: Modify markdown files in the root and subdirectories
2. **Update Components**: Edit Vue components in `.vitepress/theme/components/`
3. **Configure Site**: Modify `.vitepress/config.mjs` for navigation and settings
4. **Style Changes**: Update `.vitepress/theme/style.css` for custom styles

Changes will be reflected immediately in your browser thanks to Vite's hot module replacement.

### Project Structure

```
fc-catalyst-prediction/
├── .vitepress/
│   ├── config.mjs           # Site configuration
│   ├── theme/
│   │   ├── index.js         # Theme customization
│   │   ├── style.css        # Custom styles
│   │   └── components/      # Vue components
│   │       └── PredictPage.vue
│   └── dist/                # Build output (generated)
├── Documentation/
│   ├── api.md               # API documentation
│   └── build.md             # This file
├── Introduction/
│   ├── whats-this.md        # Project introduction
│   └── how-to-use.md        # Usage guide
├── index.md                 # Home page
├── predict.md               # Prediction page
├── about.md                 # About page
└── package.json             # Dependencies and scripts
```

## Building for Production

### Create Production Build

Generate optimized static files for deployment:

```bash
npm run build
```

This command will:
- Bundle and minify all assets
- Generate static HTML files
- Optimize images and resources
- Output files to `.vitepress/dist/`

Build output:
```
.vitepress/dist/
├── assets/          # CSS, JS, and other assets
├── Documentation/   # Documentation pages
├── Introduction/    # Introduction pages
├── index.html       # Home page
├── predict.html     # Prediction page
└── about.html       # About page
```

### Preview Production Build

Test the production build locally before deployment:

```bash
npm run preview
```

This starts a local server serving the built files from `.vitepress/dist/`. The preview server will be available at:
```
http://localhost:4173
```

::: warning
The preview server is for testing only. Use a proper web server for production deployment.
:::

## Deployment

### Static Hosting Platforms

The built site can be deployed to any static hosting service:

#### Netlify

1. Connect your Git repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.vitepress/dist`
3. Deploy

#### Vercel

1. Import your Git repository to Vercel
2. Vercel will auto-detect VitePress
3. Deploy with default settings

#### GitHub Pages

Add a deploy script to `package.json`:

```json
{
  "scripts": {
    "deploy": "vitepress build && gh-pages -d .vitepress/dist"
  }
}
```

Install gh-pages:
```bash
npm install -D gh-pages
```

Deploy:
```bash
npm run deploy
```

#### Manual Deployment

Upload the contents of `.vitepress/dist/` to your web server:

```bash
# Example using rsync
rsync -avz .vitepress/dist/ user@server:/var/www/html/
```

### Environment Variables

For production deployments, you may need to configure:

- **Base URL**: Set in `.vitepress/config.mjs` if deploying to a subdirectory
- **API Endpoints**: Update API URLs in components for production

Example config for subdirectory deployment:

```javascript
// .vitepress/config.mjs
export default {
  base: '/fc-catalyst/',
  // ... other config
}
```

## Troubleshooting

### Common Issues

#### Port Already in Use

If the default port is occupied:

```bash
# Specify a different port
npx vitepress dev --port 3000
```

#### Build Failures

Clear cache and reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Module Not Found Errors

Ensure all dependencies are installed:

```bash
npm install
```

Check that import paths in components are correct.

#### Styling Issues

Clear VitePress cache:

```bash
rm -rf .vitepress/cache
npm run dev
```

### Getting Help

If you encounter issues:

1. Check the [VitePress documentation](https://vitepress.dev/)
2. Search existing [GitHub issues](https://github.com/your-org/fc-catalyst-prediction/issues)
3. Create a new issue with:
   - Node.js and npm versions
   - Operating system
   - Error messages
   - Steps to reproduce

## Advanced Configuration

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory:
   ```
   your-domain.com
   ```

2. Configure DNS records with your domain provider

3. Enable HTTPS through your hosting platform

### Performance Optimization

- **Image Optimization**: Use WebP format for images
- **Code Splitting**: VitePress handles this automatically
- **Caching**: Configure cache headers on your web server
- **CDN**: Use a CDN for faster global delivery

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .vitepress/dist
```

## Development Tips

1. **Hot Reload**: Keep the dev server running while editing
2. **Component Testing**: Test Vue components in isolation
3. **Markdown Preview**: Use VS Code's markdown preview alongside the dev server
4. **Browser DevTools**: Use Vue DevTools extension for debugging
5. **Incremental Builds**: VitePress only rebuilds changed files

## Next Steps

- Read the [API Documentation](./api.md) to integrate with the prediction API
- Explore [VitePress features](https://vitepress.dev/guide/what-is-vitepress) for advanced customization
- Contribute to the project by submitting pull requests

## Resources

- [VitePress Documentation](https://vitepress.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
