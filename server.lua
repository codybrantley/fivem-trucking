require "resources/db/lib/MySQL"
json = require "resources/db/lib/JSON"
MySQL:open("localhost", "gta", "root", "")

function getTruckingJobs()
  local executed_query = MySQL:executeQuery("SELECT * FROM trucking_jobs")
  local result = MySQL:getResults(executed_query)
  return result
end

RegisterServerEvent('trucking:getjobs')
AddEventHandler('trucking:getjobs', function()
	local jobs = getTruckingJobs()
	local json = json.encode(jobs)
	TriggerClientEvent("trucking:updatejobs", source, json)
end)