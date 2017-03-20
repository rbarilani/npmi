#!/usr/bin/env node

const vorpal = require('vorpal')();
const Script = require('./lib/script');
const ScriptProcessManager = require('./lib/script-process-manager');
const scripts = Script.fromPackageJSON();
const processManager = new ScriptProcessManager();

process.on('exit', () => {
	processManager.killAll();
});

vorpal
	.command('ps', 'Show npm scripts running processes.')
	.action(function (args, cb) {
    if(!processManager.processes.length) {
      this.log('no processes are running.');
      cb();
      return;
    }
		processManager.processes.forEach((proc) => {
			this.log(`${proc.pid} ${proc.title}`);
		});
		cb();
	});

vorpal
	.command('kill <id>', 'Kill running npm script process by name or pid.')
	.action(function (args, cb) {
		try {
			processManager.killByNameOrPid(args.id);
			cb();
		}catch(e) {
			this.log(`error: ${e.message}`);
			cb();
		}
	});

scripts.forEach((script) => {
	vorpal
		.command(script.name, script.description)
		.action(function (args, cb) {
			processManager.spawn(script, {log: this.log.bind(this)});
			cb();
		});
});

vorpal
  .history(`${Script.packageJSON.name}`)
  .delimiter(`${Script.packageJSON.name}$`)
  .show();
