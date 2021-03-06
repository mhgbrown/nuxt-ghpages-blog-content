# nuxt-ghpages-blog-content [![Build Status](https://travis-ci.org/mhgbrown/nuxt-ghpages-blog-content.svg?branch=master)](http://travis-ci.org/mhgbrown/nuxt-ghpages-blog-content)

> Content respository for nuxt-ghpages-blog

This respository houses the blog posts for the corresponding [nuxt-ghpages-blog](https://github.com/mhgbrown/nuxt-ghpages-blog). When an update is pushed this respository's master branch, a rebuild of the blog will be triggered.

## Resources

This content originally lived on Tumblr. I used https://github.com/skywrite/sky-tumblr-export to convert my existing blog posts to Markdown.

## Usage

To download and convert blog posts to markdown from a Tumblr, set TUMBLR_API_KEY and TUMBLR_HOST and run

```sh
$ npm run start
```

To create a new post

```sh
$ npm run post 'Some Long Title'
```
