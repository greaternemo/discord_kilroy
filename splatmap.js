/*
    splatmap.js
    parses splatoon map data
*/

var Splatmap = function() {
    this.time;
    this.update;
    this.currMaps;
    this.nextMaps;
    this.lastMaps;

    this._init();
};

function sMap() {
    this.raw = {
        start: null,
        end: null,
    };
    this.start = null;
    this.end = null;
    this.regular = {
        rules: "",
        maps: [],
    };
    this.ranked = {
        rules: "",
        maps: [],
    };
}

Splatmap.prototype._init = function() {
    this.time = Date.now();
    this.text;
    this.currMaps = new sMap();
    this.nextMaps = new sMap();
    this.lastMaps = new sMap();
};

Splatmap.prototype.curr = function(attr) {
    return this.currMaps[attr];
};
Splatmap.prototype.next = function(attr) {
    return this.nextMaps[attr];
};
Splatmap.prototype.last = function(attr) {
    return this.lastMaps[attr];
};

Splatmap.prototype.parseRotation = function(rData) {
    // Really basic stuff first, then we'll get serious with it later
    // Assume at first that we've got good data, we'll add more later for debug testing

    var mapData = JSON.parse(rData);
    var timeMap = ["currMaps", "nextMaps", "lastMaps"];
    var tVar = "";
    var cnt = 0;
    
    this.update = mapData.updateTime;

    for (cnt = 0; cnt < mapData.schedule.length; cnt++) {
        tVar = timeMap[cnt];
        
        this[tVar].raw.start = mapData.schedule[cnt].startTime;
        this[tVar].raw.end = mapData.schedule[cnt].endTime;
        
        this[tVar].start = new Date(mapData.schedule[cnt].startTime);
        this[tVar].end = new Date(mapData.schedule[cnt].endTime);

        this[tVar].regular.rules = mapData.schedule[cnt].regular.rules.en;
        this[tVar].regular.maps.push(mapData.schedule[cnt].regular.maps[0].name.en);
        this[tVar].regular.maps.push(mapData.schedule[cnt].regular.maps[1].name.en);

        this[tVar].ranked.rules = mapData.schedule[cnt].ranked.rules.en;
        this[tVar].ranked.maps.push(mapData.schedule[cnt].ranked.maps[0].name.en);
        this[tVar].ranked.maps.push(mapData.schedule[cnt].ranked.maps[1].name.en);
    }
    
    this.genText();
};

Splatmap.prototype.genText = function() {

    function formTimes(aMap) {
        var timeText = "";
        timeText += aMap.start.toLocaleTimeString('en-GB', {
            timeZone: "UTC",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
        });
        timeText += " - ";
        timeText += aMap.end.toLocaleTimeString('en-GB', {
            timeZone: "UTC",
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
        });
        timeText += " UTC / ";
        timeText += aMap.start.toLocaleTimeString('en-US', {
            timeZone: "America/New_York",
            hour: "2-digit",
            minute: "2-digit",
        });
        timeText += " - ";
        timeText += aMap.end.toLocaleTimeString('en-US', {
            timeZone: "America/New_York",
            hour: "2-digit",
            minute: "2-digit",
        });
        timeText += " EST";
        return timeText;
    }

    this.text = "Current Rotation: " + "\n" +
        formTimes(this.currMaps) + "\n" +
        "**Regular**: **" + this.curr('regular').rules + "** on **" +
        this.curr('regular').maps[0] + "** & **" + this.curr('regular').maps[1] + "**\n" +
        "**Ranked**: **" + this.curr('ranked').rules + "** on **" +
        this.curr('ranked').maps[0] + "** & **" + this.curr('ranked').maps[1] + "**\n" +
        "\n" + "Next Rotation: " + "\n" +
        formTimes(this.nextMaps) + "\n" +
        "**Regular**: **" + this.next('regular').rules + "** on **" +
        this.next('regular').maps[0] + "** & **" + this.next('regular').maps[1] + "**\n" +
        "**Ranked**: **" + this.next('ranked').rules + "** on **" +
        this.next('ranked').maps[0] + "** & **" + this.next('ranked').maps[1] + "**\n";

};

module.exports = Splatmap;