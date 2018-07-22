local playerPed
local playerCoords
local playerHeading
local truck
local trailer
local trailerCoords
local trailerHealth
local pickup
local delivery
local mission = 1
local dropoff = false
local status = {
	"Perfect", "Ideal", "Acceptable", "Fair", "Tolerable", "Poor", "Destroyed", "---"
}
local vehicles = {
	0x21EEE87D, -- Packer
	0x6A59902D, -- Boat
	0x7CAB34D0, -- Car Carrier
	0xA1DA3C91, -- Commercial
	0xCBB2BE0E, -- Container
	0x9E6B14D6, -- Drill
	0x782A236D, -- Logging
	0xD46F4737  -- Tanker
}

function round(x)
  	return x>=0 and math.floor(x+0.5) or math.ceil(x-0.5)
end

function getAngleStatus(heading, setHeading)
	fHeading = math.floor(heading)
    fSetHeading = math.floor(setHeading)
	if (fHeading >= fSetHeading - 1 and fHeading <= fSetHeading + 1) then
		return status[1]
	elseif (fHeading >= fSetHeading - 2 and fHeading <= fSetHeading + 2) then
		return status[2]
	elseif (fHeading >= fSetHeading - 3 and fHeading <= fSetHeading + 3) then
		return status[3]
	elseif (fHeading >= fSetHeading - 4 and fHeading <= fSetHeading + 4) then
		return status[4]
	elseif (fHeading >= fSetHeading - 5 and fHeading <= fSetHeading + 5) then
		return status[5]
	elseif (fHeading >= fSetHeading - 6 and fHeading <= fSetHeading + 6) then
		return status[6]
	else
		return status[8]
	end
end

function getDistanceStatus(distance)
	num = round(0.8 / distance * 100)
	if (num >= 100) then
		return status[1]
	elseif (num <= 99 and num >= 89) then
		return status[2]
	elseif (num <= 88 and num >= 79) then
		return status[3]
	elseif (num <= 78 and num >= 69) then
		return status[4]
	elseif (num <= 68 and num >= 59) then
		return status[5]
	elseif (num <= 58 and num >= 50) then
		return status[6]
	else
		return status[8]
	end
end

function getTrailerStatus(hp)
	if (hp == 1000) then
		return status[1]
	elseif (hp <= 999 and hp >= 899) then
		return status[2]
	elseif (hp <= 898 and hp >= 799) then
		return status[3]
	elseif (hp <= 798 and hp >= 699) then
		return status[4]
	elseif (hp <= 698 and hp >= 599) then
		return status[5]
	elseif (hp <= 598 and hp >= 1) then
		return status[6]
	elseif (hp == 0 or not hp) then
		return status[7]
	end
end

function acceptDistance(status)
	if (status == "Perfect" or status == "Ideal" or status == "Acceptable") then
		return true
	end
end

function acceptAngle(status)
	if (status == "Perfect" or status == "Ideal") then
		return true
	end
end

function drawDropoffLines(r, g, b)
	DrawMarker(3, delivery.x, delivery.y, delivery.z+3.7, 0.0, 0.0, 0.0, 180.0, 0.0, 0.0, 0.75, 0.75, 0.75, r, g, b, 150, false, true, 2, false, false, false, false) -- Chevron
    DrawLine(delivery.l1.x, delivery.l1.y, delivery.l1.z, delivery.l2.x, delivery.l2.y, delivery.l2.z, r, g, b, 150) -- Back
    DrawLine(delivery.l2.x, delivery.l2.y, delivery.l2.z, delivery.l3.x, delivery.l3.y, delivery.l3.z, r, g, b, 150) -- Left
    DrawLine(delivery.l3.x, delivery.l3.y, delivery.l3.z, delivery.l4.x, delivery.l4.y, delivery.l4.z, r, g, b, 150) -- Top
    DrawLine(delivery.l4.x, delivery.l4.y, delivery.l4.z, delivery.l1.x, delivery.l1.y, delivery.l1.z, r, g, b, 150) -- Right
    DrawLine(delivery.l1.x, delivery.l1.y, delivery.l1.z, delivery.l3.x, delivery.l3.y, delivery.l3.z, r, g, b, 150) -- Cross Left
    DrawLine(delivery.l2.x, delivery.l2.y, delivery.l2.z, delivery.l4.x, delivery.l4.y, delivery.l4.z, r, g, b, 150) -- Cross Right
end

Citizen.CreateThread(function()
	while true do
	   Wait(0)
	   tick()
	end
end)

