Citizen.CreateThread(function()
	while onjob do
		Wait(0)

		playerCoords = GetEntityCoords(player, 0)
		playerHeading = GetEntityHeading(player)

		-- Pickup
		if (mission == 1) then
			local veh = GetVehiclePedIsUsing(player)
			if IsVehicleAttachedToTrailer(veh) then
				Notify(message.jobdeli)
				SetNewWaypoint(job.delivery_x, job.delivery_y)
				mission = 2
			end
		end
		-- Delivery
		if (mission == 2) then
			trailerCoords = GetEntityCoords(trailer)
			trailerHeading = GetEntityHeading(trailer)
			trailerHealth = getTrailerStatus(GetEntityHealth(trailer))
			distance = GetDistanceBetweenCoords(trailerCoords, job.delivery_x, job.delivery_y, job.delivery_z, false)
			drawDropoffLines(255, 255, 0)
			-- Attempt Dropoff
			if (distance < 15) then
				distanceStatus = getDistanceStatus(distance)
				angleStatus = getAngleStatus(trailerHeading, job.delivery_h)
				local str = string.format(message.jobinfo, distanceStatus, angleStatus, trailerHealth)
				DrawTxt(0.87, 0.05, 0.068, -1.18, 0.33, str, 255, 255, 255, 255)
				DrawRect(0.91, 0.715, 0.175, 0.16, 0, 0, 0, 150)
				if (acceptStatus(distanceStatus) and acceptStatus(angleStatus)) then
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
			deliveryTime = GetGameTimer()
			adjustPayout(distanceStatus, angleStatus, trailerHealth, deliveryTime)
			Notify(message.jobunload)
			Wait(11000)
			DeleteEntity(trailer)
			mission = 4
		end
		-- Delivered
		if (mission == 4) then
			local str = string.format(message.jobdone, payout)
			Notify(str)
			mission = 1
			onjob = false
		end
	end
end)
