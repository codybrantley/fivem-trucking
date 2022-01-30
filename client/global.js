"use strict";

// Global
const resource          = "Trucking";
const player            = GetPlayerPed(-1);
const playerServerId    = GetPlayerServerId();
let playerIdentifier    = "";
let onduty, onjob       = false;

let showLines    = false; //debug remove
    onduty = true;

// Blips
const blips = [
    {x: 346.1399, y: 3407.032, z: 36.54668}, // La Mesa
    {x: 1018.293, y: -2511.562, z: 28.46917} // Cypress Flats
];

// Trailers
const vehicles = [
    0x21EEE87D, // Packer
    0x6A59902D, // Boat
    0x7CAB34D0, // Car Carrier
    0xA1DA3C91, // Commercial
    0xCBB2BE0E, // Container
    0x9E6B14D6, // Drill
    0x782A236D, // Logging
    0xD46F4737  // Tanker
];

// Job
let job, truck, trailer = null;
let basepay             = 700; // $700 in game
let mission             = 1;
let dropoff             = false;
let subtotal, total     = 0;
let deliveryDistance, dropoffDistance, trailerHeading     = 0;
let distanceStatus, angleStatus, trailerStatus, timeScore = "";
let startTime, latestTime, deliveryTime = 0;
let timePerMile         = 60000; // 1 minute to milliseconds
let timeBonus           = 120000; // 2 minutes to milliseconds
let deliveryReport      = [];
const quality           = ["Perfect", "Ideal", "Acceptable", "Fair", "Tolerable", "Poor", "Destroyed", "--"];
const timeEfficiency    = ["Early", "On-Time", "Late"];
const weatherType       = ["CLEAR", "NEUTRAL", "SMOG", "FOGGY", "CLOUDS", "OVERCAST", "CLEARING", "RAIN", "THUNDER"];
const message = {
    onduty: "You are now on duty. Check your ~y~handheld~w~ for delivery jobs.",
    offduty: "You are now off duty, and will no longer receive alerts.",
    notonduty: "You must be on duty before you can take any jobs.",
    deliveryavail: "A new ~r~delivery~w~ is available, check your ~y~handheld~w~ to accept.",
    auctionavail: "A new ~r~auction~w~ is available, check your ~y~handheld~w~ to bid.",
    jobstart: "{0} delivery started. GPS location set.",
    jobdeli: "Trailer picked up. Dropoff location set on GPS.",
    jobinfo: "~y~Attempting Dropoff~n~~w~Distance: {0}~n~Angle: {1}~n~Trailer Condition: {2}",
    jobdrop: "Press ~y~L~w~ to dropoff trailer",
    jobunload: "Evaluating performance and unloading cargo...",
    jobdone: "Delivery completed. You received ~g~${0}~w~, check your ~y~handheld~w~ for a full delivery report.",
    jobunavail: "This job is currently not available."
};

/**
 * Replaces arguments in string with variable values
 *
 * @param {Object} arguments The string to format
 * @return {String} Formatted string
 */
String.prototype.format = () => {
    let a = this;
    for (let k in arguments)
      a = a.replace("{" + k + "}", arguments[k]);
    return a;
};

/**
 * Changes format of string to normal text
 *
 * @param {String} this The string to fixed capitalization
 * @return {String} Formatted string
 */
