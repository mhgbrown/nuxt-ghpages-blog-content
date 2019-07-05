---
title: >-
  Vue, Server Side Rendering, and Handling Dependencies that Require a Browser
  Environment
date: 1562342317717
---

In a recent project for a certain startup, I was tasked with creating graphs in an existing server-side rendered (SSR) [Nuxt.js](https://nuxtjs.org/)-based app. I elected to use [Apexcharts](https://apexcharts.com/) because, well, it's pretty cool, supports a lot of use cases, and has a convenient [Vue component](https://github.com/apexcharts/vue-apexcharts).

The problem with Apexcharts in an SSR context is that it requires a browser environment _on import_. This prevents the app from building, which is clearly a no go. I experimented with [jsdom](https://github.com/jsdom/jsdom) to get around this, but encountered some issues with a missing SVG API. I didn't explore this route any further – having the graph rendered on the server isn't that important. It just needs to work in the frontend client!

How can we tackle this? We need to avoid importing Apexcharts until we're in a cosy browser environment. Luckily, Vue has support for [asynchronous components](https://vuejs.org/v2/guide/components-dynamic-async.html), components that are only loaded and imported when they're used. We'll use this to tell Vue to import `'vue-apexcharts'` only when the component `<apexchart />` is rendered.

```javascript
// main.js
Vue.component('apexchart', () => {
  // NB: tell webpack to include the dynamic import within
  // the main bundle instead of splitting into other bundles.
  // https://webpack.js.org/api/module-methods/#import-
  return import(
    /* webpackMode: "eager" */
    'vue-apexcharts'
  )
})
```
```html
<!-- my-graph.vue -->
<template>
  <apexchart .../>
</template>
```

This is great, but our app still tries to render the component on the server. How can we delay the rendering until we're in a browser? Here's an excerpt from [Vue's SSR guide](https://ssr.vuejs.org/guide/universal.html#component-lifecycle-hooks):

> Since there are no dynamic updates, of all the lifecycle hooks, only beforeCreate and created will be called during SSR. This means any code inside other lifecycle hooks such as beforeMount or mounted will only be executed on the client.

We can delay the rendering of the component until it's mounted (and thus "on the client") with a simple `v-if`:

```html
<template>
  <apexchart v-if="mounted" .../>
</template>
<script>
```
```javascript

export default {
  data () {
    return {
      mounted: false
    }
  },
  mounted () {
    this.mounted = true
  }
}
```
```html
</script>
```

Now, Apexcharts will only be imported in a browser environment, where it has all the APIs it needs.
