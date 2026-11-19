'use strict';

// Offline checks: never log in or register commands against Discord.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
process.chdir(root);

async function main() {
  const folders = ['commands', 'core', 'events', 'buttons', 'interactions'];
  const files = ['index.js', 'xata.js', ...folders.flatMap(folder =>
    fs.readdirSync(folder).filter(f => f.endsWith('.js')).map(f => `${folder}/${f}`))];
  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${file}: ${result.stderr}`);
  }
  console.log(`Syntax: ${files.length} files OK`);
  const pkg = require('../package.json');
  const lock = require('../package-lock.json');
  assert.deepEqual(pkg.dependencies, lock.packages[''].dependencies);
  assert.deepEqual(pkg.engines, lock.packages[''].engines);
  assert.equal(pkg.scripts.start, 'node index.js');
  for (const name of Object.keys(pkg.dependencies)) require(name);
  console.log('Lock metadata and direct module loading OK');

  const canvas = require('canvas').createCanvas(8, 8);
  canvas.getContext('2d').fillRect(0, 0, 8, 8);
  const png = canvas.toBuffer('image/png');
  const output = await require('sharp')(png).resize(4, 4).png().toBuffer();
  assert.equal((await require('sharp')(output).metadata()).width, 4);
  console.log('Canvas PNG + sharp resize OK');

  const discord = require('discord.js');
  global.bot = new (require('node:events').EventEmitter)();
  global.bot.cooldowns = new discord.Collection();
  global.xata = {};
  global.cloudinary = require('cloudinary').v2;
  // A test double prevents Xata credential requirements; no DB calls are made.
  require('../xata').getXataClient = () => global.xata;
  let commands = 0;
  const names = new Set();
  for (const folder of folders) {
    for (const file of fs.readdirSync(folder).filter(f => f.endsWith('.js'))) {
      const mod = require(path.join(root, folder, file));
      if (folder === 'commands') {
        const json = mod.properties.toJSON();
        assert(!names.has(json.name), `Duplicate command ${json.name}`);
        names.add(json.name);
        assert.equal(typeof mod.execute, 'function');
        commands++;
      }
      if (folder === 'events') {
        assert.equal(typeof mod.name, 'string');
        assert.equal(typeof mod.execute, 'function');
      }
    }
  }
  console.log(`All local modules loaded; ${commands} command schemas OK`);

  // Run the real entry point in a VM with external integrations intercepted.
  const entry = fs.readFileSync(path.join(root, 'index.js'), 'utf8');
  for (const port of [undefined, '48123']) {
    let listenArgs;
    let loginCalled = false;
    const app = { get() {}, listen(...args) { listenArgs = args; } };
    class OfflineClient { login() { loginCalled = true; } }
    const context = {
      __dirname: root, console, global: {},
      process: { env: port ? { PORT: port } : {}, on() {} },
      require(name) {
        if (name === 'express') return () => app;
        if (name === 'discord.js') return { ...discord, Client: OfflineClient };
        if (name === 'dotenv') return { config() {} };
        if (name === './xata') return { getXataClient: () => ({}) };
        if (name === 'cloudinary') return { v2: { config() {} } };
        if (name === './core/commandsCore') return { deployCommands() {} };
        if (name === './core/eventsCore') return { deployEvents() {} };
        return require(path.resolve(root, name));
      }
    };
    vm.runInNewContext(entry, context, { filename: 'index.js' });
    assert.equal(listenArgs[0], port || 3000);
    assert.equal(listenArgs[1], '0.0.0.0');
    assert(loginCalled);
  }
  console.log('Entry point: PORT/default port, bind address and login invocation OK (isolated doubles)');
  console.log('External services and actual Discord interactions NOT tested');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