String.prototype.normalize = function() {
    let string = this.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Draws 2D text
 *
 * @param {Integer} x The horizontal position
 * @param {Integer} y The vertical position
 * @param {Integer} width The width of element
 * @param {Integer} height The height of element
 * @param {Integer} scale The scale of element
 * @param {String} text The text to display
 * @param {Integer} r Red color value
 * @param {Integer} g Green color value
 * @param {Integer} b Blue color value
 * @param {Integer} a Alpha value
 * @return {null}
 */
function DrawTxt(x, y, width, height, scale, text, r, g, b, a) {
    SetTextFont(0);
    SetTextProportional(0);
    SetTextScale(scale, scale);
    SetTextColour(r, g, b, a);
    SetTextDropShadow(0, 0, 0, 0, 255);
    SetTextEdge(1, 0, 0, 0, 255);
    SetTextDropShadow();
    SetTextOutline();
    SetTextEntry("STRING");
    AddTextComponentString(text);
    DrawText(x - width/2, y - height/2 + 0.005);
}

/**
 * Draws 3D dropoff lines at delivery location
 *
 * @param {Integer} r Red color value
 * @param {Integer} g Green color value
 * @param {Integer} b Blue color value
 * @return {null}
 */
function DrawDropoffLines(r, g, b) {
    DrawMarker(3, job.delivery.x, job.delivery.y, job.delivery.z+3.9, 0.0, 0.0, 0.0, 180.0, 0.0, 0.0, 0.75, 0.75, 0.75, r, g, b, 150, false, true, 2, false, false, false, false); // Chevron
    DrawLine(job.delivery.l1_x, job.delivery.l1_y, job.delivery.l1_z, job.delivery.l2_x, job.delivery.l2_y, job.delivery.l2_z, r, g, b, 150); // Back
    DrawLine(job.delivery.l2_x, job.delivery.l2_y, job.delivery.l2_z, job.delivery.l3_x, job.delivery.l3_y, job.delivery.l3_z, r, g, b, 150); // Left
    DrawLine(job.delivery.l3_x, job.delivery.l3_y, job.delivery.l3_z, job.delivery.l4_x, job.delivery.l4_y, job.delivery.l4_z, r, g, b, 150); // Top
    DrawLine(job.delivery.l4_x, job.delivery.l4_y, job.delivery.l4_z, job.delivery.l1_x, job.delivery.l1_y, job.delivery.l1_z, r, g, b, 150); // Right
    DrawLine(job.delivery.l1_x, job.delivery.l1_y, job.delivery.l1_z, job.delivery.l3_x, job.delivery.l3_y, job.delivery.l3_z, r, g, b, 150); // Cross Left
    DrawLine(job.delivery.l2_x, job.delivery.l2_y, job.delivery.l2_z, job.delivery.l4_x, job.delivery.l4_y, job.delivery.l4_z, r, g, b, 150); // Cross Right
}

/**
 * Draws 2D dropoff status box
 *
 * @return {null}
 */
function DrawDropoffAttemptBox() {
    DrawTxt(0.87, 0.05, 0.068, -1.18, 0.33, message.jobinfo.format(GetDistanceStatus(), GetAngleStatus(), GetTrailerStatus()), 255, 255, 255, 255);
    DrawRect(0.91, 0.715, 0.175, 0.16, 0, 0, 0, 150);
}

/**
 * Redraws dropoff area to green and shows dropoff message
 *
 * @return {null}
 */
function DrawDropoffAcceptBox() {
    DrawDropoffLines(0, 255, 0);
    DrawTxt(0.87, 0.16, 0.068, -1.18, 0.33, message.jobdrop, 255, 255, 255, 255);
}

/**
 * Sends notification popup
 *
 * @param {String} text The message to send
 * @param {Boolean} log If true; logs message to notifications screen
 * @return {null}
 */
function PushMessage(text, log = false) {
    SetNotificationTextEntry('STRING');
    AddTextComponentString(text);
    DrawNotification(false, log);
}

/**
 * Sets players on duty status, updates NUI aswell
 *
 * @param {Boolean} status The status
 * @return {null}
 */
function SetOnDuty(status) {
    onduty = status;
    SendClientMessage("UpdatePlayer", ["onduty", status]);
    if (status) {
        PushMessage(message.onduty);
    } else PushMessage(message.offduty);
}

/**
 * Sets players on job status, updates NUI aswell
 *
 * @param {Boolean} status The status
 * @return {null}
 */
function SetOnJob(status) {
    onjob = status;
    SendClientMessage("UpdatePlayer", ["onjob", status]);
}

/**
 * Resets the degree to a 0-360 number if number passes scope
 *
 * @param {Integer} x The value to reset
 * @return {Integer} The reset value
 */
function SetDegree(x) {
    if (x < 0)
      return x + 360;
    else if (x >= 360)
      return x - 360;
    else
      return x;
}

/**
 * Checks if integer is negative
 *
 * @param {Integer} value The value to check
 * @return {Boolean} True if negative; False if not
 */
function IsNegative(value) {
    return value < 0 ? true : false;
}

/**
 * Starts screen fadein effect
 *
 * @return {null}
 */
function FadeIn() {
    StartScreenEffect('SwitchHUDIn', 0, false);
}

/**
 * Starts screen fadeout effect
 *
 * @return {null}
 */
function FadeOut() {
    StartScreenEffect('SwitchHUDOut', 0, false);
    StopAllScreenEffects();
}

/**
 * Sets current mission stage
 *
 * @param {Integer} stage The stage to set the mission (1-4)
 * @return {null}
 */
function SetMission(stage) {
    mission = stage;
}

/**
 * Finishes the mission by resetting the mission status
 * back to one and settings the player off job
 *
 * @return {null}
 */
function FinishMission() {
    SetMission(1);
    SetOnJob(false);
}

/**
 * Gets current dropoff status, otherwise sets the status
 *
 * @param {Boolean} state The state to set the dropoff
 * @return {Boolean} The current state of the dropoff
 */
function DropoffAvailable(state = null) {
    if(state)
        dropoff = state;
    else return dropoff;
}

/**
 * Gets current weather string for delivery report
 *
 * @return {String} Current weather
 */
function GetWeatherType() {
    weatherType.forEach((weather) => {
        // If previous weather is in the array return it normalized
        if (IsPrevWeatherType(weather)) return weather.normalize();
    });
    // Otherwise return a generic term (accuracy doesn't matter ;)
    return "Neutral";
}

/**
 * Pauses thread to add real time waiting effect
 *
 * @param {Integer} time The amount of milliseconds to wait
 * @return {Promise} After time has been completed
 */
function Pause(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

/**
 * Sends NUI message
 *
 * @param {String} type Command to execute
 * @param {String}/array data Data to update
 * @return {null}
 */
function SendClientMessage(type, data = []) {
    let json = {
        type: type,
        data: data
    };
    SendNuiMessage(JSON.stringify(json));
}

/**
 * Sends chat message
 *
 * @param {String} message The message to send
 * @return {null}
 */
function SendChatMessage(message) {
    emit('chat:addMessage', {
      args: [ message ]
    });
}

/**
 * Loads mobile menu data
 *
 * @return {null}
 */
function LoadMenu() {
    SendClientMessage("UpdateJobs");
}

/**
 * Displays menu and sets screen effects
 *
 * @return {null}
 */
function ShowMenu(status) {
    SendClientMessage("EnableMenu", status);
    SetNuiFocus(status, status);

    if (status) FadeIn();
    else FadeOut();
}

/**
 * Need to complete
 *
 * @return {null}
 */
function preformCheck(value, startingNumber, adjustment, degree = false) {
    let status = null;
    let rangeTop = startingNumber;
    let rangeBottom = rangeTop - 3;
    for (let i=0; i<=5; i++) {
        if(degree) {
            if (i==0) continue;
            if (value[0] >= SetDegree(value[1] - i) && value[0] <= SetDegree(value[1] + i)) status = quality[i];
        } else {
            rangeTop = i==0 ? rangeTop : --rangeBottom;
            rangeBottom = rangeTop - adjustment;
            if (value <= rangeTop && value >= rangeBottom) status = quality[i];
        }
    }
    if (!status)
        return quality[7];
    else
        return status;
}

function GetAngleStatus() {
    if (trailerHeading) {
        let headingInt = Math.floor(trailerHeading);
        let setHeadingInt = Math.floor(job.delivery.h);
        angleStatus = preformCheck([headingInt, setHeadingInt], 0, 0, true);
        return angleStatus;
    } else
        return null;
}

function GetDistanceStatus() {
    if (dropoffDistance) {
        let percentage = Math.round(0.8 / dropoffDistance * 100);
        distanceStatus = preformCheck(percentage, 99, 3);
        return distanceStatus;
    } else
        return null;
}

function GetTrailerStatus() {
    if(trailer) {
        trailerStatus = preformCheck(GetEntityHealth(trailer), 1000, 100);
        return trailerStatus;
    } else
        return null;
}

/**
 * Calcuates the weight bonus
 *
 * @param {Integer} tons The weight of the cargo
 * @return {Integer} The bonus to receive
 */
function CalculateWeight(tons) {
    if (tons <= 0 && tons >= 5)
        return 0.1;
    else if (tons <= 5 && tons >= 9)
        return 0.15;
    else if (tons >= 10)
        return 0.2;
}

/**
 * Determines if the current position of the trailer is acceptable to dropoff
 *
 * @return {null}
 */
function AcceptableDropoff() {
    return ((distanceStatus != quality[6] && distanceStatus != quality[7]) && (angleStatus != quality[6] && angleStatus != quality[7])) ? true : false;
}

/**
 * Creates the delivery report after sucessful dropoff
 *
 * @return {Array} The results of the delivery including payment
 */
function CreateDeliveryReport() {
    let values = [
        distanceStatus, angleStatus, trailerStatus, deliveryTime, 0
    ];
    let report = [
        0, 0, 0, 0, 0
    ];
    let time = (deliveryTime - latestTime) / 60000;
    let timeScore = "";
    let deduct = 0;
    let bonus = 0;

    for (let i in values) {
        switch (i) {
            case "0": case "1": case "2":
                // Distance, Angle, Trailer Conditions
                if(values[i] == quality[0])
                    report[i] = 0.2;
                else if (values[i] == quality[1])
                    report[i] = 0.1;
                else if (values[i] == quality[4] || values[i] == quality[5])
                    report[i] = -0.2;
                break;
            case "3":
                // Delivery Time Efficiency
                if (time <= -2) {
                    report[i] = 0.25;
                    timeScore = timeEfficiency[0];
                } else if (time >= -1 && time <= 1) {
                    timeScore = timeEfficiency[1];
                } else if (time > 1 && time <= 3) {
                    report[i] = -0.1;
                    timeScore = timeEfficiency[2];
                } else if (time > 3) {
                    report[i] = -0.25;
                    timeScore = timeEfficiency[2];
                }
                break;
            case "4":
                // Weather Bonus
                if (IsPrevWeatherType("THUNDER"))
                    report[4] = 0.25;
                else if (IsPrevWeatherType("RAIN"))
                    report[4] = 0.2;
                else if (IsPrevWeatherType("FOGGY"))
                    report[4] = 0.1;
                break;
        }
    }

    // Calculate Report Values
    for (let i in report) {
        let amount = Math.round(total * report[i]);
        report[i] = amount;
        if (IsNegative(report[i]))
            deduct = deduct + amount;
        else bonus = bonus + amount;
    }

    // Get total payout
    total = total + deduct + bonus;

    // Add all data to report
    deliveryReport = [distanceStatus, angleStatus, trailerStatus, timeScore, GetWeatherType(), ...report, subtotal, deduct, bonus, total];
    return deliveryReport;
}

/**
 * Sends payment to player
 *
 * @param {Integer} payout The amount to send
 * @return {null}
 */
function SendPaycheck(payout) {
    let balance = StatGetInt('MP0_WALLET_BALANCE', 0, -1);
    let addPaycheck = balance[1] + Math.round(payout);
    StatSetInt('MP0_WALLET_BALANCE', addPaycheck, 1);
}
