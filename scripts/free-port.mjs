import { execSync } from 'node:child_process';

const port = Number(process.argv[2] || 4321);

function killOnWindows(targetPort) {
  let output = '';
  try {
    output = execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${targetPort} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique"`,
      { encoding: 'utf8' }
    );
  } catch {
    output = '';
  }

  const pids = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^\d+$/.test(line));

  if (pids.length === 0) {
    console.log(`Port ${targetPort} is already free.`);
    return;
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Killed PID ${pid} on port ${targetPort}.`);
    } catch {
      console.warn(`Could not kill PID ${pid}. Try running as administrator.`);
    }
  }
}

function killOnUnix(targetPort) {
  try {
    const output = execSync(`lsof -ti tcp:${targetPort}`, { encoding: 'utf8' }).trim();
    if (!output) {
      console.log(`Port ${targetPort} is already free.`);
      return;
    }

    const pids = output.split(/\r?\n/).filter(Boolean);
    for (const pid of pids) {
      execSync(`kill -9 ${pid}`);
      console.log(`Killed PID ${pid} on port ${targetPort}.`);
    }
  } catch {
    console.log(`Port ${targetPort} is already free or lsof is unavailable.`);
  }
}

if (Number.isNaN(port) || port <= 0) {
  console.error('Invalid port. Usage: node scripts/free-port.mjs <port>');
  process.exit(1);
}

if (process.platform === 'win32') {
  killOnWindows(port);
} else {
  killOnUnix(port);
}