function tick()
	-- Pickup
	if (mission == 1) then
		local veh = GetVehiclePedIsUsing(playerPed)
		if IsVehicleAttachedToTrailer(veh) then
			Notify(message.jobdeli)
			SetNewWaypoint(delivery.x, delivery.y)
			mission = 2
			TriggerEvent("chatMessage", "", { 0, 0, 0 }, "Attached trailer")
		end
	end
	-- Delivery
	if (mission == 2) then
		trailerCoords = GetEntityCoords(trailer)
		trailerHeading = GetEntityHeading(trailer)
		trailerHealth = getTrailerStatus(GetEntityHealth(trailer))
		distance = GetDistanceBetweenCoords(trailerCoords, delivery.x, delivery.y, delivery.z, true)
		drawDropoffLines(255, 255, 0)
		if (distance < 15) then
			local distanceStatus = getDistanceStatus(distance)
			local angleStatus = getAngleStatus(trailerHeading, delivery.h)
			local str = string.format(message.jobinfo, distanceStatus, angleStatus, trailerHealth)
			drawTxt(0.87, 0.05, 0.068, -1.18, 0.33, str, 255, 255, 255, 255)
			DrawRect(0.91, 0.715, 0.175, 0.16, 0, 0, 0, 150)
			if (acceptDistance(distanceStatus) and acceptAngle(angleStatus)) then
				drawDropoffLines(0, 255, 0)
				drawTxt(0.87, 0.16, 0.068, -1.18, 0.33, "Press ~y~L~w~ to dropoff trailer", 255, 255, 255, 255)
				dropoff = true
			else
				dropoff = false
			end
		end
	end
	-- Dropoff
	if (mission == 3) then
    	Notify(message.jobunload)
    	Wait(11000)
    	DeleteEntity(trailer)
    	mission = 4
    end
    -- Delivered
    if (mission == 4) then
    	local str = string.format(message.jobdone, 3246)
    	Notify(str)
    end
end

Citizen.CreateThread(function()

	RequestModel(0x21EEE87D)
	RequestModel(0x6A59902D)
	RequestModel(0x1F3D44B5)
	RequestModel(0x7CAB34D0)
	RequestModel(0xA1DA3C91)
	RequestModel(0xCBB2BE0E)
	RequestModel(0x9E6B14D6)
	RequestModel(0x782A236D)
	RequestModel(0xD46F4737)

	-- Wait to continue until all models are loaded
	while not (HasModelLoaded(0x21EEE87D) and HasModelLoaded(0x6A59902D) and HasModelLoaded(0x1F3D44B5) and HasModelLoaded(0x7CAB34D0) and HasModelLoaded(0xA1DA3C91) and HasModelLoaded(0xCBB2BE0E) and HasModelLoaded(0x9E6B14D6) and HasModelLoaded(0x782A236D) and HasModelLoaded(0xD46F4737)) do
		Wait(1)
	end

	while true do
		Wait(0)

		playerPed = GetPlayerPed(-1)
		playerCoords = GetEntityCoords(playerPed, 0)
		playerHeading = GetEntityHeading(playerPed)

		if IsControlJustPressed(1, 243) then -- ~
			DeleteEntity(trailer)
			DeleteEntity(truck)
			mission = 1
		end

		if IsControlJustPressed(1, 39) then -- [
			--
			--trailer = CreateVehicle(0xCBB2BE0E, pickupPoints.market.x, pickupPoints.market.y, pickupPoints.market.z, pickupPoints.market.h, true, false)
			
		end

		if IsControlJustPressed(1, 7) then -- L
			if dropoff then
				DetachVehicleFromTrailer(truck)
				FreezeEntityPosition(trailer)
				mission = 3
				dropoff = false
			end
		end

		if IsControlJustPressed(1, 197) then -- ]
			truck = CreateVehicle(0x21EEE87D, playerCoords.x, playerCoords.y, playerCoords.z, playerHeading + 90, true, false)
			TaskWarpPedIntoVehicle(playerPed, truck, -1)
			AttachVehicleToTrailer(truck, trailer)
		end
	end

end)

RegisterNetEvent("startTrucking")
AddEventHandler("startTrucking", function(key, value)
	truck = CreateVehicle(0x21EEE87D, 363.884, 3411.5, 36.3248, 21.29, true, false)
end)

RegisterNetEvent("startJob")
AddEventHandler("startJob", function(pickupInfo, deliveryInfo)
	pickup = pickupInfo
	delivery = deliveryInfo
	trailer = CreateVehicle(vehicles[pickup.t], pickup.x, pickup.y, pickup.z, pickup.h, true, false)
	SetVehicleLivery(trailer, pickup.l)
	SetVehicleOnGroundProperly(trailer)
	SetNewWaypoint(pickup.x, pickup.y)
end)

RegisterNetEvent("stopTrucking")
AddEventHandler("stopTrucking", function(key, value)
	DeleteEntity(truck)
	DeleteEntity(trailer)
end)