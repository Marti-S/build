#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);

const defaultPhase = '98';
const defaultReport = '.planning/parity/parity-report.md';

const normalizedLinePatterns = [
  /^completed:/,
  /^duration:/,
  /^Started:/,
  /^Completed:/,
  /^Last updated:/
];

function printHelp() {
  const usage = [
    'Usage: node scripts/parity-test.js [options]',
    '',
    'Options:',
    '  --baseline <claude|opencode>   Baseline runtime (default: claude)',
    '  --phase <phase>                Phase number to run (default: 98, with 98.1/98.2 fallback)',
    '  --report <path>                Report output path (default: .planning/parity/parity-report.md)',
    '  --keep-workspaces              Skip cleanup of parity workspaces',
    '  --help                          Show this help message',
    '',
    'Required env vars:',
    '  GSD_PARITY_CODEX_CMD            Command template for Codex CLI runs',
    '  GSD_PARITY_BASELINE_CMD         Command template for baseline CLI runs',
    '',
    'Exit codes:',
    '  0  Parity passed',
    '  1  Parity failed (diffs or missing files)',
    '  2  Setup or command execution error'
  ];
  console.log(usage.join('\n'));
}

function parseArgs(argv) {
  const options = {
    baseline: 'claude',
    phase: defaultPhase,
    report: defaultReport,
    keepWorkspaces: false,
    help: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }
    if (arg === '--keep-workspaces') {
      options.keepWorkspaces = true;
      continue;
    }
    if (arg === '--baseline') {
      const value = argv[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('Missing value for --baseline');
      }
      options.baseline = value;
      i += 1;
      continue;
    }
    if (arg === '--phase') {
      const value = argv[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('Missing value for --phase');
      }
      options.phase = value;
      i += 1;
      continue;
    }
    if (arg === '--report') {
      const value = argv[i + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('Missing value for --report');
      }
      options.report = value;
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    return null;
  }
  return value;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function runCommand(command, options) {
  const result = spawnSync(command, {
    shell: true,
    cwd: options.cwd,
    env: options.env,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });

  return {
    status: result.status,
    error: result.error,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function runNodeCommand(args, options) {
  const result = spawnSync('node', args, {
    cwd: options.cwd,
    env: options.env,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });

  return {
    status: result.status,
    error: result.error,
    stdout: result.stdout || '',
    stderr: result.stderr || ''
  };
}

function writeLog(logPath, command, result) {
  const lines = [
    `Command: ${command}`,
    `Status: ${result.status === null ? 'null' : result.status}`,
    ''
  ];
  if (result.stdout) {
    lines.push('STDOUT:');
    lines.push(result.stdout.trimEnd());
    lines.push('');
  }
  if (result.stderr) {
    lines.push('STDERR:');
    lines.push(result.stderr.trimEnd());
    lines.push('');
  }
  fs.writeFileSync(logPath, `${lines.join('\n')}${os.EOL}`);
}

function getTrackedFiles(rootDir) {
  const result = spawnSync('git', ['ls-files'], { cwd: rootDir, encoding: 'utf8' });
  if (result.status !== 0) {
    const err = result.stderr || result.error || 'git ls-files failed';
    throw new Error(err.toString());
  }
  return result.stdout.split('\n').map(line => line.trim()).filter(Boolean);
}

function copyTrackedFiles(files, srcRoot, destRoot) {
  for (const file of files) {
    const srcPath = path.join(srcRoot, file);
    const destPath = path.join(destRoot, file);
    const destDir = path.dirname(destPath);
    ensureDir(destDir);
    fs.copyFileSync(srcPath, destPath);
  }
}

function findPhaseDirs(workspace, phase) {
  const phasesDir = path.join(workspace, '.planning', 'phases');
  if (!fs.existsSync(phasesDir)) {
    return [];
  }
  return fs.readdirSync(phasesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith(`${phase}-`))
    .map(entry => path.join(phasesDir, entry.name));
}

function resolvePhase(codexWorkspace, baselineWorkspace, initialPhase) {
  const candidates = initialPhase === defaultPhase
    ? [initialPhase, '98.1', '98.2']
    : [initialPhase];
  for (const candidate of candidates) {
    const codexExisting = findPhaseDirs(codexWorkspace, candidate);
    const baselineExisting = findPhaseDirs(baselineWorkspace, candidate);
    if (codexExisting.length === 0 && baselineExisting.length === 0) {
      return candidate;
    }
  }
  return null;
}

function listFilesRec(dirPath) {
  const results = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...listFilesRec(entryPath));
    } else if (entry.isFile()) {
      results.push(entryPath);
    }
  }
  return results;
}

