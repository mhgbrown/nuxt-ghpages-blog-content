# nuxt-ghpages-blog-content [Consolidated]

> ⚠️ **Note:** This content repository has been successfully consolidated directly into the main [nuxt-ghpages-blog](https://github.com/mhgbrown/nuxt-ghpages-blog) repository under `src/content/posts/`!

To simplify your deployment, update the technology stack, and optimize your developer workflow, you no longer need to maintain two split repositories. All active, deployed blog posts are now housed and version-controlled directly inside the main codebase folder.

### Creating a New Post

To create a new markdown post, navigate to the main Astro repository and run the simplified creation script:

```bash
cd nuxt-ghpages-blog
npm run post "My New Post Title"
```

This script will automatically generate a correctly formatted markdown file with timestamp frontmatter directly inside the active Content Collections folder (`src/content/posts/`).
