-- SERVER
RegisterNetEvent("trucking:getjobs")
AddEventHandler("trucking:getjobs", function()
	TriggerServerEvent("trucking:getjobs", playerServerId)
end)

RegisterNetEvent("trucking:updatejobs")
AddEventHandler("trucking:updatejobs", function(jobs)
    coords = GetEntityCoords(player)
    for i, job in pairs(jobs) do
      distance = GetDistanceBetweenCoords(job.pickup_x, job.pickup_y, job.pickup_z, coords.x, coords.y, coords.z, 1)
	  milesAway = round(distance / 1760)
	  milesTravel = round(GetDistanceBetweenCoords(job.pickup_x, job.pickup_y, job.pickup_z, job.delivery_x, job.delivery_y, job.delivery_z, 1) / 1760)
      payout = milesTravel * (basepay + (calculateWeight(job.pickup_w) * basepay))
      jobs[i].distance = distance
      jobs[i].milesAway = milesAway
	  jobs[i].milesTravel = milesTravel
      jobs[i].payout = payout
    end

    data = json.encode(jobs)
    EnableMenu(true, data)
	cb('ok')
end)

RegisterNetEvent("trucking:start")
AddEventHandler("trucking:start", function(key, value)
	truck = CreateVehicle(0x21EEE87D, 363.884, 3411.5, 36.3248, 21.29, true, false)
end)

RegisterNetEvent("trucking:stop")
AddEventHandler("trucking:stop", function(key, value)
	DeleteEntity(truck)
	DeleteEntity(trailer)
end)

RegisterNetEvent("trucking:job")
AddEventHandler("trucking:job", function()
	distance = round(GetDistanceBetweenCoords(job.pickup_x, job.pickup_y, job.pickup_z, job.delivery_x, job.delivery_y, job.delivery_z, 1) / 1760)
	payout = distance * (basepay + (calculateWeight(job.pickup_w) * basepay))
	originalPayout = payout
	startTime = GetGameTimer()
	latestTime = startTime + 600000
	trailer = CreateVehicle(vehicles[job.pickup_t], job.pickup_x, job.pickup_y, job.pickup_z, job.pickup_h, true, false)
	SetVehicleLivery(trailer, job.pickup_l)
	SetVehicleOnGroundProperly(trailer)
	SetNewWaypoint(job.pickup_x, job.pickup_y)
	onjob = true
end)

RegisterNetEvent("trucking:updatejob")
AddEventHandler("trucking:updatejob", function(data)
	job = data
	if job then
		local str = string.format(message.jobstart, job.pickup_loc)
   		Notify(str)
   		TriggerEvent("trucking:job")
		EnableMenu(false, false)
   	else
   		Notify(message.jobunavail)
   	end
end)

-- NUI
RegisterNUICallback('updatejobs', function(data, cb)
    TriggerServerEvent("trucking:getjobs")EnableMenu(false, false)
    cb('ok')
end)

RegisterNUICallback('job', function(data, cb)
	if onduty then
		TriggerServerEvent('trucking:getjob', playerServerId, data)
   	else
   		Notify(message.notonduty)
   	end
    cb('ok')
end)

RegisterNUICallback('escape', function(data, cb)
	EnableMenu(false, false)
    EnableGui(false)
    cb('ok')
end)
