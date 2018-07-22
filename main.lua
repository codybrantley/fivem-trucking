-- Global
player            = GetPlayerPed(-1)
playerServerId    = GetPlayerServerId()
onduty            = true
onjob             = false
guiEnabled        = false
truck             = nil
basepay           = 700
jobDistances      = {}
showLines         = false

-- Blips
blips = {
    {id=318, name="Trucking", x=346.79, y=3405.46, z=36.85}
}

-- Trailers
vehicles = {
	0x21EEE87D, -- Packer
	0x6A59902D, -- Boat
	0x7CAB34D0, -- Car Carrier
	0xA1DA3C91, -- Commercial
	0xCBB2BE0E, -- Container
	0x9E6B14D6, -- Drill
	0x782A236D, -- Logging
	0xD46F4737  -- Tanker
}

-- Job
job               = nil
trailer           = nil
mission           = 1
dropoff           = false
status = {
	"Perfect", "Ideal", "Acceptable", "Fair", "Tolerable", "Poor", "Destroyed", "---"
}
distanceStatus    = 8
angleStatus       = 8
payout            = 0
originalPayout    = 0
distanceDeduction = 0
angleDeduction    = 0
trailerDeduction  = 0
timeDeduction     = 0
timeBonus         = 0
weatherBonus      = 0
time              = 0
startTime         = 0
latestTime        = 0
deliveryTime      = 0
deliveryReport    = {}

pickupPoints = {
	{loc="PostOP Storage, Unit D5", x=1190.601, y=-3333.389, z=5.63, h=180.65, t=4, l=3, w=18543},
    {loc="Food Production, Loading Dock", x=951.7336, y=-2106.869, z=30.07, h=91.07, t=4, l=1, w=13831},
    {loc="Grapeseed Tree Farm", x=2552.92, y=4675.199, z=33.89, h=10.74, t=7, l=1, w=15249},
    {loc="Some place", x=1302.72, y=4305.66, z=37.252, h=303.75, t=2, l=1, w=12432}
}

deliveryPoints = {
	{x=2673.49, y=3517.10, z=54.54, h=337.22, l1={x=2670.44, y=3514.035, z=51.78}, l2={x=2673.50, y=3512.73, z=51.78}, l3={x=2676.617, y=3520.365, z=51.78}, l4={x=2673.55, y=3521.71, z=51.78}, t=1}, -- Grand Senora YouTool
    {x=1726.707, y=4793.88, z=43.61, h=56.6, l1={x=1729.818, y=4789.85, z=40.93}, l2={x=1731.897, y=4792.941, z=40.84}, l3={x=1724.093, y=4797.619, z=40.84}, l4={x=1722.084, y=4794.811, z=40.93}, t=2}, -- Grapeseed Supermarket
    {x=-591.103, y=5363.464, z=70.29, h=164.5, l1={x=-588.0181, y=5368.581, z=69.7}, l2={x=-591.173, y=5369.562, z=69.8}, l3={x=-594.56, y=5358.035, z=69.5}, l4={x=-591.13, y=5357.05, z=69.5}, t=5}, -- Paleto Lumber Mill
	{x=587.91, y=2791.616, z=43.96, h=4.2, l1={x=586.54, y=2785.7, z=41.2}, l2={x=590.06, y=2785.92, z=41.2}, l3={x=589.63, y=2793.76, z=41.2}, l4={x=586.31, y=2793.54, z=41.2}, t=3}, -- Harmony Dollar Pills
	{x=938.7413, y=-1244.577, z=27.44, h=33.36, l1={x=940.47, y=-1249.91, z=24.7}, l2={x=943.03, y=-1248.14, z=24.7}, l3={x=938.98, y=-1241.79, z=24.7}, l4={x=936.15, y=-1243.69, z=24.7}, t=3}, -- La Mesa Self-Storage
	{x=873.8079, y=-2194.765, z=32.31, h=355.55, l1={x=871.90, y=-2199.9, z=29.55}, l2={x=875.12, y=-2200.14, z=29.55}, l3={x=875.65, y=-2192.75, z=29.55}, l4={x=872.35, y=-2192.45, z=29.55}, t=3} -- Dry Dock Facility
}

message = {
	onduty = "You are now on duty. Check your ~y~Freight Mobile~w~ for delivery jobs.",
	offduty = "You are now off duty, and will no longer receive alerts.",
	auctionavail = "A new ~r~uShip Auction~w~ is available, check your ~y~Trucker Menu~w~ to join.",
	jobinfo = "~y~Attempting Dropoff~n~~w~Distance: %s~n~Angle: %s~n~Trailer Condition: %s",
	jobstart = "Your trailer is located at ~y~%s~w~. GPS location set.",
	jobdeli = "Trailer picked up. Dropoff location set on GPS.",
	jobunload = "Evaluating performance and unloading cargo...",
	jobdone = "Delivery completed. You received ~g~$%d~w~, check your ~y~handheld~w~ for a full delivery report.",
	jobunavail = "This job is currently not available.",
	notonduty = "You must be on duty before you can take any jobs."
}

