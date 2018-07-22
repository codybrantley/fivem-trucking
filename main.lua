onduty = true
guiEnabled = false

-- Blips
local blips = {
    {id=318, name="Trucking", x=346.79, y=3405.46, z=36.85}
}

pickupPoints = {
	{loc="PostOP storage, unit D5", x=1190.601, y=-3333.389, z=5.63, h=180.65, t=4, l=3}
}

deliveryPoints = {
	{x=2673.49, y=3517.10, z=54.54, h=337.22, l1={x=2670.44, y=3514.035, z=51.78}, l2={x=2673.50, y=3512.73, z=51.78}, l3={x=2676.617, y=3520.365, z=51.78}, l4={x=2673.55, y=3521.71, z=51.78}, t=1},
	{x=587.91, y=2791.616, z=43.96, h=4.2, l1={x=586.54, y=2785.7, z=41.2}, l2={x=590.06, y=2785.92, z=41.2}, l3={x=589.63, y=2793.76, z=41.2}, l4={x=586.31, y=2793.54, z=41.2}, t=3},
	{x=-592.377, y=5357.28, z=70.47, h=162.13, t=5},
	{x=1302.72, y=4305.66, z=37.252, h=303.75, t=2},
	{x=938.7413, y=-1244.577, z=27.44, h=33.36, l1={x=940.47, y=-1249.91, z=24.7}, l2={x=943.03, y=-1248.14, z=24.7}, l3={x=938.98, y=-1241.79, z=24.7}, l4={x=936.15, y=-1243.69, z=24.7}, t=3}, -- La Mesa Self-Storage 
	{x=873.8079, y=-2194.765, z=32.31, h=355.55, l1={x=871.90, y=-2199.9, z=29.55}, l2={x=875.12, y=-2200.14, z=29.55}, l3={x=875.65, y=-2192.75, z=29.55}, l4={x=872.35, y=-2192.45, z=29.55}, t=3}, -- Dry Dock Facility
	{x=1726.707, y=4793.88, z=43.61, h=56.6, l1={x=1729.818, y=4789.85, z=40.93}, l2={x=1731.897, y=4792.941, z=40.84}, l3={x=1724.093, y=4797.619, z=40.84}, l4={x=1722.084, y=4794.811, z=40.93}, t=2} -- Grapeseed Supermarket
}

message = {
	onduty="You are now on duty. Check your ~y~Trucker Menu~w~ for delivery jobs.",
	offduty="You are now off duty, and will no longer receive alerts.",
	auctionavail="A new ~r~uShip Auction~w~ is available, check your ~y~Trucker Menu~w~ to join.",
	jobinfo="~y~Attempting Dropoff~n~~w~Distance: %s~n~Angle: %s~n~Trailer Condition: %s",
	jobstart="Your trailer is located at ~y~%s~w~. GPS location set.",
	jobdeli="Trailer picked up. Dropoff location set on GPS.",
	jobunload="Evaluating performance and unloading cargo...",
	jobdone="Delivery completed. You received ~g~$%d~w~, check your ~y~handheld~w~ for a full delivery report.",
	jobunavail="This job is currently not available.",
	notonduty="You must be on duty before you can take any jobs."
}

function drawTxt(x, y, width, height, scale, text, r, g, b, a)
    SetTextFont(0)
    SetTextProportional(0)
    SetTextScale(scale, scale)
    SetTextColour(r, g, b, a)
    SetTextDropShadow(0, 0, 0, 0,255)
    SetTextEdge(1, 0, 0, 0, 255)
    SetTextDropShadow()
    SetTextOutline()
    SetTextEntry("STRING")
    AddTextComponentString(text)
    DrawText(x - width/2, y - height/2 + 0.005)
end

function DrawMissionText(m_text, showtime)
    ClearPrints()
	SetTextEntry_2("STRING")
	AddTextComponentString(m_text)
	DrawSubtitleTimed(showtime, 1)
end

function Notify(text)
	SetNotificationTextEntry('STRING')
	AddTextComponentString(text)
	DrawNotification(false, false)
end

function EnableGui(enable)
	SetNuiFocus(enable)
    guiEnabled = enable

    SendNUIMessage({
        type = "enableui",
        enable = enable
    })
end

Citizen.CreateThread(function()
	-- Load blips
	for _, item in pairs(blips) do
	    item.blip = AddBlipForCoord(item.x, item.y, item.z)
	    SetBlipSprite(item.blip, item.id)
			BeginTextCommandSetBlipName("STRING")
	  	AddTextComponentString(item.name)
	  	EndTextCommandSetBlipName(item.blip)
	end

	-- Watch keypress
	while true do
        Wait(0)

		if IsControlJustPressed(1, 249) then
			coords = GetEntityCoords(GetPlayerPed(-1))
			for _, item in pairs(blips) do
				distance = GetDistanceBetweenCoords(coords, item.x, item.y, item.z)
				if (distance < 0.8) then
					if (item.name == "Trucking") then
						TriggerEvent('startTrucking')
						onduty = true
						Notify(message.onduty)
					end
				end
			end
		end

        if IsControlJustPressed(1, 244) then
        	if guiEnabled then
	            EnableGui(false)
	        else
	        	EnableGui(true)
	        end
        end

        if guiEnabled then
            DisableControlAction(0, 1, guiEnabled) -- LookLeftRight
            DisableControlAction(0, 2, guiEnabled) -- LookUpDown
            DisableControlAction(0, 142, guiEnabled) -- MeleeAttackAlternate
            DisableControlAction(0, 106, guiEnabled) -- VehicleMouseControlOverride

            if IsDisabledControlJustReleased(0, 24) or IsDisabledControlJustReleased(0, 142) then -- MeleeAttackAlternate
                SendNUIMessage({
                    type = "click"
                })
            end
        end
	end
end)

-- SERVER

RegisterNetEvent("trucking:getjobs")
AddEventHandler("trucking:getjobs", function()
	TriggerServerEvent("trucking:getjobs")
end)

RegisterNetEvent("trucking:updatejobs")
AddEventHandler("trucking:updatejobs", function(source, data)
	SendNUIMessage({
		type = "updatejobs",
		jobs = data
	})
end)

-- NUI

RegisterNUICallback('updatejobs', function(data, cb)
    TriggerEvent("trucking:getjobs")

    cb('ok')
end)

RegisterNUICallback('escape', function(data, cb)
    EnableGui(false)

    cb('ok')
end)

RegisterNUICallback('job', function(data, cb)
	if onduty then
		local job = pickupPoints[data]
		if job then
			local str = string.format(message.jobstart, job.loc)
	   		Notify(str)
	  		local jobpoint = deliveryPoints[data]
	   		TriggerClientEvent("startJob", job, jobpoint)
	   		EnableGui(false)
	   	else
	   		Notify(message.jobunavail)
	   	end
   	else
   		Notify(message.notonduty)
   	end

    cb('ok')
end)