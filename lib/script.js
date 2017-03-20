const path = require('path');
const fs = require('fs');

class Script {
  constructor({name, value}) {
    this.name = name;
    this.description = `npm run ${name}`;
    this.value = value;
  }

  static fromPackageJSON() {
    const packageJSONPath = path.resolve(process.cwd(), 'package.json');
    try{
      Script.packageJSON = JSON.parse(fs.readFileSync(packageJSONPath));
      return Object.keys(Script.packageJSON.scripts || {}).map((name) => {
        let value = Script.packageJSON.scripts[name];
        return new Script({name, value});
      });
    }catch(err) {
      console.error(err);
      console.error('Unable to read package.json in the current working directory');
      process.exit(1);
      return;
    }
  }
}

module.exports = Script;
