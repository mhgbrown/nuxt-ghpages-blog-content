#!/usr/bin/env node

/**
 * Extremely quick and dirty script to convert tumblr posts downloaded
 * with sky-tumblr-import to the post format expected by nuxt-ghpages-blog.
 */

const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync
const matter = require('gray-matter')

// Walk a directory, calling callback for each file
const walkDir = function (dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f)
    let isDirectory = fs.statSync(dirPath).isDirectory()
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f))
  })
}

// Replace HTML comment front matter with YAML front matter
const makeMatterable = function (fileContents) {
  return fileContents.replace('<!--', '---').replace('-->', '---')
}

// Get and convert posts from tumblr to markdown
const inputDir = 'tumblr-posts'
execSync(`node_modules/.bin/sky-tumblr-export -u blog.mhgbrown.is -d ${inputDir} --titles --download-images --api-key ok1dCktUCXTyOgG0vlyhxcW7oQ4lxUZl0QfZkoEiwwjvU2ZKAv`, { stdio: 'inherit' })

// Delete unused sky directory
console.info(`Removing ${inputDir}/sky`)
execSync(`rm -r ${inputDir}/sky`, { stdio: 'inherit' })

walkDir(inputDir, function (filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const fileMatter = matter(makeMatterable(fileContents))
  const publishDate = new Date(Date.parse(fileMatter.data.publish))
  const day = ('00' + publishDate.getDate()).substr(-2, 2)
  const month = ('00' + (publishDate.getMonth() + 1)).substr(-2, 2)
  // create path to save file
  const postPath = filePath
    .replace(/\//g, '-')
    .replace(`${inputDir}-posts-`, 'posts/')
    .replace(/(-\d{2}-)/, `$1${day}-`)
  // create new contents compatible with nuxt-ghpages-blog
  const newFileContents = matter.stringify(fileMatter.content, {
    title: fileMatter.data.title,
    date: `${publishDate.getFullYear()}-${month}-${day}`
  })

  fs.writeFileSync(postPath, newFileContents)
})