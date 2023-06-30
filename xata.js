"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXataClient = exports.XataClient = void 0;
// Generated by Xata Codegen 0.22.3. Please do not edit.
const client_1 = require("@xata.io/client");
/** @typedef { import('./types').SchemaTables } SchemaTables */
/** @type { SchemaTables } */
const tables = [
  {
    name: "items",
    columns: [
      { name: "name", type: "string" },
      { name: "quality", type: "int" },
      { name: "type", type: "string" },
      { name: "image", type: "string" },
      { name: "subtype", type: "string" },
      { name: "englishName", type: "string" },
      { name: "game", type: "string", notNull: true, defaultValue: "genshin" },
      { name: "subtype2", type: "string" },
    ],
  },
  {
    name: "banners",
    columns: [
      { name: "name", type: "string" },
      { name: "type", type: "string" },
      { name: "generalItems", type: "multiple" },
      { name: "boostedItems", type: "multiple" },
      { name: "command", type: "string" },
      { name: "game", type: "string" },
    ],
  },
  {
    name: "inventory",
    columns: [
      { name: "lastStarWasBoosted", type: "text" },
      { name: "streakWithout", type: "text" },
      { name: "usageCount", type: "text" },
    ],
  },
  {
    name: "roles",
    columns: [
      { name: "emoji", type: "string" },
      { name: "title", type: "string" },
      { name: "description", type: "text" },
      { name: "thumbnail", type: "string" },
      { name: "image", type: "string" },
      { name: "color", type: "string" },
      { name: "messageID", type: "string" },
    ],
  },
  {
    name: "huntersMissions",
    columns: [
      { name: "dailyMissions", type: "text" },
      { name: "points", type: "int" },
      { name: "weeklyMissions", type: "text" },
      { name: "monthlyMissions", type: "text" },
      { name: "progress", type: "text" },
    ],
  },
  {
    name: "luckyItems",
    columns: [
      { name: "name", type: "string" },
      { name: "description", type: "text" },
      { name: "image", type: "string" },
    ],
  },
];
/** @type { import('../../client/src').ClientConstructor<{}> } */
const DatabaseClient = (0, client_1.buildClient)();
const defaultOptions = {
  databaseURL: "https://Yukimaru-bqpg78.us-east-1.xata.sh/db/yukimaru",
};
/** @typedef { import('./types').DatabaseSchema } DatabaseSchema */
/** @extends DatabaseClient<DatabaseSchema> */
class XataClient extends DatabaseClient {
  constructor(options) {
    super({ ...defaultOptions, ...options }, tables);
  }
}
exports.XataClient = XataClient;
let instance = undefined;
/** @type { () => XataClient } */
const getXataClient = () => {
  if (instance) return instance;
  instance = new XataClient();
  return instance;
};
exports.getXataClient = getXataClient;
