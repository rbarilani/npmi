const spawn = require('child_process').spawn;

class ScriptProcessManager {
  constructor() { this.processes = []; }

  spawn(script, {log}) {
    const cmd  = 'npm';
    const args = ['run', script.name];
    const proc = spawn(cmd, args, { stdio: ['ignore', process.stdout, process.stderr], detached: true });

    proc.title = `${script.name} -> ${cmd} ${args.join(' ')} -> ${script.value}`;
    proc.script = script;
    proc.log = log;

    this.processes = this.processes.concat(proc);

    proc.on('close', () => {
      this.remove(proc);
    });

    return proc;
  }

  remove(proc) {
    this.processes = this.processes.reduce((acc, procx) => {
      if(proc !== procx) { acc.push(procx); } else {
        proc.log(`[process-manager] remove ${proc.pid} ${proc.title}`)
      }
      return acc;
    }, []);
  }

  findProcessByName(name) {
    return this.processes.find((proc) => proc.script.name === name);
  }

  findProcessByPid(pid) {
    return this.processes.find((proc) => proc.pid === pid);
  }

  killByNameOrPid(nameOrPid) {
    const proc = typeof nameOrPid === 'string' ? this.findProcessByName(nameOrPid) : this.findProcessByPid(nameOrPid);
    if(!proc) {
      throw new Error(`Process ${nameOrPid} not found. Unable to kill.`)
    }
    this.kill(proc);
  }

  kill(proc) {
    if(!proc || !proc.pid) { return; }
    process.kill(-proc.pid);
    proc.log(`[process-manager] kill ${proc.pid} ${proc.title}`);
    this.remove(proc);
  }

  killAll() {
    this.processes.forEach((proc) => {
      this.kill(proc);
    });
  }
}

module.exports = ScriptProcessManager;
