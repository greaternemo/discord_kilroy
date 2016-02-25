/*
	kilroy.js
	Discord bot to handle administrative tasks for OldiesGaming
*/

// Gotta use this instead of XMLHttpRequest
var Hyper = require('http');

// Pull our conf and auth data
var Conf = require("./conf.json");
var Auth = require("./auth.json");

// Map handling tools
var Splatmap = require("./splatmap.js");

var Discord = require(Conf.discord_library);
var Kilroy = new Discord.Client();

// Set up behavior

// Behavior for when the bot is ready
Kilroy.on("ready", function() {
	console.log("Reporting for duty! Currently overseeing " + Kilroy.channels.length + " channels");
});

// Behavior for when the bot disconnects
Kilroy.on("disconnected", function() {
	console.log("Disconnected!");
	process.exit(1);
});

// Behavior for recieving messages
Kilroy.on("message", function(msg) {
	var x = 0;
	if (msg.author.username == "Nemo 🐙🚗👠") {
		/*
		if (msg.content == "(╯°□°）╯︵ ┻━┻") {
			Kilroy.sendMessage(msg.channel, "┬─┬﻿ ノ( ゜-゜ノ)");
			console.log("unflipped " + msg.author.username);
		} else if (msg.content == "domo arigato") {
			Kilroy.sendMessage(msg.channel, "😉");
			console.log("winked at " + msg.author.username);
		} else if (msg.content == "log client users") {
			Kilroy.sendMessage(msg.channel, "Logged client.users username data.");
			for (x = 0; x < Kilroy.users.length; x++) {
				console.log("client.users: " + Kilroy.users[x].username);
			}
		} */

		if (msg.content == '!maps') {
			var hReq;
			var hResp = {
				"statusCode": "",
				"data": null,
			};
			var mCycle =  new Splatmap();
			
			hReq = Hyper.get('http://splatoon.ink/schedule.json', (resp) => {
				console.log("Status Code: " + resp.statusCode);
				hResp.statusCode = resp.statusCode;

				resp.on('data', (rData) => {
					//console.log("Data : " + rData);					
					//hResp.data += rData;
					
					mCycle.parseRotation(rData);
					mCycle.genText();
					//Splatmap.parseRotation(rData);
					//Splatmap.genText();
					Kilroy.sendMessage(msg.channel, mCycle.text);
				});

				resp.on('end', (myResp) => {
					console.log("Status Code: " + hResp.statusCode);
					if (hResp.statusCode == 200) {
						console.log('Success - splatoon.ink API returned status 200.');
						Kilroy.sendMessage(msg.channel, "Success! Retrieved map data from splatoon.ink.");
					}
				});
			});
		}

		if (msg.content == '!users') {
			var userlist = "";
			for (x = 0; x < Kilroy.users.length; x++) {
				userlist += Kilroy.users[x].username;
				if (x + 1 !== Kilroy.users.length) {
					userlist += ", ";
				}
			}
			Kilroy.sendMessage(msg.channel,
				"Nemo, here are the current users logged into OldiesGaming: " + userlist);
			console.log("Showed current users");
		} else if (msg.isMentioned(Kilroy.users[0])) {
			Kilroy.sendMessage(msg.channel, msg.author.username + " new phone who dis");
			console.log("tag for " + Kilroy.users[0].username + " from " + msg.author.username);
		}
	}
});
// Login at the end
Kilroy.login(Auth.email, Auth.password);