function findSummaryFiles(phaseDir) {
  if (!phaseDir || !fs.existsSync(phaseDir)) {
    return [];
  }
  return listFilesRec(phaseDir)
    .filter(file => file.endsWith('-SUMMARY.md'))
    .map(file => path.relative(phaseDir, file));
}


function normalizeContent(content) {
  return content.split('\n')
    .map(line => line.replace(/\s+$/, ''))
    .filter(line => !normalizedLinePatterns.some(pattern => pattern.test(line)));
}

function diffLines(left, right, maxLines = 20) {
  const diffs = [];
  const maxLen = Math.max(left.length, right.length);
  for (let i = 0; i < maxLen; i += 1) {
    if (diffs.length >= maxLines) {
      break;
    }
    const leftLine = left[i] === undefined ? '' : left[i];
    const rightLine = right[i] === undefined ? '' : right[i];
    if (leftLine !== rightLine) {
      diffs.push({ line: i + 1, left: leftLine, right: rightLine });
    }
  }
  return diffs;
}

function comparePhaseDirs(codexDir, baselineDir) {
  const codexFiles = listFilesRec(codexDir).map(file => path.relative(codexDir, file));
  const baselineFiles = listFilesRec(baselineDir).map(file => path.relative(baselineDir, file));
  const codexSet = new Set(codexFiles);
  const baselineSet = new Set(baselineFiles);

  const missingInCodex = baselineFiles.filter(file => !codexSet.has(file));
  const missingInBaseline = codexFiles.filter(file => !baselineSet.has(file));
  const sharedFiles = codexFiles.filter(file => baselineSet.has(file));

  const diffs = [];
  for (const file of sharedFiles) {
    const codexPath = path.join(codexDir, file);
    const baselinePath = path.join(baselineDir, file);
    const codexContent = normalizeContent(fs.readFileSync(codexPath, 'utf8'));
    const baselineContent = normalizeContent(fs.readFileSync(baselinePath, 'utf8'));
    if (codexContent.join('\n') !== baselineContent.join('\n')) {
      diffs.push({
        file,
        summary: diffLines(codexContent, baselineContent)
      });
    }
  }

  return {
    codexFiles,
    baselineFiles,
    missingInCodex,
    missingInBaseline,
    diffs
  };
}

function reportDiffSummary(lines, diffs) {
  if (diffs.length === 0) {
    lines.push('No content differences found.');
    return;
  }
  for (const diff of diffs) {
    lines.push(`- \`${diff.file}\``);
    if (diff.summary.length === 0) {
      lines.push('  - Diff detected but summary is empty.');
      continue;
    }
    for (const entry of diff.summary) {
      lines.push(`  - L${entry.line}`);
      lines.push(`    - codex: ${entry.left === '' ? '(empty)' : entry.left}`);
      lines.push(`    - baseline: ${entry.right === '' ? '(empty)' : entry.right}`);
    }
  }
}

