#!/usr/bin/env node

/**
 * mokudi
 * ver. 1.1.0
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
  let mokudignorePath = null;

  if (fs.statSync(userPath).isDirectory()) {
    const readmePath = userPath + "/README.md";
    if (!fs.existsSync(readmePath)) {
      console.error("Error: Not found README.md.   \n" + readmePath);
      return;
    }
    mokudignorePath = userPath + "/.mokudignore";
    filePath = readmePath;
  } else {
    const baseName = path.basename(userPath);
    const baseDirectory = path.dirname(userPath);
    mokudignorePath = baseDirectory + "/.mokudignore";
    filePath = userPath;
  }

  if (!filePath) {
    console.error("Error: Not found file path.")
    return;
  }

  var ignores = [];
  if (fs.existsSync(mokudignorePath)) {
      var ignoreData = fs.readFileSync(mokudignorePath, 'utf8');
      ignores = ignoreData.split('\n');
  }

  try {
    const readme = fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        throw error;
      }
      const readme = data.replace(new RegExp(content_target + "\\n([\\s\\S]*?)(?=\\n#)|" + content_target + "\\n([\\s\\S]*)"), content_target + "\n\n" + explorer(path.dirname(filePath), ignores));
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

const manageFiles = (files, workingDirectory, ignores, baseDirectory, prefix) => {
  let result = '';
  if (!prefix) {
    prefix = '';
  }
  if (!ignores) {
    ignores = [];
  }
  files.filter((file) => {
    return fs.statSync(workingDirectory + '/' + file).isFile() &&
        !/^\./.test(file) &&
        /(\.*)\.md/.test(file) &&
        !/package-lock.json/.test(file) &&
        !/package\.json/.test(file) &&
        !/README\.md/.test(file) &&
        !ignores.includes(file);
  }).forEach((file) => {
    result += prefix + '- [' + file.replace('.md', '') + '](' + (path.relative(baseDirectory, workingDirectory.replace(/ /ig, '%20').replace(/\(/ig, '%28').replace(/\)/ig, '%29') + '/' + file.replace(/ /ig, '%20').replace(/\(/ig, '%28').replace(/\)/ig, '%29'))).normalize('NFC') + ')' + '\n';
  });
  return result;
};

const manageDirs = (dirs, workingDirectory, ignores, baseDirectory, prefix) => {
  let result = '';
  if (!prefix) {
    prefix = '';
  }
  if (!ignores) {
    ignores = [];
  }
  dirs.filter((dir) => {
    return fs.statSync(workingDirectory + '/' + dir).isDirectory() &&
        !/^\./.test(dir) &&
        !/^_/.test(dir) &&
        !/node_modules/.test(dir) &&
        !/image/.test(dir) &&
        !/pdf/.test(dir) &&
        !ignores.includes(dir);
  }).forEach((dir) => {
    const value = explorer(workingDirectory + '/' + dir, '  ' + prefix);
    if (value && value.length > 0) {
      result += prefix + '- ' + dir + '\n' + explorer(workingDirectory + '/' + dir, ignores, baseDirectory, '  ' + prefix);
    }
  });
  return result;
};

const explorer = (workingDirectory, ignores, baseDirectory, prefix) => {
  if (!baseDirectory || baseDirectory.length === 0) {
    baseDirectory = workingDirectory;
  }
  const files = fs.readdirSync(workingDirectory);
  if (files.length === 0) {
    return "";
  }
  let result = manageFiles(files, workingDirectory, ignores, baseDirectory, prefix);
  result += manageDirs(files, workingDirectory, ignores, baseDirectory, prefix);
  return result;
};

try {
  main(process.argv);
} catch (e) {
  console.error(e);
}
