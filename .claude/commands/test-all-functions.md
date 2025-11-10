# Test All Functions with Boss Agent

**Objective:** Use the Boss Agent system to coordinate Logic Analyzer and Test Generator agents to systematically test all functions in the codebase.

## Your Mission

You are activating the **Boss Agent Test Coordinator** system which orchestrates two specialized agents:

1. **Logic Analyzer Agent 🧠** - Analyzes all source code to:
   - Discover all functions in the codebase
   - Understand function logic and dependencies
   - Identify which functions need tests
   - Generate test case specifications
   - Prioritize testing by criticality

2. **Test Generator Agent 🧪** - Creates comprehensive tests to:
   - Write Jest test suites for all functions
   - Create necessary mocks and fixtures
   - Run tests and measure coverage
   - Fix failing tests
   - Achieve coverage targets (70%+)

## Execution Plan

### Phase 1: Analysis (Logic Analyzer Agent)
1. Scan the entire codebase for source files
2. Extract all function definitions
3. Analyze each function's:
   - Purpose and behavior
   - Input parameters
   - Expected outputs
   - Dependencies (models, services, utilities)
   - Error conditions
   - Complexity level
4. Identify existing test coverage
5. Create test specifications for untested functions
6. Prioritize by criticality:
   - **Critical**: Auth, security, payments
   - **High**: Controllers, core business logic
   - **Medium**: Models, middlewares
   - **Low**: Utilities, helpers

### Phase 2: Test Generation (Test Generator Agent)
1. Receive test specifications from Logic Analyzer
2. Generate test files following Jest patterns
3. Create test suites with:
   - Success cases (happy path)
   - Error cases (error handling)
   - Edge cases (boundary conditions)
   - Validation cases (input validation)
   - Authorization cases (permissions)
4. Set up mocks for:
   - Database models
   - External services
   - Email/notification systems
   - Authentication
5. Run all tests
6. Measure code coverage
7. Fix any failing tests
8. Iterate until coverage targets met

### Phase 3: Reporting
1. Generate comprehensive test report
2. Show coverage metrics
3. List any remaining gaps
4. Provide recommendations

## Target Directories

Test in priority order:
1. `server/controllers/` - API endpoint handlers (Critical)
2. `server/models/` - Database models (High)
3. `server/services/` - Business logic (High)
4. `server/middlewares/` - Security & validation (High)
5. `server/utils/` - Utility functions (Medium)
6. `client/src/components/` - React components (Medium)
7. `client/src/context/` - Context providers (Medium)

## Coverage Targets

- **Overall Target:** 70%+ (all metrics)
- **Critical Functions:** 95%+ coverage
- **Controllers:** 85%+ coverage
- **Models:** 90%+ coverage
- **Services:** 90%+ coverage
- **Middlewares:** 85%+ coverage
- **Utilities:** 85%+ coverage

## Approach

### Option 1: Use Orchestration Script (Automated)
Run the Boss Agent coordinator script:
```bash
node scripts/boss-test-coordinator.js server
```

This script will:
- Automatically run both agents in sequence
- Generate analysis and test files
- Run tests and collect coverage
- Create detailed reports

### Option 2: Use Task Agents (Manual Coordination)
Launch both agents in parallel using the Task tool:

1. **Launch Logic Analyzer Agent:**
```
Task tool with subagent_type=Explore
Prompt: "Act as the Logic Analyzer Agent. Analyze the server/ directory to find all functions and generate test specifications. Follow the Logic Analyzer Agent instructions in .claude/agents/logic-analyzer.md. Save analysis to .claude/progress/logic-analysis.json"
```

2. **Launch Test Generator Agent:**
```
Task tool with subagent_type=general-purpose
Prompt: "Act as the Test Generator Agent. Read the test specifications from .claude/progress/logic-analysis.json and generate comprehensive Jest tests for all untested functions. Follow the Test Generator Agent instructions in .claude/agents/test-generator.md. Run tests and measure coverage."
```

## Your Actions

1. **Choose Approach:**
   - Ask the user if they want automated (script) or manual (Task agents)
   - Default to automated if not specified

2. **If Automated:**
   - Run `node scripts/boss-test-coordinator.js server`
   - Monitor output
   - Report results

3. **If Manual:**
   - Launch Logic Analyzer Agent using Task tool
   - Wait for analysis completion
   - Review analysis results
   - Launch Test Generator Agent using Task tool
   - Monitor test generation and execution
   - Report final results

4. **Report Results:**
   - Show coverage metrics
   - List tests created
   - Highlight any issues
   - Provide next steps

## Success Criteria

✅ All source files analyzed
✅ All functions catalogued
✅ Test files created for untested functions
✅ All tests passing
✅ Coverage targets met (70%+)
✅ Detailed report generated
✅ No critical functions untested

## Output

Provide a summary report:
```markdown
# Boss Agent Test Coordination Results

## Analysis Summary
- Files Analyzed: X
- Functions Found: Y
- Functions Tested: Z
- Coverage: W%

## Tests Generated
- New Test Files: A
- New Test Cases: B
- Tests Passing: C/D
- Pass Rate: E%

## Coverage Metrics
- Statements: X%
- Branches: Y%
- Functions: Z%
- Lines: W%

## Agents Performance
- Logic Analyzer: [Success/Issues]
- Test Generator: [Success/Issues]

## Recommendations
- [Any remaining work]
- [Areas needing attention]
```

## Important Notes

- **Time Estimate:** 2-4 hours depending on codebase size
- **Incremental:** Can run on specific directories first
- **Iterative:** May need multiple passes for 100% coverage
- **Safe:** Tests are generated, not production code
- **Reversible:** Can delete generated tests if needed

## Ready to Start!

Ask the user:
1. Which approach? (Automated script or Manual Task agents)
2. Which directory to start with? (Default: server)
3. Any specific priorities or exclusions?

Then activate the Boss Agent system and coordinate the testing mission! 🚀
