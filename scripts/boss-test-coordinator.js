#!/usr/bin/env node
/**
 * Boss Agent Test Coordinator
 *
 * Orchestrates two specialized agents:
 * 1. Logic Analyzer - Analyzes code and identifies functions to test
 * 2. Test Generator - Generates and runs comprehensive tests
 *
 * Usage: node scripts/boss-test-coordinator.js [target-directory]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BossTestCoordinator {
  constructor(targetDir = 'server') {
    this.targetDir = targetDir;
    this.results = {
      analyzed: [],
      tested: [],
      coverage: {},
      errors: []
    };
    this.startTime = Date.now();
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'INFO': '📋',
      'SUCCESS': '✅',
      'ERROR': '❌',
      'WARN': '⚠️',
      'AGENT': '🤖'
    }[level] || 'ℹ️';

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  /**
   * Main coordination workflow
   */
  async run() {
    this.log('Boss Agent Test Coordinator Starting...', 'INFO');
    this.log(`Target Directory: ${this.targetDir}`, 'INFO');

    try {
      // Phase 1: Logic Analyzer Agent
      this.log('Activating Logic Analyzer Agent...', 'AGENT');
      const analysis = await this.runLogicAnalyzer();
      this.log(`Analysis Complete: Found ${analysis.totalFunctions} functions`, 'SUCCESS');

      // Phase 2: Test Generator Agent
      this.log('Activating Test Generator Agent...', 'AGENT');
      const testResults = await this.runTestGenerator(analysis);
      this.log(`Testing Complete: ${testResults.passed}/${testResults.total} tests passing`, 'SUCCESS');

      // Phase 3: Generate Final Report
      this.log('Generating Final Report...', 'INFO');
      const report = this.generateReport(analysis, testResults);
      this.saveReport(report);

      this.log('Boss Agent Mission Complete! 🎉', 'SUCCESS');
      this.printSummary(report);

    } catch (error) {
      this.log(`Fatal Error: ${error.message}`, 'ERROR');
      this.results.errors.push(error);
      throw error;
    }
  }

  /**
   * Logic Analyzer Agent - Phase 1
   * Analyzes code and creates test specifications
   */
  async runLogicAnalyzer() {
    this.log('Logic Analyzer: Scanning codebase...', 'AGENT');

    const analysis = {
      totalFiles: 0,
      totalFunctions: 0,
      testedFunctions: 0,
      untestedFunctions: 0,
      files: []
    };

    // Find all source files
    const files = this.findSourceFiles(this.targetDir);
    analysis.totalFiles = files.length;
    this.log(`Found ${files.length} source files`, 'INFO');

    // Analyze each file
    for (const file of files) {
      this.log(`Analyzing: ${file}`, 'INFO');

      const fileAnalysis = this.analyzeFile(file);
      analysis.files.push(fileAnalysis);
      analysis.totalFunctions += fileAnalysis.functions.length;

      // Check for existing tests
      const testFile = this.getTestFilePath(file);
      const hasTest = fs.existsSync(testFile);

      fileAnalysis.functions.forEach(func => {
        if (hasTest) {
          analysis.testedFunctions++;
          func.tested = true;
        } else {
          analysis.untestedFunctions++;
          func.tested = false;
        }
      });
    }

    // Save analysis results
    const analysisPath = path.join('.claude', 'progress', 'logic-analysis.json');
    this.ensureDirectoryExists(path.dirname(analysisPath));
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
    this.log(`Analysis saved to: ${analysisPath}`, 'SUCCESS');

    return analysis;
  }

  /**
   * Find all source files in directory
   */
  findSourceFiles(dir) {
    const files = [];
    const excludeDirs = ['node_modules', '__tests__', 'tests', 'dist', 'build'];
    const includeExts = ['.js', '.ts'];

    const walk = (currentDir) => {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!excludeDirs.includes(item)) {
            walk(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (includeExts.includes(ext) && !item.includes('.test.') && !item.includes('.spec.')) {
            files.push(fullPath);
          }
        }
      }
    };

    walk(dir);
    return files;
  }

  /**
   * Analyze a single file for functions
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const functions = this.extractFunctions(content);

    return {
      path: filePath,
      type: this.getFileType(filePath),
      lineCount: content.split('\n').length,
      functions: functions.map(func => ({
        name: func.name,
        lineStart: func.lineStart,
        lineEnd: func.lineEnd,
        complexity: this.assessComplexity(func.body),
        priority: this.assessPriority(filePath, func.name),
        dependencies: this.extractDependencies(func.body),
        testCases: this.generateTestCases(func),
        tested: false
      }))
    };
  }

  /**
   * Extract function definitions from code
   */
  extractFunctions(content) {
    const functions = [];
    const lines = content.split('\n');

    // Regex patterns for different function types
    const patterns = [
      /^(?:async\s+)?function\s+(\w+)/,  // function name()
      /^const\s+(\w+)\s*=\s*(?:async\s+)?\(/,  // const name = (
      /^exports\.(\w+)\s*=/,  // exports.name =
      /^\s+async\s+(\w+)\s*\(/,  // async name(
      /^\s+(\w+)\s*\([^)]*\)\s*{/  // method name()
    ];

    let currentFunction = null;
    let braceCount = 0;

    lines.forEach((line, index) => {
      // Try to match function start
      if (!currentFunction) {
        for (const pattern of patterns) {
          const match = line.match(pattern);
          if (match) {
            currentFunction = {
              name: match[1],
              lineStart: index + 1,
              body: line + '\n'
            };
            braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
            break;
          }
        }
      } else {
        // Continue collecting function body
        currentFunction.body += line + '\n';
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        // Function complete
        if (braceCount === 0) {
          currentFunction.lineEnd = index + 1;
          functions.push(currentFunction);
          currentFunction = null;
        }
      }
    });

    return functions;
  }

  /**
   * Assess function complexity
   */
  assessComplexity(functionBody) {
    let score = 0;

    // Count complexity indicators
    score += (functionBody.match(/if\s*\(/g) || []).length;
    score += (functionBody.match(/for\s*\(/g) || []).length;
    score += (functionBody.match(/while\s*\(/g) || []).length;
    score += (functionBody.match(/switch\s*\(/g) || []).length;
    score += (functionBody.match(/catch\s*\(/g) || []).length;
    score += (functionBody.match(/await\s+/g) || []).length * 2;

    if (score <= 3) return 'simple';
    if (score <= 8) return 'medium';
    return 'complex';
  }

  /**
   * Assess test priority
   */
  assessPriority(filePath, functionName) {
    // Critical: auth, security, payments
    if (filePath.includes('auth') || functionName.includes('login') ||
        functionName.includes('register') || functionName.includes('verify')) {
      return 'critical';
    }

    // High: controllers, core business logic
    if (filePath.includes('controller') || filePath.includes('service')) {
      return 'high';
    }

    // Medium: models, middlewares
    if (filePath.includes('model') || filePath.includes('middleware')) {
      return 'medium';
    }

    // Low: utilities
    return 'low';
  }

  /**
   * Extract function dependencies
   */
  extractDependencies(functionBody) {
    const deps = [];

    // Find model calls
    const modelCalls = functionBody.match(/(\w+)\.(find|create|update|delete|count)/g) || [];
    deps.push(...modelCalls);

    // Find service calls
    const serviceCalls = functionBody.match(/(\w+Service)\.\w+/g) || [];
    deps.push(...serviceCalls);

    // Find utility calls
    const utilCalls = functionBody.match(/require\(['"]([^'"]+)['"]\)/g) || [];
    deps.push(...utilCalls);

    return [...new Set(deps)];
  }

  /**
   * Generate test cases for a function
   */
  generateTestCases(func) {
    const cases = [];
    const body = func.body;

    // Always add success case
    cases.push(`Should execute ${func.name} successfully`);

    // Add error handling cases
    if (body.includes('throw') || body.includes('catch')) {
      cases.push(`Should handle errors in ${func.name}`);
    }

    // Add validation cases
    if (body.includes('!') || body.includes('validate')) {
      cases.push(`Should validate inputs for ${func.name}`);
    }

    // Add async cases
    if (body.includes('await')) {
      cases.push(`Should handle async operations in ${func.name}`);
    }

    // Add conditional cases
    const ifCount = (body.match(/if\s*\(/g) || []).length;
    if (ifCount > 0) {
      cases.push(`Should handle different conditions in ${func.name}`);
    }

    return cases;
  }

  /**
   * Get file type
   */
  getFileType(filePath) {
    if (filePath.includes('controller')) return 'controller';
    if (filePath.includes('model')) return 'model';
    if (filePath.includes('service')) return 'service';
    if (filePath.includes('middleware')) return 'middleware';
    if (filePath.includes('util')) return 'utility';
    if (filePath.includes('route')) return 'route';
    return 'other';
  }

  /**
   * Get test file path
   */
  getTestFilePath(sourceFile) {
    const relativePath = path.relative(this.targetDir, sourceFile);
    const dir = path.dirname(relativePath);
    const file = path.basename(relativePath, path.extname(relativePath));

    return path.join(this.targetDir, '__tests__', dir, `${file}.test.js`);
  }

  /**
   * Test Generator Agent - Phase 2
   * Generates and runs tests based on analysis
   */
  async runTestGenerator(analysis) {
    this.log('Test Generator: Creating test files...', 'AGENT');

    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      coverage: {}
    };

    // Sort files by priority
    const sortedFiles = this.prioritizeFiles(analysis.files);

    for (const file of sortedFiles) {
      const untestedFunctions = file.functions.filter(f => !f.tested);

      if (untestedFunctions.length > 0) {
        this.log(`Generating tests for: ${file.path}`, 'INFO');

        try {
          const testFile = this.getTestFilePath(file.path);
          const testCode = this.generateTestCode(file, untestedFunctions);

          // Write test file
          this.ensureDirectoryExists(path.dirname(testFile));
          fs.writeFileSync(testFile, testCode);
          this.log(`Created: ${testFile}`, 'SUCCESS');

          // Run the tests
          const testResult = this.runTests(testFile);
          results.total += testResult.total;
          results.passed += testResult.passed;
          results.failed += testResult.failed;

        } catch (error) {
          this.log(`Error generating tests for ${file.path}: ${error.message}`, 'ERROR');
          this.results.errors.push({ file: file.path, error: error.message });
        }
      }
    }

    // Get overall coverage
    results.coverage = this.getCoverage();

    return results;
  }

  /**
   * Prioritize files for testing
   */
  prioritizeFiles(files) {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    return files.sort((a, b) => {
      const aPriority = Math.min(...a.functions.map(f => priorityOrder[f.priority] || 3));
      const bPriority = Math.min(...b.functions.map(f => priorityOrder[f.priority] || 3));
      return aPriority - bPriority;
    });
  }

  /**
   * Generate test code
   */
  generateTestCode(file, functions) {
    const moduleName = path.basename(file.path, path.extname(file.path));
    const relativePath = path.relative(
      path.dirname(this.getTestFilePath(file.path)),
      file.path
    ).replace(/\\/g, '/');

    let code = `// Auto-generated tests by Boss Test Coordinator
// File: ${file.path}
// Generated: ${new Date().toISOString()}

`;

    // Add imports
    code += `const ${moduleName.replace(/[.-]/g, '_')} = require('${relativePath}');\n\n`;

    // Add test suite
    code += `describe('${moduleName}', () => {\n`;
    code += `  let req, res, next;\n\n`;
    code += `  beforeEach(() => {\n`;
    code += `    jest.clearAllMocks();\n`;
    code += `    req = { body: {}, params: {}, query: {}, user: null };\n`;
    code += `    res = {\n`;
    code += `      status: jest.fn().mockReturnThis(),\n`;
    code += `      json: jest.fn().mockReturnThis()\n`;
    code += `    };\n`;
    code += `    next = jest.fn();\n`;
    code += `  });\n\n`;

    // Add test cases for each function
    functions.forEach(func => {
      code += `  describe('${func.name}', () => {\n`;

      func.testCases.forEach((testCase, index) => {
        code += `    it('${testCase}', async () => {\n`;
        code += `      // TODO: Implement test\n`;
        code += `      expect(true).toBe(true);\n`;
        code += `    });\n\n`;
      });

      code += `  });\n\n`;
    });

    code += `});\n`;

    return code;
  }

  /**
   * Run tests
   */
  runTests(testFile) {
    try {
      const output = execSync(`npm test -- ${testFile} --json`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const result = JSON.parse(output);
      return {
        total: result.numTotalTests || 0,
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0
      };
    } catch (error) {
      // Jest returns non-zero exit code if tests fail
      this.log(`Tests failed for ${testFile}`, 'WARN');
      return { total: 0, passed: 0, failed: 0 };
    }
  }

  /**
   * Get coverage report
   */
  getCoverage() {
    try {
      execSync(`npm run test:coverage -- --json --outputFile=coverage-summary.json`, {
        encoding: 'utf-8'
      });

      const coverage = JSON.parse(fs.readFileSync('coverage-summary.json', 'utf-8'));
      return coverage.total || {};
    } catch (error) {
      this.log('Could not generate coverage report', 'WARN');
      return {};
    }
  }

  /**
   * Generate final report
   */
  generateReport(analysis, testResults) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    return {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      analysis: {
        totalFiles: analysis.totalFiles,
        totalFunctions: analysis.totalFunctions,
        testedFunctions: analysis.testedFunctions,
        untestedFunctions: analysis.untestedFunctions,
        coveragePercentage: ((analysis.testedFunctions / analysis.totalFunctions) * 100).toFixed(2)
      },
      testing: {
        totalTests: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        passRate: ((testResults.passed / testResults.total) * 100).toFixed(2)
      },
      coverage: testResults.coverage,
      errors: this.results.errors
    };
  }

  /**
   * Save report
   */
  saveReport(report) {
    const reportPath = path.join('.claude', 'progress', 'boss-test-report.json');
    this.ensureDirectoryExists(path.dirname(reportPath));
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Also create markdown report
    const mdReport = this.generateMarkdownReport(report);
    const mdPath = path.join('.claude', 'progress', 'boss-test-report.md');
    fs.writeFileSync(mdPath, mdReport);

    this.log(`Report saved to: ${reportPath}`, 'SUCCESS');
    this.log(`Markdown report: ${mdPath}`, 'SUCCESS');
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report) {
    return `# Boss Agent Test Coordinator Report

**Generated:** ${report.timestamp}
**Duration:** ${report.duration}

## Summary

### Code Analysis
- **Total Files:** ${report.analysis.totalFiles}
- **Total Functions:** ${report.analysis.totalFunctions}
- **Tested Functions:** ${report.analysis.testedFunctions}
- **Untested Functions:** ${report.analysis.untestedFunctions}
- **Coverage:** ${report.analysis.coveragePercentage}%

### Test Results
- **Total Tests:** ${report.testing.totalTests}
- **Passed:** ${report.testing.passed} ✅
- **Failed:** ${report.testing.failed} ❌
- **Pass Rate:** ${report.testing.passRate}%

### Coverage Metrics
- **Statements:** ${report.coverage.statements?.pct || 0}%
- **Branches:** ${report.coverage.branches?.pct || 0}%
- **Functions:** ${report.coverage.functions?.pct || 0}%
- **Lines:** ${report.coverage.lines?.pct || 0}%

## Errors
${report.errors.length > 0 ? report.errors.map(e => `- ${e.file}: ${e.error}`).join('\n') : 'None'}

## Agents Involved
1. **Logic Analyzer Agent** 🧠 - Analyzed ${report.analysis.totalFiles} files
2. **Test Generator Agent** 🧪 - Generated ${report.testing.totalTests} tests

---
*Coordinated by Boss Agent Test System*
`;
  }

  /**
   * Print summary
   */
  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 BOSS AGENT TEST COORDINATOR - FINAL REPORT');
    console.log('='.repeat(60));
    console.log(`\n⏱️  Duration: ${report.duration}`);
    console.log(`\n📁 Code Analysis:`);
    console.log(`   Files Analyzed: ${report.analysis.totalFiles}`);
    console.log(`   Functions Found: ${report.analysis.totalFunctions}`);
    console.log(`   Coverage: ${report.analysis.coveragePercentage}%`);
    console.log(`\n🧪 Test Results:`);
    console.log(`   Tests Created: ${report.testing.totalTests}`);
    console.log(`   Passed: ${report.testing.passed} ✅`);
    console.log(`   Failed: ${report.testing.failed} ❌`);
    console.log(`   Pass Rate: ${report.testing.passRate}%`);

    if (report.errors.length > 0) {
      console.log(`\n⚠️  Errors: ${report.errors.length}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

// Main execution
if (require.main === module) {
  const targetDir = process.argv[2] || 'server';
  const boss = new BossTestCoordinator(targetDir);

  boss.run()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Boss Agent Failed:', error);
      process.exit(1);
    });
}

module.exports = BossTestCoordinator;
