fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'mz_hud'
author 'Mazus'
description 'HUD modular do MZ Core com editor, status, logo, voz, radio, arma, minimapa e velocimetro.'
version '1.0.0'

ui_page 'web/index.html'

shared_scripts {
  '@ox_lib/init.lua',
  'config.lua'
}

client_scripts {
  'client/main.lua'
}

server_scripts {
  'server/main.lua'
}

files {
  'web/index.html',
  'web/style.css',
  'web/hud/speedometer/speedometer.css',
  'web/hud/status/status.css',
  'web/hud/voice/voice.css',
  'web/hud/radio/radio.css',
  'web/hud/logo/logo.css',
  'web/hud/weapon/weapon.css',
  'web/hud/editor/editor.css',
  'web/core/core.js',
  'web/hud/speedometer/speedometer.js',
  'web/hud/status/status.js',
  'web/hud/voice/voice.js',
  'web/hud/radio/radio.js',
  'web/hud/logo/logo.js',
  'web/hud/weapon/weapon.js',
  'web/hud/editor/editor.js',
  'web/app.js',
  'web/assets/**',
  'data/runtime_config.json'
}

dependencies {
  'ox_lib',
  'mz_core'
}
