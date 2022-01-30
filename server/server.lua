server = "us-central1"
appId = "trucker-afa14"
url = "https://" .. server .. "-" .. appId .. ".cloudfunctions.net/"

AddEventHandler("onResourceStart", function()
    -- Create deliveries
    local count = 5
    for i=1, count, 1 do
        print(i)
    end
end)

AddEventHandler("playerConnecting", function()
    local id = GetPlayerIdentifiers(source)[2]
    PerformHttpRequest(url .. "playerConnected?identifier=" .. id)
end)

AddEventHandler("playerDropped", function()
    local id = source
    PerformHttpRequest(url .. "playerDropped?playerId=" .. id)
end)

RegisterServerEvent("getIdentifier")
AddEventHandler("getIdentifier", function(playerId)
    local identifier = GetPlayerIdentifiers(playerId)[2]
    TriggerClientEvent("SetIdentifier", playerId, identifier)
end)
