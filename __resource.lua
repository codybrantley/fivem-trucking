resource_manifest_version '77731fab-63ca-442c-a67b-abc70f28dfa5'

client_scripts {
	"main.lua",
	"job.lua",
	"events.lua"
}

server_script '@mysql-async/lib/MySQL.lua'
server_script "server.lua"

ui_page('nui/index.html')

files({
    'nui/index.html',
	'nui/assets/js/angular.min.js',
	'nui/assets/js/three.min.js',
    'nui/assets/js/script.js',
	'nui/assets/css/foundation.min.css',
    'nui/assets/css/style.css',
    'nui/assets/images/icons.png',
	'nui/assets/images/nav.png',
	'nui/assets/images/map.jpg',
	'nui/assets/fonts/RobotoSlab-Bold.ttf',
	'nui/assets/fonts/Roboto-Thin.ttf'
})
