function checkPlayerStatuses()
    -- Check if 2 players are online
        -- Check if 2 players are on duty
            -- Check time since last auction
            --[[
            MySQL.Async.fetchScalar("SELECT `completed_at` FROM auctions ORDER BY `completed_at` DESC LIMIT 1", function(auctionDate)
                timeElapsed = timeDifference(auctionDate)
                if (timeElapsed >= 3600 and randomCheck() or timeElapsed >= 9000) then
                    -- Run next auction
                end
            end
            ]]--
end

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

function randomCheck()
    math.randomseed(os.time())
    num = math.random(1000)
    if(num >= 915) then
        return true
    else
        return false
    end
end

function timeDifference(pastDate)
    -- Convert string to date
    format = "(%d+)-(%d+)-(%d+) (%d+):(%d+):(%d+)"
    year,month,day,hour,min,sec = date:match(format)
    offset = os.time()-os.time(os.date("!*t"))
    covertedDate = os.time({year=year,month=month,day=day,hour=hour,min=min,sec=sec})+offset
    currentDate = os.time()
    -- Get difference
    diff = os.difftime(currentDate, pastDate)
    return timeElapsed
end

RegisterServerEvent('trucking:getjobs')
AddEventHandler('trucking:getjobs', function(id)
    TriggerClientEvent("trucking:updatejobs", id, getJobs())
end)

RegisterServerEvent('trucking:getjob')
AddEventHandler('trucking:getjob', function(id, jobid)
    TriggerClientEvent("trucking:updatejob", id, getJob(jobid)[1])
end)
