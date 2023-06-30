const dotenv = require('dotenv');
dotenv.config();
const { getXataClient } = require("../xata");
const xata = getXataClient();
const { DateTime } = require("luxon");

module.exports = class {
  constructor(name, recurrence, instructions, points, userID) {
    // Validate the recurrence parameter
    if (!["daily", "monthly", "weekly"].includes(recurrence)) {
      throw new Error('Invalid recurrence. Please provide either "daily", "monthly", or "weekly".');
    }

    // Assign the values to class properties
    this.name = name;
    this.instructions = instructions;
    this.points = Number(points);
    this.recurrence = recurrence;
    this.userID = userID;
  }

  isDone(userMissions) {
    if (!userMissions[this.name]) {
      return false;
    } else {
      // Get the current date
      const currentDate = DateTime.now().setZone('America/Sao_Paulo').startOf('day');
      // Your specific date with time and time zone offset
      const lastDoneDate = DateTime.fromISO(userMissions[this.name], { zone: 'America/Sao_Paulo' }).startOf('day');
      
      if (this.recurrence === 'daily') return lastDoneDate.equals(currentDate);
      if (this.recurrence === 'weekly') return lastDoneDate.weekNumber === currentDate.weekNumber;
      if (this.recurrence === 'monthly') return lastDoneDate.startOf('month').equals(currentDate.startOf('month'));
    }
  }
  async getUser(userID = this.userID) {
    let defaultUserData = {
      id: userID,
      dailyMissions: '{}',
      monthlyMissions: '{}',
      weeklyMissions: '{}',
      progress: '{}',
      points: 0
    };

    return await xata.db.huntersMissions.read(userID) || defaultUserData;
  }
  async getMissionsAsObject() {
    const user = await this.getUser();
    return JSON.parse(user[this.recurrence + 'Missions']);
  }
  async markAsDone() {
    const user = await this.getUser();
    const userMissions = JSON.parse(user[this.recurrence + 'Missions']);

    if (this.isDone(userMissions)) return null;

    const updatedUserMissions = {
      ...userMissions,
      [this.name]: DateTime.now().setZone('America/Sao_Paulo').toISO()
    };
  
    const updatedUser = {
      ...user,
      points: user.points + this.points,
      [this.recurrence + 'Missions']: JSON.stringify(updatedUserMissions)
    };
  
    return xata.db.huntersMissions.createOrReplace(updatedUser);
  }
  async getProgress() {
    const user = await this.getUser();
    const userProgress = JSON.parse(user.progress);
    return userProgress[this.name];
  }
  async setProgress(value) {
    const user = await this.getUser();
    const userProgress = JSON.parse(user.progress);
    
    const updatedUserProgress = {
      ...userProgress,
      [this.name]: value
    };

    const updatedUser = {
      ...user,
      progress: JSON.stringify(updatedUserProgress)
    };
  
    return xata.db.huntersMissions.createOrReplace(updatedUser);
  }
  
  static missions = [
    {
      "name": "luckyItems",
      "recurrence": "daily",
      "instructions": "Tire o Rolinho da Sorte com o Yukimaru",
      "points": 1
    },
    {
      "name": "makeAWish",
      "recurrence": "daily",
      "instructions": "Faça uma invocação no Simulador de Gacha de Honkai: Star Rail ou Genshin Impact",
      "points": 1
    },
    {
      "name": "sendMemes",
      "recurrence": "daily",
      "instructions": "Poste um meme em qualquer Canal de Meme",
      "points": 1
    },
    {
      "name": "sendScreenshots",
      "recurrence": "weekly",
      "instructions": "Poste uma Screenshot de Genshin Impact e/ou Honkai: Star Rail no canal <#897933306203602944> ou <#957862100775092294>",
      "points": 5
    },
    {
      "name": "make7Wishes",
      "recurrence": "weekly",
      "instructions": "Faça um total de 7 Invocações no Simulador de Gacha de Honkai: Star Rail e/ou Genshin Impact",
      "points": 7
    }
  ];
}