#!/usr/bin/env node

const fs = require("fs-extra");
const os = require("os");
const ejs = require("ejs");

const OUTPUT_FILE_NAME = "audit-report.html";
const TEMPLATE = fs.readFileSync(join([__dirname, "template.ejs"]), "utf-8");

/**
 * Processes the input data and writes it to the specified file or folder.
 * @param {string} folderPath - Path to the folder.
 * @param {string} filePath - Path to the file within the folder (optional).
 * @param {string} inputData - Data read from stdin.
 */
function processInput(folderPath, filePath, inputData) {
  const finalPath = getFinalPath(folderPath, filePath);
  writeIfFolderExists(folderPath, finalPath, inputData);
}

/**
 * Constructs the final path based on the folder and file paths.
 * @param {string} folderPath - Path to the folder.
 * @param {string} filePath - Path to the file within the folder (optional).
 * @returns {string} - The final path to write the output.
 */
function getFinalPath(folderPath, filePath) {
  return filePath ? join([folderPath, filePath]) : join([folderPath, OUTPUT_FILE_NAME]);
}

/**
 * Checks if the provided folder exists and calls the writeOutput function.
 * @param {string} folderPath - Path to the folder.
 * @param {string} finalPath - Final path to write the output.
 * @param {string} data - Data to be written to the file.
 */
function writeIfFolderExists(folderPath, finalPath, data) {
  fs.access(folderPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Error: The provided folder does not exist.");
      process.exit(1);
    }
    writeOutput(finalPath, data);
  });
}

/**
 * Writes the given data to the specified file.
 * @param {string} path - Path to the file.
 * @param {string} data - Data to be written to the file.
 */
function writeOutput(path, data) {
  const output = generateHtmlTemplateContent(data);
  fs.writeFile(path, output, (err) => {
    if (err) {
      console.error("Error: Unable to write to file.", err);
      process.exit(1);
    }
    
    console.log("Audit exported successfully!");
    process.exit(0);
  });
}

/**
 * Generates HTML template content based on the provided data.
 * @param {string} data - JSON string containing vulnerability data.
 * @returns {string} - HTML content generated from the template.
 */
function generateHtmlTemplateContent(data) {
  const vulnerabilities = getVulnerabilities(JSON.parse(data));

  const templateData = {
    vulnsFound: vulnerabilities.length,
    vulnerableDependencies: [...new Set(vulnerabilities.map((vuln) => vuln.package))].length,
    currentDate: getCurrentDate(),
    criticalVulns: countVulnerabilities(vulnerabilities, "critical"),
    highVulns: countVulnerabilities(vulnerabilities, "high"),
    moderateVulns: countVulnerabilities(vulnerabilities, "moderate"),
    lowVulns: countVulnerabilities(vulnerabilities, "low"),
    infoVulns: countVulnerabilities(vulnerabilities, "info"),
    vulnerabilities: vulnerabilities,
  };

  return ejs.render(TEMPLATE, templateData);
}

/**
 * Counts the number of vulnerabilities with the specified severity.
 * @param {Array} vulnerabilities - Array of vulnerability objects.
 * @param {string} severity - Severity level to count.
 * @returns {number} - Number of vulnerabilities with the specified severity.
 */
function countVulnerabilities(vulnerabilities, severity) {
  return vulnerabilities.filter((vuln) => vuln.severity === severity).length;
}

/**
 * Extracts and processes vulnerability data from the provided JSON data.
 * @param {string} data - JSON string containing vulnerability data.
 * @returns {Array} - Array of processed vulnerability objects.
 */
function getVulnerabilities(data) {
  let allVulns = [];

  if (data.vulnerabilities) {
    for (const pkg in data.vulnerabilities) {
      allVulns.push(...data.vulnerabilities[pkg].via);
    }
  } else if (data.advisories) {
    for (const vuln in data.advisories) {
      allVulns.push(data.advisories[vuln]);
    }
  }

  return allVulns.map((vuln) => processVulnerability(vuln)).filter(vuln => vuln);
}

/**
 * Processes a single vulnerability object and returns a standardized format.
 * @param {Object} vuln - Raw vulnerability object.
 * @returns {Object} - Processed vulnerability object.
 */
function processVulnerability(vuln) {
  if (vuln.title) {
    return {
      link: vuln.url,
      name: vuln.title,
      package: vuln.name || vuln.module_name,
      severity: vuln.severity,
      cwes: (vuln.cwe || []).concat(vuln.cves).join(", "),
    };
  }
}

/**
 * Joins array elements into a path string based on the operating system.
 * @param {Array} paths - Array of path elements.
 * @returns {string} - The joined path string.
 */
function join(paths) {
  if (os.platform() === "win32") {
    return paths.join("\\");
  } else {
    return paths.join("/");
  }
}

/**
 * Gets the current date in a formatted string.
 * @returns {string} - Formatted current date string.
 */
function getCurrentDate() {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const d = new Date();

  return `${checkNumLength(str(d.getDate()))} of ${months[d.getMonth()]}, ${d.getFullYear()} - ${checkNumLength(str(d.getHours()))}:${checkNumLength(str(d.getMinutes()))}:${checkNumLength(str(d.getSeconds()))}`;
}

/**
 * Converts a value to a string.
 * @param {any} string - Value to be converted to a string.
 * @returns {string} - The converted string.
 */
function str(string) {
  return string.toString();
}

/**
 * Ensures a two-digit format for numbers by adding a leading zero if necessary.
 * @param {string} number - Number to check and possibly add a leading zero.
 * @returns {string} - Number with a leading zero if necessary.
 */
function checkNumLength(number) {
  if (number.length === 2) return number;
  return `0${number}`;
}

// Command-line arguments
const folderPath = process.argv[2] || process.cwd();
const filePath = process.argv[3];

// Set encoding for stdin
process.stdin.setEncoding("utf8");

// Support chunked input
let inputData = "";

// Read data from stdin
process.stdin.on("data", chunk => {
  inputData += chunk;
});

// Read data from stdin
process.stdin.on("end", () => {
  processInput(folderPath, filePath, inputData);
});
