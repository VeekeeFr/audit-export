# Npm Audit Export 🕵️‍♂️

![npm version](https://img.shields.io/npm/v/audit-export?style=flat-square)
![npm downloads](https://img.shields.io/npm/dt/audit-export?style=flat-square)

A convenient tool to **export npm audit results** to a comprehensive **offline HTML page**, providing a clear overview of your project's vulnerabilities.

<div align="center" width="100%">
    <img src="https://raw.githubusercontent.com/hotaydev/audit-export/main/.github/images/screenshot.jpg" alt="Screenshot of the output of audit-export" width="80%" /><br/>
    <sub align="center">Example of the output file from audit-export</sub>
</div><br/><br/>

> Inspired by [npm-audit-html](https://www.npmjs.com/package/npm-audit-html), but with more Node.js versions supported, offline support and lightweight ⚡

## Compatibility

**This package is compatible with Node.js versions 10 through 20, as well as future versions.**

## Installation

Install globally using npm:

```bash
npm install -g audit-export
```

## Usage

You can use the tool in two different main ways:

```
npm audit --json | audit-export --folder <_folder_path> --name <file_name.html> --title <HTML_file_title>
```

or:

```
npm audit --json | audit-export <path> <file_name>
```

<sub><strong>All parameters are optional.</strong><br/>By default it will use <i>the current folder</i>, <i>"audit-report.html"</i> as file name, and <i>"NPM Audit Report"</i> as title.</sub>


## Contributing

We welcome contributions from the community! Feel free to open issues and submit pull requests on our [GitHub Issues page](https://github.com/hotaydev/audit-export/issues). Your feedback and suggestions are highly appreciated.

## Download

You can download the package from [npm](https://www.npmjs.com/package/audit-export).

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/hotaydev/audit-export/blob/main/LICENSE) file for details.

Happy auditing! 🛡️🚀