function createReport(reportPath, data) {
  const lines = [];
  lines.push('# Parity Report');
  lines.push('');
  lines.push(`Generated: ${data.timestamp}`);
  lines.push('');
  lines.push('## Configuration');
  lines.push(`- Baseline: ${data.baseline}`);
  lines.push(`- Phase: ${data.phase}`);
  lines.push(`- Report path: ${data.reportPath}`);
  lines.push('');
  lines.push('## Workspaces');
  lines.push(`- Codex workspace: ${data.codexWorkspace}`);
  lines.push(`- Baseline workspace: ${data.baselineWorkspace}`);
  lines.push('');
  lines.push('## Logs');
  lines.push(`- Codex install: ${data.logs.codexInstall}`);
  lines.push(`- Codex plan-phase: ${data.logs.codexPlan}`);
  lines.push(`- Codex execute-phase: ${data.logs.codexExecute}`);
  lines.push(`- Baseline install: ${data.logs.baselineInstall}`);
  lines.push(`- Baseline plan-phase: ${data.logs.baselinePlan}`);
  lines.push(`- Baseline execute-phase: ${data.logs.baselineExecute}`);
  lines.push('');
  lines.push('## Artifact Summary');
  lines.push(`- Codex phase dirs: ${data.codexPhaseDirs.length ? data.codexPhaseDirs.join(', ') : 'None'}`);
  lines.push(`- Baseline phase dirs: ${data.baselinePhaseDirs.length ? data.baselinePhaseDirs.join(', ') : 'None'}`);
  lines.push(`- Codex files: ${data.compareResult.codexFiles.length}`);
  lines.push(`- Baseline files: ${data.compareResult.baselineFiles.length}`);
  lines.push('');
  lines.push('### Missing/Extra Files');
  if (data.compareResult.missingInCodex.length === 0 && data.compareResult.missingInBaseline.length === 0) {
    lines.push('No missing or extra files detected.');
  } else {
    if (data.compareResult.missingInCodex.length > 0) {
      lines.push(`- Missing in codex: ${data.compareResult.missingInCodex.join(', ')}`);
    }
    if (data.compareResult.missingInBaseline.length > 0) {
      lines.push(`- Missing in baseline: ${data.compareResult.missingInBaseline.join(', ')}`);
    }
  }
  lines.push('');
  lines.push('### Diff Summary');
  reportDiffSummary(lines, data.compareResult.diffs);
  lines.push('');
  lines.push('## Summary Artifacts');
  lines.push(`- Codex SUMMARY files: ${data.summaryArtifacts.codex.length ? data.summaryArtifacts.codex.join(', ') : 'None found'}`);
  lines.push(`- Baseline SUMMARY files: ${data.summaryArtifacts.baseline.length ? data.summaryArtifacts.baseline.join(', ') : 'None found'}`);
  lines.push('');
  if (data.summaryFailures.length > 0) {
    lines.push('### Summary Artifact Check');
    for (const failure of data.summaryFailures) {
      lines.push(`- ${failure}`);
    }
    lines.push('');
  }
  lines.push(`## Result`);
  lines.push(data.passed ? 'PASS' : 'FAIL');
  lines.push('');

  ensureDir(path.dirname(reportPath));
  fs.writeFileSync(reportPath, `${lines.join('\n')}${os.EOL}`);
}

