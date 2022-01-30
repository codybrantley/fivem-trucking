"use strict";

// Register Net Events
RegisterNetEvent("SetIdentifier");
RegisterNetEvent("UpdatePlayer");
RegisterNetEvent("StartWork");
RegisterNetEvent("StopWork");
RegisterNetEvent("StartJob");
RegisterNetEvent("SetupJob");
RegisterNetEvent("LogDelivery");

/**
 * Gets player identifier when resource starts
 *
 * @param {String} resource The resource started
 */
on("onClientResourceStart", (resource) => {
    if (resource == "trucking")
        emitNet("getIdentifier", playerServerId);
});

/**
 * Update player data on NUI
 *
 * @param {Array} args The data to update
 */
on("UpdatePlayer", (args) => {
    SendClientMessage("UpdatePlayer", args);
});

/**
 * Set local identifier with identifier from server
 *
 * @param {String} identifier The player identifier
 */
on("SetIdentifier", (identifier) => {
    playerIdentifier = identifier;
});

/**
 * Put player on duty and spawns their truck
 */
on("StartWork", () => {
    SetOnDuty(true);
    truck = CreateVehicle(0x21EEE87D, 363.884, 3411.5, 36.3248, 21.29, true, false);
});

/**
 * Puts player off duty and deletes mission vehicles
 */
on("StopWork", () => {
    SetOnDuty(false);
    DeleteEntity(truck);
    DeleteEntity(trailer);
});

/**
 * Sends message of job status
 */
on("StartJob", () => {
    if (job) {
        ShowMenu(false);
        PushMessage(message.jobstart.format(job.type));
        emit("SetupJob");
    } else
        PushMessage(message.jobunavail);
});

/**
 * Sets up job variables based on selected job
 */
on("SetupJob", () => {
    deliveryDistance = job.distance;
    total, subtotal = job.payout;
    trailer = CreateVehicle(vehicles[job.pickup.t], job.pickup.x, job.pickup.y, job.pickup.z, job.pickup.h, true, false);
    SetVehicleLivery(trailer, job.pickup.l);
    SetVehicleOnGroundProperly(trailer);
    SetNewWaypoint(job.pickup.x, job.pickup.y);
    SetOnJob(true);
});

/**
 * Logs the delivery after sucessful dropoff
 */
on("LogDelivery", () => {
    let delivery = {
        type: job.type,
        destination_to: job.destination_to,
        destination_from: job.destination_from,
        report: deliveryReport,
        date: {
			day: GetClockDayOfWeek(),
			hours: GetClockHours(),
			minutes: GetClockMinutes()
		}
    };
    SendClientMessage("LogDelivery", delivery);
});

// Register NUI Callbacks
RegisterNuiCallbackType("GetIdentifier");
RegisterNuiCallbackType("UpdateJobs");
RegisterNuiCallbackType("StartJob");
RegisterNuiCallbackType("CloseMenu");

/**
 * Gets the local identifier and updates NUI
 *
 * @return {String} The player identifier
 */
on("__cfx_nui:GetIdentifier", (data, cb) => {
    cb(playerIdentifier);
});

/**
 * Updates job data with game information. Runs every time the mobile menu
 * is opened to get latest position details for sorting
 *
 * @param {Array} jobs All jobs
 * @return {Array} The updated jobs
 */
on("__cfx_nui:UpdateJobs", (jobs, cb) => {
    let coords = GetEntityCoords(player, 1);
    jobs.forEach((job) => {
        job.distance = GetDistanceBetweenCoords(job.pickup.x, job.pickup.y, job.pickup.z, coords[0], coords[1], coords[2], true);
        job.milesAway = Math.round(job.distance / 1760);
        job.milesTravel = Math.round(GetDistanceBetweenCoords(job.pickup.x, job.pickup.y, job.pickup.z, job.delivery.x, job.delivery.y, job.delivery.z, 1) / 1760);
        job.payout = job.milesTravel * (basepay + (CalculateWeight(job.pickup.w) * basepay));
    });
    cb(jobs);
    ShowMenu(true);
});

/**
 * Updates job data with game information
 *
 * @param {Array} job Selected job
 */
on("__cfx_nui:StartJob", (job) => {
    if (onduty) {
        job = job;
        emit("StartJob");
    } else
        PushMessage(message.notonduty);
});

/**
 * Closes the NUI menu
 */
on("__cfx_nui:CloseMenu", () => {
    ShowMenu(false);
});
