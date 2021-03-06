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

// We'll flip this once we're reporting maps to be sure we don't do it more than once.
var reportingMaps = false;
var mapChannel = null;
var mapTimeout = null;
var mapCycle = new Splatmap();

// Set up behavior
function getMaps() {

	var hReq = null;
	var hStat = "";
	var mapData = "";

	//clearTimeout(mapTimeout);

	hReq = Hyper.get('http://splatoon.ink/schedule.json', (resp) => {
		console.log("Status Code: " + resp.statusCode);
		hStat = resp.statusCode;

		resp.on('data', (rData) => {
			mapData = "";
			mapData += rData;
		});

		resp.on('end', (myResp) => {
			console.log("Status Code: " + hStat);
			if (hStat == 200) {
				console.log('Success - splatoon.ink API returned status 200.');
				Kilroy.sendMessage(mapChannel, "Success! Retrieved map data from splatoon.ink.");
				var tilNext;

				if (reportingMaps === false) {
					mapCycle.parseRotation({
						body: mapData,
						time: 'curr',
					});
					reportingMaps = 'yes';
					tilNext = (mapCycle.currMaps.raw.end - Date.now());
					Kilroy.sendMessage(mapChannel, "Ready to report maps at next rotation!")
				} else if (reportingMaps == 'yes') {
					mapCycle.parseRotation({
						body: mapData,
						time: 'next',
					});
					tilNext = (mapCycle.nextMaps.raw.end - Date.now());
				}

				Kilroy.sendMessage(mapChannel, mapCycle.text);

				if (tilNext > 0) {
					console.log(mapCycle.currMaps.raw.end);
					console.log(tilNext);
					mapTimeout = setTimeout(getMaps, tilNext);
				} else {
					console.log(tilNext);
					console.log("Time until next rotation is negative, bailing out.");
					reportingMaps = false;
				}
			}
		});
	});
}

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
	if (msg.author.id == Conf.key_user) {

		if (msg.content == '!maps') {
			if (reportingMaps == 'spam') {
				console.log("Ignoring spammy duplicate maps request");
			} else if (reportingMaps === 'yes') {
				console.log("Ignoring duplicate maps request");
				Kilroy.sendMessage(msg.channel, "I'm already reporting the map rotation! Don't spam requests. D:");
				reportingMaps = 'spam';
			} else if (reportingMaps === false) {
				mapChannel = msg.channel;
				getMaps();
			}
		}

		if (msg.content == '!users') {
			var userlist = "";
			for (x = 0; x < Kilroy.users.length; x++) {
				userlist += Kilroy.users[x].username + " " + Kilroy.users[x].id + "\n";
			}
			Kilroy.sendMessage(msg.channel,
				"Nemo, here are the current users logged into OldiesGaming:\n" + userlist);
			console.log("Showed current users");
		} else if (msg.isMentioned(Kilroy.users[0])) {
			Kilroy.sendMessage(msg.channel, "new phone who dis");
			console.log("tag for " + Kilroy.users[0].username + " from " + msg.author.username);
		}
	}
});

// Login at the end
Kilroy.login(Auth.email, Auth.password);