resource_manifest_version '77731fab-63ca-442c-a67b-abc70f28dfa5'

client_scripts {
	"main.lua",
	"trailer.lua"
}

server_script "server.lua"

ui_page('nui/index.html')

files({
    'nui/index.html',
    'nui/script.js',
    'nui/style.css',
    'nui/cursor.png',
    'nui/sprites.png'
})
