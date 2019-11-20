#!/usr/bin/env node

/**
 * mokudi
 * ver. 1.0.9
 */

const fs = require('fs');
const path = require('path');

const main = (argv) => {
  const argc = argv.length;

  if (argc < 3) {
    console.error("Error: wrong arguments.");
    return;
  }

  const userPath = path.resolve(argv[2]);

  const content_target = argv[3] || "# 目次";

  console.log(content_target);

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
    const baseDirectory = path.dirname(userPath);
    filePath = userPath;
  }

  if (!filePath) {
    console.error("Error: Not found file path.")
    return;
  }

  try {
    const readme = fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        throw error;
      }
      const readme = data.replace(new RegExp(content_target + "\\n([\\s\\S]*?)(?=\\n#)|" + content_target + "\\n([\\s\\S]*)"), content_target + "\n\n" + explorer(path.dirname(filePath)));
      try {
        fs.writeFile(filePath, readme, (error) => {
          if (error) {
            throw error;
          }
        });
      } catch (e) {
        console.error(e);
      }
    });
  } catch (e) {
    console.error(e);
  }
};

const manageFiles = (files, workingDirectory, baseDirectory, prefix) => {
  let result = '';
  if (!prefix) {
    prefix = '';
  }
  files.filter((file) => {
    return fs.statSync(workingDirectory + '/' + file).isFile() &&
        !/^\./.test(file) &&
        /(\.*)\.md/.test(file) &&
        !/package-lock.json/.test(file) &&
        !/package\.json/.test(file) &&
        !/README\.md/.test(file);
  }).forEach((file) => {
    result += prefix + '- [' + file.replace('.md', '') + '](' + (path.relative(baseDirectory, workingDirectory.replace(/ /ig, '%20').replace(/\(/ig, '%28').replace(/\)/ig, '%29') + '/' + file.replace(/ /ig, '%20').replace(/\(/ig, '%28').replace(/\)/ig, '%29'))).normalize('NFC') + ')' + '\n';
  });
  return result;
};

const manageDirs = (dirs, workingDirectory, baseDirectory, prefix) => {
  let result = '';
  if (!prefix) {
    prefix = '';
  }
  dirs.filter((dir) => {
    return fs.statSync(workingDirectory + '/' + dir).isDirectory() &&
        !/^\./.test(dir) &&
        !/^_/.test(dir) &&
        !/node_modules/.test(dir) &&
        !/image/.test(dir) &&
        !/pdf/.test(dir);
  }).forEach((dir) => {
    const value = explorer(workingDirectory + '/' + dir, '  ' + prefix);
    if (value && value.length > 0) {
      result += prefix + '- ' + dir + '\n' + explorer(workingDirectory + '/' + dir, baseDirectory, '  ' + prefix);
    }
  });
  return result;
};

const explorer = (workingDirectory, baseDirectory, prefix) => {
  if (!baseDirectory || baseDirectory.length === 0) {
    baseDirectory = workingDirectory;
  }
  const files = fs.readdirSync(workingDirectory);
  if (files.length === 0) {
    return "";
  }
  let result = manageFiles(files, workingDirectory, baseDirectory, prefix);
  result += manageDirs(files, workingDirectory, baseDirectory, prefix);
  return result;
};

try {
  main(process.argv);
} catch (e) {
  console.error(e);
}
