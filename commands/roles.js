"use strict";

async function addRole (reaction, user, db) {

  if (user.id != "982362174062227518") {
  
    let rolesMsg = (await db.get("rolesMsg"));
    if (rolesMsg) rolesMsg = rolesMsg[reaction.message.id];
    let roles = await db.get("roles" + rolesMsg);
    if (roles == null) roles = [];
    
    if (reaction.partial) {
  		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
  		try {
  			await reaction.fetch();
  		} catch (error) {
  			console.log('Something went wrong when fetching the message:', error);
  			// Return as `reaction.message.author` may be undefined/null
  			return;
  		}
  	}
    
    const member = reaction.message.guild.members.cache.get(user.id);
    if (member) {
    
      for (let i = 0; i < roles.length; i++) {
    //982362174062227518
        if (roles[i].emojo == reaction.emoji.name && rolesMsg != undefined || roles[i].emojo.replace(/<:.*?:(.*)>/, "$1") == reaction.emoji.id && rolesMsg != undefined) member.roles.add(roles[i].id.substr(3, roles[i].id.length - 4));
    
      }
    }

  }

}

async function removeRole (reaction, user, db) {

  if (user.id != "982362174062227518") {
    
    let rolesMsg = (await db.get("rolesMsg"));
    if (rolesMsg) rolesMsg = rolesMsg[reaction.message.id];
    let roles = await db.get("roles" + rolesMsg);
    if (roles == null) roles = [];
  
    if (reaction.partial) {
  		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
  		try {
  			await reaction.fetch();
  		} catch (error) {
  			console.log('Something went wrong when fetching the message:', error);
  			// Return as `reaction.message.author` may be undefined/null
  			return;
  		}
    }
  
  	const member = reaction.message.guild.members.cache.get(user.id);
    if (member) {
    
      for (let i = 0; i < roles.length; i++) {
    
        if (roles[i].emojo == reaction.emoji.name && rolesMsg != undefined || roles[i].emojo.replace(/<:.*?:(.*)>/, "$1") == reaction.emoji.id && rolesMsg != undefined) member.roles.remove(roles[i].id.substr(3, roles[i].id.length - 4));
    
      }
    }

  }

}

module.exports = {addRole, removeRole}