function DrawTxt(x, y, width, height, scale, text, r, g, b, a)
    SetTextFont(0)
    SetTextProportional(0)
    SetTextScale(scale, scale)
    SetTextColour(r, g, b, a)
    SetTextDropShadow(0, 0, 0, 0, 255)
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

function round(x)
  	return x>=0 and math.floor(x+0.5) or math.ceil(x-0.5)
end

function setdeg(x)
	if (x < 0) then
		return x + 360
	elseif (x >= 360) then
		return x - 360
	else
	    return x
	end
end

function getAngleStatus(heading, setHeading)
	fHeading = math.floor(heading)
    fSetHeading = math.floor(setHeading)
	if (fHeading >= setdeg(fSetHeading - 1) and fHeading <= setdeg(fSetHeading + 1)) then
		return status[1]
	elseif (fHeading >= setdeg(fSetHeading - 2) and fHeading <= setdeg(fSetHeading + 2)) then
		return status[2]
	elseif (fHeading >= setdeg(fSetHeading - 3) and fHeading <= setdeg(fSetHeading + 3)) then
		return status[3]
	elseif (fHeading >= setdeg(fSetHeading - 4) and fHeading <= setdeg(fSetHeading + 4)) then
		return status[4]
	elseif (fHeading >= setdeg(fSetHeading - 5) and fHeading <= setdeg(fSetHeading + 5)) then
		return status[5]
	elseif (fHeading >= setdeg(fSetHeading - 6) and fHeading <= setdeg(fSetHeading + 6)) then
		return status[6]
	else
		return status[8]
	end
end

function getDistanceStatus(distance)
	num = round(0.8 / distance * 100)
	if (num >= 100) then
		return status[1]
	elseif (num <= 99 and num >= 97) then
		return status[2]
	elseif (num <= 96 and num >= 79) then
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

function acceptStatus(status)
	if (status ~= "---" and "Destroyed") then
		return true
	end
end

function adjustPayout(ds, as, ts, dt)
	-- Deductions
	if (ds == "Ideal" or ds == "Acceptable") then
		dp = 0.05
	elseif (ds == "Fair" or ds == "Tolerable") then
		dp = 0.1
	elseif (ds == "Tolerable" or ds == "Poor") then
		dp = 0.2
	else
		dp = 0
	end
	if (as == "Ideal" or as == "Acceptable") then
		ap = 0.1
	elseif (as == "Fair" or as == "Tolerable") then
		ap = 0.15
	elseif (as == "Tolerable" or as == "Poor") then
		ap = 0.25
	else
		ap = 0
	end
	if (ts == "Ideal" or ts == "Acceptable") then
		tp = 0.02
	elseif (ts == "Fair" or ts == "Tolerable") then
		tp = 0.05
	elseif (ts == "Tolerable" or ts == "Poor") then
		tp = 0.25
	else
		tp = 0
	end
	if (dt > latestTime) then
		dlp = 0.25
	else
		dlp = 0
	end
	distanceDeduction = round(payout * dp)
	angleDeduction = round(payout * ap)
	trailerDeduction = round(payout * tp)
	timeDeduction = round(payout * dlp)
	deduct = distanceDeduction + angleDeduction + trailerDeduction + timeDeduction
	payout = payout - deduct
	-- Bonuses
	dm = (dt - startTime) / 60000
	if (dm < 1) then
		bp = 0.3
	elseif (dm > 1 and dm <= 3) then
		bp = 0.15
	elseif (dm > 3 and dm <= 5) then
		bp = 0.1
	else
		bp = 0
	end
	if (IsPrevWeatherType("RAIN")) then
		wp = 0.2
	elseif (IsPrevWeatherType("THUNDER")) then
		wp = 0.25
	elseif (IsPrevWeatherType("FOGGY")) then
		wp = 0.1
	else
		wp = 0
	end
	timeBonus = round(payout * bp)
	weatherBonus = round(payout * wp)
	bonus = timeBonus + weatherBonus
	payout = payout + bonus
end

function drawDropoffLines(r, g, b)
	DrawMarker(3, job.delivery_x, job.delivery_y, job.delivery_z+3.9, 0.0, 0.0, 0.0, 180.0, 0.0, 0.0, 0.75, 0.75, 0.75, r, g, b, 150, false, true, 2, false, false, false, false) -- Chevron
    DrawLine(job.delivery_l1_x, job.delivery_l1_y, job.delivery_l1_z, job.delivery_l2_x, job.delivery_l2_y, job.delivery_l2_z, r, g, b, 150) -- Back
    DrawLine(job.delivery_l2_x, job.delivery_l2_y, job.delivery_l2_z, job.delivery_l3_x, job.delivery_l3_y, job.delivery_l3_z, r, g, b, 150) -- Left
    DrawLine(job.delivery_l3_x, job.delivery_l3_y, job.delivery_l3_z, job.delivery_l4_x, job.delivery_l4_y, job.delivery_l4_z, r, g, b, 150) -- Top
    DrawLine(job.delivery_l4_x, job.delivery_l4_y, job.delivery_l4_z, job.delivery_l1_x, job.delivery_l1_y, job.delivery_l1_z, r, g, b, 150) -- Right
    DrawLine(job.delivery_l1_x, job.delivery_l1_y, job.delivery_l1_z, job.delivery_l3_x, job.delivery_l3_y, job.delivery_l3_z, r, g, b, 150) -- Cross Left
    DrawLine(job.delivery_l2_x, job.delivery_l2_y, job.delivery_l2_z, job.delivery_l4_x, job.delivery_l4_y, job.delivery_l4_z, r, g, b, 150) -- Cross Right
