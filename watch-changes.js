const fs = require("fs");
const { execSync, spawn } = require("child_process");
const fname = "./change.signal";

async function main() {
  const [buildCommand, startCommandText] = process.argv.slice(2);
  startCommand(startCommandText);
  if (!fs.existsSync(fname)) {
    fs.writeFileSync(fname, Buffer.from(""));
  }
  let timeOutHandle = null;
  fs.watch(fname, (eventType, fileName) => {
    if (fileName && eventType === "change") {
      if (timeOutHandle) {
        clearTimeout(timeOutHandle);
        timeOutHandle = null;
      }
      timeOutHandle = setTimeout(() => {
        console.log("building application.... " + buildCommand);
        timeOutHandle = null;
        try {
          const output = execSyncCommand(buildCommand);
          if (output) {
            console.log(output.toString());
            startCommand(startCommandText);
          }
        } catch (err) {
          fs.writeFileSync("./errors", err.stdout);
          process.stdout.write(err.stdout);
        }
      }, 500);
    }
  });
}

function startCommand(startCommandText) {
  const fnamePid = "./pid";
  if (fs.existsSync(fnamePid)) {
    const pid = Number(fs.readFileSync(fnamePid).toString());
    try {
      process.kill(-pid);
      child = null;
      console.log("killed");
    } catch (err) {}
  }
  const [command, ...otherArgs] = startCommandText.split(" ");
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
