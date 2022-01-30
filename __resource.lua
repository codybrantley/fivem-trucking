resource_manifest_version '44febabe-d386-4d18-afbe-5e627f4af937'

client_scripts {
	'client/global.js',
	'client/events.js',
	'client/thread.js'
}

server_script 'server/server.lua'

ui_page('client/nui/mobile.html')

files({
    'client/nui/mobile.html',
    'client/nui/mobile.js',
    'client/nui/mobile.css',
    'client/nui/includes/images/icons.png',
	'client/nui/includes/images/map.jpg',
	'client/nui/includes/fonts/RobotoSlab-Bold.ttf',
	'client/nui/includes/fonts/Roboto-Thin.ttf'
})