function main() {
  let options;
  try {
    options = parseArgs(args);
  } catch (error) {
    console.error(error.message);
    printHelp();
    process.exit(2);
  }

  if (options.help) {
    printHelp();
    return;
  }

  if (options.baseline !== 'claude' && options.baseline !== 'opencode') {
    console.error('Baseline must be "claude" or "opencode".');
    process.exit(2);
  }

  const codexCmd = requireEnv('GSD_PARITY_CODEX_CMD');
  const baselineCmd = requireEnv('GSD_PARITY_BASELINE_CMD');
  if (!codexCmd || !baselineCmd) {
    console.error('Missing required environment variables.');
    console.error('Required: GSD_PARITY_CODEX_CMD, GSD_PARITY_BASELINE_CMD');
    process.exit(2);
  }

  const rootDir = process.cwd();
  const parityDir = path.join(rootDir, '.planning', 'parity');
  const codexWorkspace = path.join(parityDir, 'codex-run');
  const baselineWorkspace = path.join(parityDir, 'baseline-run');

  ensureDir(parityDir);
  if (!options.keepWorkspaces) {
    removeDir(codexWorkspace);
    removeDir(baselineWorkspace);
  }
  ensureDir(codexWorkspace);
  ensureDir(baselineWorkspace);

  let trackedFiles;
  try {
    trackedFiles = getTrackedFiles(rootDir);
  } catch (error) {
    console.error(`Failed to list tracked files: ${error.message}`);
    process.exit(2);
  }

  copyTrackedFiles(trackedFiles, rootDir, codexWorkspace);
  copyTrackedFiles(trackedFiles, rootDir, baselineWorkspace);

  const phase = resolvePhase(codexWorkspace, baselineWorkspace, options.phase);
  if (!phase) {
    console.error('Unable to select phase (98, 98.1, 98.2 already exist).');
    process.exit(2);
  }

  const logs = {
    codexInstall: path.join(parityDir, 'codex-install.log'),
    codexPlan: path.join(parityDir, 'codex-plan-phase.log'),
    codexExecute: path.join(parityDir, 'codex-execute-phase.log'),
    baselineInstall: path.join(parityDir, 'baseline-install.log'),
    baselinePlan: path.join(parityDir, 'baseline-plan-phase.log'),
    baselineExecute: path.join(parityDir, 'baseline-execute-phase.log')
  };

  const installCodex = runNodeCommand(['bin/install.js', '--codex', '--local'], {
    cwd: codexWorkspace,
    env: process.env
  });
  writeLog(logs.codexInstall, 'node bin/install.js --codex --local', installCodex);
  if (installCodex.status !== 0) {
    console.error('Codex install failed. See log for details.');
    process.exit(2);
  }

  const baselineInstallArgs = ['bin/install.js', options.baseline === 'claude' ? '--claude' : '--opencode', '--local'];
  const installBaseline = runNodeCommand(baselineInstallArgs, {
    cwd: baselineWorkspace,
    env: process.env
  });
  writeLog(logs.baselineInstall, `node ${baselineInstallArgs.join(' ')}`, installBaseline);
  if (installBaseline.status !== 0) {
    console.error('Baseline install failed. See log for details.');
    process.exit(2);
  }

  const codexPlanCommand = `/gsd:plan-phase ${phase} --skip-research --skip-verify`;
  const codexExecuteCommand = `/gsd:execute-phase ${phase}`;
  const baselinePlanCommand = options.baseline === 'opencode'
    ? `/gsd-plan-phase ${phase} --skip-research --skip-verify`
    : `/gsd:plan-phase ${phase} --skip-research --skip-verify`;
  const baselineExecuteCommand = options.baseline === 'opencode'
    ? `/gsd-execute-phase ${phase}`
    : `/gsd:execute-phase ${phase}`;

  const codexPlan = runCommand(`${codexCmd} ${codexPlanCommand}`, { cwd: codexWorkspace, env: process.env });
  writeLog(logs.codexPlan, `${codexCmd} ${codexPlanCommand}`, codexPlan);
  if (codexPlan.status !== 0) {
    console.error('Codex plan-phase failed. See log for details.');
    process.exit(2);
  }

  const codexExecute = runCommand(`${codexCmd} ${codexExecuteCommand}`, { cwd: codexWorkspace, env: process.env });
  writeLog(logs.codexExecute, `${codexCmd} ${codexExecuteCommand}`, codexExecute);
  if (codexExecute.status !== 0) {
    console.error('Codex execute-phase failed. See log for details.');
    process.exit(2);
  }

  const baselinePlan = runCommand(`${baselineCmd} ${baselinePlanCommand}`, { cwd: baselineWorkspace, env: process.env });
  writeLog(logs.baselinePlan, `${baselineCmd} ${baselinePlanCommand}`, baselinePlan);
  if (baselinePlan.status !== 0) {
    console.error('Baseline plan-phase failed. See log for details.');
    process.exit(2);
  }

  const baselineExecute = runCommand(`${baselineCmd} ${baselineExecuteCommand}`, { cwd: baselineWorkspace, env: process.env });
  writeLog(logs.baselineExecute, `${baselineCmd} ${baselineExecuteCommand}`, baselineExecute);
  if (baselineExecute.status !== 0) {
    console.error('Baseline execute-phase failed. See log for details.');
    process.exit(2);
  }

  const codexPhaseDirs = findPhaseDirs(codexWorkspace, phase).map(dir => path.relative(codexWorkspace, dir));
  const baselinePhaseDirs = findPhaseDirs(baselineWorkspace, phase).map(dir => path.relative(baselineWorkspace, dir));

  const codexPhaseDir = findPhaseDirs(codexWorkspace, phase)[0];
  const baselinePhaseDir = findPhaseDirs(baselineWorkspace, phase)[0];

  const codexSummaryFiles = findSummaryFiles(codexPhaseDir);
  const baselineSummaryFiles = findSummaryFiles(baselinePhaseDir);
  const summaryFailures = [];
  if (codexSummaryFiles.length === 0) {
    summaryFailures.push('Missing SUMMARY artifacts in codex workspace. Rerun parity with a phase that produces execute-phase SUMMARY outputs.');
  }
  if (baselineSummaryFiles.length === 0) {
    summaryFailures.push('Missing SUMMARY artifacts in baseline workspace. Rerun parity with a phase that produces execute-phase SUMMARY outputs.');
  }

  let compareResult = {
    codexFiles: [],
    baselineFiles: [],
    missingInCodex: [],
    missingInBaseline: [],
    diffs: []
  };

  if (codexPhaseDir && baselinePhaseDir) {
    compareResult = comparePhaseDirs(codexPhaseDir, baselinePhaseDir);
  } else {
    if (!codexPhaseDir && baselinePhaseDir) {
      compareResult.missingInCodex = ['(phase directory missing)'];
    }
    if (!baselinePhaseDir && codexPhaseDir) {
      compareResult.missingInBaseline = ['(phase directory missing)'];
    }
    if (!codexPhaseDir && !baselinePhaseDir) {
      compareResult.missingInCodex = ['(phase directory missing)'];
      compareResult.missingInBaseline = ['(phase directory missing)'];
    }
  }

  const reportPath = path.isAbsolute(options.report)
    ? options.report
    : path.join(rootDir, options.report);

  const timestamp = new Date().toISOString();
  const passed = summaryFailures.length === 0
    && compareResult.missingInCodex.length === 0
    && compareResult.missingInBaseline.length === 0
    && compareResult.diffs.length === 0;

  createReport(reportPath, {
    timestamp,
    baseline: options.baseline,
    phase,
    reportPath: path.relative(rootDir, reportPath),
    codexWorkspace: path.relative(rootDir, codexWorkspace),
    baselineWorkspace: path.relative(rootDir, baselineWorkspace),
    logs: {
      codexInstall: path.relative(rootDir, logs.codexInstall),
      codexPlan: path.relative(rootDir, logs.codexPlan),
      codexExecute: path.relative(rootDir, logs.codexExecute),
      baselineInstall: path.relative(rootDir, logs.baselineInstall),
      baselinePlan: path.relative(rootDir, logs.baselinePlan),
      baselineExecute: path.relative(rootDir, logs.baselineExecute)
    },
    codexPhaseDirs,
    baselinePhaseDirs,
    summaryArtifacts: {
      codex: codexSummaryFiles,
      baseline: baselineSummaryFiles
    },
    summaryFailures,
    compareResult,
    passed
  });

  process.exit(passed ? 0 : 1);
}

main();
