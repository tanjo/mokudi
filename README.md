# Markdown Indexes

Markdownの目次を自動生成する.

README内の要素を目次にするのではなく複数に分かれたMarkdownとディレクトリを目次にする.

## 目次

- [CHANGELOG](/Users/tanjo/project/tanjo/mokudi/CHANGELOG.md)
- sub
  - sub2
    - sub3
      - README.md
        - [SUB](/Users/tanjo/project/tanjo/mokudi/sub/sub2/sub3/README.md/SUB.md)

## 開発環境

- Mac
- Node.js

## 利用方法

```
npm install -g tanjo/mokudi#1.0.1
```


```
mokudi ./README.md
```
