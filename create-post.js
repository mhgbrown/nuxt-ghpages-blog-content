#!/usr/bin/env node

const fs = require('fs')
const matter = require('gray-matter')

const args = process.argv.slice(2)
const title = args[0]
const content = 'This is a blog post.\n'
const date = +new Date()

const newFileContents = matter.stringify(content, {
  title: args[0],
  date: date
})

fs.writeFileSync(`posts/${date}-${title}.md`, newFileContents)
