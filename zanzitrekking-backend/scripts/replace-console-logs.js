const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files and directories to process
const directories = [
  path.join(__dirname, '..', 'controllers'),
  path.join(__dirname, '..', 'utilities'),
  path.join(__dirname, '..', 'workers'),
  path.join(__dirname, '..', 'migrations'),
];

// Read all JS files recursively
function getAllJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Replace console.log statements
function replaceConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if logger is already imported
  const hasLoggerImport = content.includes("require('./utilities/logger')") || 
                         content.includes("require('../utilities/logger')") ||
                         content.includes("require('../../utilities/logger')") ||
                         content.includes("require('../../../utilities/logger')");
  
  // Add logger import if not present and file has console statements
  if (!hasLoggerImport && (content.includes('console.log') || content.includes('console.error') || 
      content.includes('console.warn') || content.includes('console.info') || content.includes('console.debug'))) {
    // Determine relative path to logger
    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, '..', 'utilities', 'logger'));
    const loggerPath = relativePath.replace(/\\/g, '/').replace(/^/, './');
    
    // Add logger import after other requires
    const requireMatch = content.match(/(const\s+\w+\s*=\s*require\([^)]+\);?\s*\n)/);
    if (requireMatch) {
      const lastRequireIndex = content.lastIndexOf(requireMatch[0]) + requireMatch[0].length;
      content = content.slice(0, lastRequireIndex) + 
                `const logger = require('${loggerPath}');\n` + 
                content.slice(lastRequireIndex);
      modified = true;
    }
  }
  
  // Replace console.log with logger.info
  if (content.includes('console.log')) {
    content = content.replace(/console\.log\(/g, 'logger.info(');
    modified = true;
  }
  
  // Replace console.error with logger.error
  if (content.includes('console.error')) {
    content = content.replace(/console\.error\(/g, 'logger.error(');
    modified = true;
  }
  
  // Replace console.warn with logger.warn
  if (content.includes('console.warn')) {
    content = content.replace(/console\.warn\(/g, 'logger.warn(');
    modified = true;
  }
  
  // Replace console.info with logger.info
  if (content.includes('console.info')) {
    content = content.replace(/console\.info\(/g, 'logger.info(');
    modified = true;
  }
  
  // Replace console.debug with logger.debug
  if (content.includes('console.debug')) {
    content = content.replace(/console\.debug\(/g, 'logger.debug(');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Process all files
let totalUpdated = 0;
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = getAllJsFiles(dir);
    files.forEach(file => {
      if (replaceConsoleLogs(file)) {
        totalUpdated++;
      }
    });
  }
});

console.log(`\nTotal files updated: ${totalUpdated}`);
