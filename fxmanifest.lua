fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'mz_hud'
author 'Mazus'
description 'Centralized HUD with admin editor and global sync'
version '1.0.0'

ui_page 'web/index.html'

shared_scripts {
  '@ox_lib/init.lua',
  'config.lua'
}

server_scripts {
  'server/main.lua'
}

client_scripts {
  'client/main.lua'
}

files {
  'web/index.html',
  'web/style.css',
  'web/app.js',
  'stream/minimap.gfx',
  'stream/minimap.ytd',
  'stream/circlemap.ytd',
  'stream/squaremap.ytd'
}

dependencies {
  'ox_lib',
  'mz_core'
}
