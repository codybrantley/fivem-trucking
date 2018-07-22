function getJobs()
    return MySQL.Sync.fetchAll('SELECT * FROM jobs')
end

function getJob(id)
    return MySQL.Sync.fetchAll('SELECT * FROM jobs WHERE id = @id', {['@id'] = id})
end

function getDeliveries(player)

end

function createDeliveryReport(data)

end

RegisterServerEvent('trucking:getjobs')
AddEventHandler('trucking:getjobs', function(id)
    TriggerClientEvent("trucking:updatejobs", id, getJobs())
end)

RegisterServerEvent('trucking:getjob')
AddEventHandler('trucking:getjob', function(id, jobid)
    TriggerClientEvent("trucking:updatejob", id, getJob(jobid)[1])
end)
