#!/usr/bin/env node

/**
 * mokudi
 * ver. 1.0.2
 */

const fs = require('fs');
const path = require('path');

const main = (argv) => {
  const argc = argv.length;
  if (argv.length !== 3) {
    console.error("Error: wrong arguments.");
    return;
  }

  const userPath = path.resolve(argv[2]);

  if (!fs.existsSync(userPath)) {
    console.error("Error: wrong path.   \n" + userPath);
    return;
  }

  let filePath = null;

  if (fs.statSync(userPath).isDirectory()) {
    const readmePath = userPath + "/README.md";
    if (!fs.existsSync(readmePath)) {
      console.error("Error: Not found README.md.   \n" + readmePath);
      return;
    }
    filePath = readmePath;
  } else {
    const baseName = path.basename(userPath);
    const baseDir = path.dirname(userPath);
    filePath = userPath;
  }

  if (!filePath) {
    console.error("Error: Not found file path.")
    return;
  }

  const readme = fs.readFile(filePath, 'utf8', (error, data) => {
    if (error) {
      throw error;
    }
    const readme = data.replace(/# 目次\n([\s\S]*?)(?=#)|# 目次\n([\s\S]*)/, "# 目次\n\n" + explorer(path.dirname(filePath)) + "\n");
    fs.writeFile(filePath, readme, function(error) {
      if (error) {
        throw error;
      }
    });
  });
};

const manageFiles = (files, wd, basedir, prefix) => {
  let result = '';
  if (!prefix) {
    prefix = '';
  }
  files.filter((file) => {
    return fs.statSync(wd + '/' + file).isFile() &&
        !/^\./.test(file) &&
        /(\.*)\.md/.test(file) &&
        !/package-lock.json/.test(file) &&
        !/package\.json/.test(file) &&
        !/README\.md/.test(file);
  }).forEach((file) => {
    result += prefix + '- [' + file.replace('.md', '') + '](' + path.relative(basedir, wd + '/' + file) + ')' + '\n';
  });
  return result;
};

const manageDirs = (dirs, wd, basedir, prefix) => {
  let result = '';
  if (!prefix) {
    prefix = '';
  }
  dirs.filter((dir) => {
    return fs.statSync(wd + '/' + dir).isDirectory() &&
        !/^\./.test(dir) &&
        !/^_/.test(dir) &&
        !/node_modules/.test(dir) &&
        !/image/.test(dir) &&
        !/pdf/.test(dir);
  }).forEach((dir) => {
    const value = explorer(wd + '/' + dir, '  ' + prefix);
    if (value && value.length > 0) {
      result += prefix + '- ' + dir + '\n' + explorer(wd + '/' + dir, basedir, '  ' + prefix);
    }
  });
  return result;
};

const explorer = (wd, basedir, prefix) => {
  if (!basedir || basedir.length === 0) {
    basedir = wd;
  }
  const files = fs.readdirSync(wd);
  if (files.length === 0) {
    return "";
  }
  let result = manageFiles(files, wd, basedir, prefix);
  result += manageDirs(files, wd, basedir, prefix);
  return result;
};

main(process.argv);
