const fs = require('fs');
const { execSync, spawn } = require('child_process');
const fname = './change.signal';

async function main() {
  const [buildCommand, startCommandText] = process.argv.slice(2);
  if (!fs.existsSync(fname)) {
    startCommand(startCommandText);
  }
  while (true) {
    if (fs.existsSync(fname)) {
      console.log('building.... ' + buildCommand);
      try {
        const output = execSyncCommand(buildCommand);
        if (output) {
          console.log(output.toString());
          startCommand(startCommandText);
        }
      } catch (err) {
        process.stdout.write(err.stdout);
      } finally {
        fs.unlinkSync(fname);
      }
    }

    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(null), 2000);
    });
  }
}

function startCommand(startCommandText) {
  const fnamePid = './pid';
  if (fs.existsSync(fnamePid)) {
    const pid = Number(fs.readFileSync(fnamePid).toString());
    try {
      process.kill(-pid);
      child = null;
      console.log('killed');
    } catch (err) {}
  }
  const [command, ...otherArgs] = startCommandText.split(' ');
  const child = spawnCommand(command, otherArgs);
  fs.writeFileSync(fnamePid, child.pid.toString());
  return child;
}

function spawnCommand(command, args) {
  const childProcess = spawn(command, args, {
    detached: true,
  });
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
  return childProcess;
}

function execSyncCommand(command) {
  return execSync(command, (error, stdout, stderr) => {
    stdout.pipe(process.stdout);
    stderr.pipe(process.stderr);
  });
}

main();