end

function calculateWeight(wt)
	if (wt <= 0 and wt >= 10000) then
		return 0.1
	elseif (wt <= 10001 and wt >= 15000) then
		return 0.15
	elseif (wt <= 15001 and wt >= 20000) then
		return 0.2
	elseif (wt <= 20001 and wt <= 25000) then
		return 0.25
	end
end

function EnableMenu(enable, data)
    SetNuiFocus(enable, enable)
    guiEnabled = enable

    if(enable) then
        StartScreenEffect('SwitchHUDIn', 0, false)
    else
        StartScreenEffect('SwitchHUDOut', 0, false)
        StopAllScreenEffects()
    end

    SendNUIMessage({
        type = "enableui",
        enable = enable,
        jobs = data
    })
end

function EnableGui(enable)
    if enable then
        TriggerEvent("trucking:getjobs")
    else
        SetNuiFocus(false)
        guiEnabled = false
    end
end

Citizen.CreateThread(function()
	-- Load blip
	for _, item in pairs(blips) do
	    item.blip = AddBlipForCoord(item.x, item.y, item.z)
	    SetBlipSprite(item.blip, item.id)
		BeginTextCommandSetBlipName("STRING")
	  	AddTextComponentString(item.name)
	  	EndTextCommandSetBlipName(item.blip)
	end

    SetNuiFocus(false)

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

	-- Watch keypress
	while true do
        Wait(0)

        playerCoords = GetEntityCoords(player, 0)
		playerHeading = GetEntityHeading(player)

        -- Start Job [G]
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

        -- Mobile Menu [M]
        if IsControlJustPressed(1, 244) then
        	if guiEnabled then
	            EnableGui(false)
	        else
	        	EnableGui(true)
	        end
        end

        -- Dropoff Trailer [L]
		if IsControlJustPressed(1, 7) then
			if dropoff then
				DetachVehicleFromTrailer(truck)
				FreezeEntityPosition(trailer)
                SetVehicleAutomaticallyAttaches(trailer, false, false)
				mission = 3
				dropoff = false
			end
		end

        --------------------------------

        -- DEBUGGING

        --------------------------------

        function drawLine()
			if(showLines) then
				drawDropoffLines(255, 255, 0)
			end
		end

		drawLine()

        if IsControlJustPressed(1, 243) then -- ~
			DeleteEntity(trailer)
			DeleteEntity(truck)
			mission = 1
		end

		if IsControlJustPressed(1, 81) then -- ,
            local check = GetVehicleAttachedToEntity(truck)
            if(check == trailer) then
                TriggerEvent("chatMessage", "", { 255, 255, 255 }, "yep")
            else
                TriggerEvent("chatMessage", "", { 255, 255, 255 }, "nope")
            end
            --showLines = false
		end

		if IsControlJustPressed(1, 39) then -- [
			showLines = true
			pc = playerCoords
			ph = playerHeading
			gl = pc.z-0.95
			w = 1.4
			l = 6.3

			headings = {0, 90, 180, 270}
			values = {}
			for i, h in pairs(headings) do
				v = h - ph
				if(v < 0) then
					v = v * -1
				end
				values[i] = {v, h}
			end

			local key, max = 1, values[1][1]
			for k, v in ipairs(values) do
				if values[k][1] < max then
					key, max = k, v[1]
				end
			end

			ag = values[key][2]
			if(ag == 0 or ag == 180) then
				a = w
				b = l
			elseif (ag == 90 or ag == 270) then
				a = l
				b = w
			end

			delivery = {x=pc.x, y=pc.y, z=pc.z, h=ag, l1={x=pc.x-a,y=pc.y-b,z=gl}, l2={x=pc.x-a,y=pc.y+b,z=gl}, l3={x=pc.x+a,y=pc.y+b,z=gl}, l4={x=pc.x+a,y=pc.y-b,z=gl}}

			TriggerEvent("chatMessage", "", { 0, 0, 0 }, tostring(json.encode(delivery)))
			--
			--trailer = CreateVehicle(0xCBB2BE0E, pickupPoints.market.x, pickupPoints.market.y, pickupPoints.market.z, pickupPoints.market.h, true, false)

		end

		if IsControlJustPressed(1, 197) then -- ]
			truck = CreateVehicle(0x21EEE87D, playerCoords.x, playerCoords.y, playerCoords.z, playerHeading + 90, true, false)
			TaskWarpPedIntoVehicle(player, truck, -1)
			Wait(7000)
			AttachVehicleToTrailer(truck, trailer)
		end
	end
end)
