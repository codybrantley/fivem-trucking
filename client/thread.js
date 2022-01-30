"use strict";

// Add blips to map
blips.forEach((item) => {
    item.blip = AddBlipForCoord(item.x, item.y, item.z);
    SetBlipSprite(item.blip, 479);
    BeginTextCommandSetBlipName("STRING");
    AddTextComponentString(resource);
    EndTextCommandSetBlipName(item.blip);
});

// Preload vehicle models
vehicles.forEach((model) => {
    RequestModel(model);
});

// Thread
setTick(async () => {
    let playerCoords = GetEntityCoords(player, 1);
    let playerHeading = GetEntityHeading(player);

    // Start Job [G]
    if (IsControlJustPressed(1, 47)) {
        // Checks if player is near a job location
        blips.forEach((item) => {
            let distance = GetDistanceBetweenCoords(playerCoords[0], playerCoords[1], playerCoords[2], item.x, item.y, item.z);
            // Start job if close enough
            if (distance < 3)
                SetOnDuty(true);
        });
    }

    // Mobile Menu [M]
    if (IsControlJustPressed(1, 244))
        LoadMenu();

    // Dropoff Trailer [L]
    if (IsControlJustPressed(1, 7)) {
        if (DropoffAvailable()) {
            DetachVehicleFromTrailer(truck);
            FreezeEntityPosition(trailer);
            SetVehicleAutomaticallyAttaches(trailer, false, false);
            SetMission(3);
            DropoffAvailable(false);
        }
    }

    // Delete -- ~
    if (IsControlJustPressed(1, 243)) {
        DeleteEntity(trailer);
        DeleteEntity(truck);
        ResetMission();
    }

    // Spawn Trailer -- ]
    if (IsControlJustPressed(1, 197)) {
        truck = CreateVehicle(0x21EEE87D, playerCoords[0], playerCoords[1], playerCoords[2], playerHeading, true, false);
        TaskWarpPedIntoVehicle(player, truck, -1);
        await Pause(3000);
        AttachVehicleToTrailer(truck, trailer);
    }

    // Job Process
    if (onjob) {
        let currentVehicle = GetVehiclePedIsUsing(player);
        let truckCoords = GetEntityCoords(truck);
        let trailerCoords = GetEntityCoords(trailer);
        trailerHeading = GetEntityHeading(trailer);
        switch (mission) {
            // Pickup
            case 1:
                let attachDistance = GetDistanceBetweenCoords(truckCoords[0], truckCoords[1], truckCoords[2], trailerCoords[0], trailerCoords[1], trailerCoords[2], true);
                /* Checks to make sure the vehicle the player is using is the truck spawned,
                   and the trailer spawned is attached and close enough */
                if (IsVehicleAttachedToTrailer(currentVehicle) && currentVehicle == truck && attachDistance <= 10) {
                    // Starts timer
                    startTime = GetGameTimer();
                    latestTime = startTime + (deliveryDistance * timePerMile) + timeBonus; // Delivery expected based on time per mile plus bonus time
                    PushMessage(message.jobdeli);
                    SetNewWaypoint(job.delivery.x, job.delivery.y);
                    SetMission(2);
                }
                break;
            // Delivery
            case 2:
                dropoffDistance = GetDistanceBetweenCoords(trailerCoords[0], trailerCoords[1], trailerCoords[2], job.delivery.x, job.delivery.y, job.delivery.z, false);
                DrawDropoffLines(255, 255, 0);
                // Attempt Dropoff
                if (dropoffDistance <= 15) {
                    DrawDropoffAttemptBox();
                    if (AcceptableDropoff()) {
                        DrawDropoffAcceptBox();
                        DropoffAvailable(true);
                    } else
                        DropoffAvailable(false);
                }
                break;
            // Dropoff
            case 3:
                CreateDeliveryReport();
                let unload = PushMessage(message.jobunload);
                await Pause(5000);
                RemoveNotification(unload);
                DeleteEntity(trailer);
                SetMission(4);
                break;
            // Delivered
            case 4:
                emit("LogDelivery", deliveryReport);
                PushMessage(message.jobdone.format(total), true);
                SendPaycheck(total);
                FinishMission();
                break;
        }
    }
});
