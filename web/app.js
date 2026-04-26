const resourceName = typeof GetParentResourceName === 'function' ? GetParentResourceName() : 'mz_hud';

const state = {
  config: null,
  status: {
    health: 100,
    armor: 0,
    hunger: 100,
    thirst: 100,
    stamina: 100,
    oxygen: 100,
    stress: 0,
    voice: 66,
    voiceLabel: 'Normal',
    talking: false,
    radio: 0,
    radioLabel: 'Fora do rádio',
    radioActive: false,
    radioTalking: false,
    radioChannel: 0,
  },
  vehicle: {
    visible: false,
    speed: 87,
    rpm: 65,
    fuel: 72,
    gear: '4',
    seatbelt: true,
    lights: true,
    engine: true,
  },
  realVehicleVisible: false,
  hudVisible: true,
  speedometerVisible: true,
  editorOpen: false,
  canManage: false,
  selectedElement: 'health',
};

const dom = {
  hudRoot: document.getElementById('hud-root'),
  hudContainer: document.getElementById('hud-container'),
  hudLogo: document.getElementById('hud-logo'),
  speedometer: document.getElementById('speedometer'),
  editorOverlay: document.getElementById('editor-overlay'),
  editorShell: document.querySelector('.editor-shell'),
  elementsEditor: document.getElementById('elements-editor'),
  voiceEditor: document.getElementById('voice-editor'),
  saveConfig: document.getElementById('save-config'),
  resetConfig: document.getElementById('reset-config'),
  previewNotify: document.getElementById('preview-notify'),
  closeEditor: document.getElementById('close-editor'),
};

const selectOptions = {
  hudPosition: ['bottom-left', 'bottom-center', 'bottom-right', 'center-left', 'center', 'center-right', 'top-left', 'top-center', 'top-right'],
  minimapStyle: ['circle', 'square', 'default'],
  minimapVisibility: ['always', 'vehicle', 'foot', 'never'],
  speedometerPosition: ['bottom-left', 'bottom-center', 'bottom-right', 'center-left', 'center', 'center-right', 'top-left', 'top-center', 'top-right'],
  unit: ['kmh', 'mph'],
  speedometerStyle: ['digital', 'analog', 'minimal', 'racing', 'classic'],
  logoPosition: ['bottom-left', 'bottom-center', 'bottom-right', 'center-left', 'center', 'center-right', 'top-left', 'top-center', 'top-right'],
  icon: ['heart', 'shield', 'utensils', 'droplet', 'zap', 'wind', 'brain', 'mic', 'radio'],
  elementStyle: ['circle', 'bar', 'square', 'pill'],
  itemPosition: ['bottom-left', 'bottom-center', 'bottom-right', 'center-left', 'center', 'center-right', 'top-left', 'top-center', 'top-right'],
};

const labels = {
  'bottom-left': 'Esquerda inferior',
  'bottom-center': 'Centro inferior',
  'bottom-right': 'Direita inferior',
  'center-left': 'Esquerda centro',
  center: 'Centro',
  'center-right': 'Direita centro',
  'top-left': 'Esquerda superior',
  'top-center': 'Centro superior',
  'top-right': 'Direita superior',
  circle: 'Círculo',
  bar: 'Barra',
  square: 'Quadrado',
  pill: 'Pílula',
  default: 'Padrão',
  always: 'Sempre ativo',
  vehicle: 'Só no carro',
  foot: 'Só a pé',
  never: 'Nunca',
  kmh: 'KM/H',
  mph: 'MPH',
  digital: 'Digital',
  analog: 'Analógico',
  minimal: 'Minimalista',
  racing: 'Racing',
  classic: 'Clássico',
};

const colorPresets = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];

const speedometerThemes = {
  blue: { primary_color: '#ffffff', secondary_color: '#3b82f6', accent_color: '#ef4444', background_color: '#000000' },
  red: { primary_color: '#ffffff', secondary_color: '#ef4444', accent_color: '#f97316', background_color: '#080808' },
  green: { primary_color: '#ffffff', secondary_color: '#22c55e', accent_color: '#eab308', background_color: '#020617' },
  purple: { primary_color: '#ffffff', secondary_color: '#8b5cf6', accent_color: '#ec4899', background_color: '#050314' },
  orange: { primary_color: '#ffffff', secondary_color: '#f97316', accent_color: '#ef4444', background_color: '#090604' },
  mono: { primary_color: '#f8fafc', secondary_color: '#94a3b8', accent_color: '#ffffff', background_color: '#000000' },
};


const minimapQuickPosition = {
  'bottom-left': { x: 24, y: 24 },
  'bottom-center': { x: 860, y: 24 },
  'bottom-right': { x: 1660, y: 24 },
  'center-left': { x: 24, y: 420 },
  center: { x: 860, y: 420 },
  'center-right': { x: 1660, y: 420 },
  'top-left': { x: 24, y: 760 },
  'top-center': { x: 860, y: 760 },
  'top-right': { x: 1660, y: 760 },
};

const statusGroupQuickPosition = {
  'bottom-left': { x: 8, y: 94 },
  'bottom-center': { x: 50, y: 94 },
  'bottom-right': { x: 92, y: 94 },
  'center-left': { x: 8, y: 50 },
  center: { x: 50, y: 50 },
  'center-right': { x: 92, y: 50 },
  'top-left': { x: 8, y: 6 },
  'top-center': { x: 50, y: 6 },
  'top-right': { x: 92, y: 6 },
};

function applyMinimapQuickPosition(position) {
  const preset = minimapQuickPosition[position];
  if (!preset) return;
  const x = document.getElementById('general-minimap-x');
  const y = document.getElementById('general-minimap-y');
  if (x) x.value = preset.x;
  if (y) y.value = preset.y;
}

function applyStatusGroupQuickPosition(position) {
  const preset = statusGroupQuickPosition[position];
  if (!preset) return;
  const free = document.getElementById('status-group-free');
  const x = document.getElementById('status-group-x');
  const y = document.getElementById('status-group-y');
  if (free) free.checked = false;
  if (x) x.value = preset.x;
  if (y) y.value = preset.y;
}

const iconMap = {
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20.4 4.8 13.7a4.9 4.9 0 0 1 6.9-6.9l.3.3.3-.3a4.9 4.9 0 0 1 6.9 6.9L12 20.4Z"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v5c0 5 3.5 8 7 10 3.5-2 7-5 7-10V6l-7-3Z"/></svg>',
  utensils: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 3v7a2 2 0 0 0 2 2h3V3"/><path d="M8 3v18"/><path d="M16 3v9a2 2 0 0 0 2 2h2V3"/><path d="M18 14v7"/></svg>',
  droplet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3s-5 6-5 10a5 5 0 0 0 10 0c0-4-5-10-5-10Z"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>',
  wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8h10a3 3 0 1 0-3-3"/><path d="M3 14h14a3 3 0 1 1-3 3"/><path d="M3 19h8"/></svg>',
  brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3a3 3 0 0 0-3 3v.3A3.7 3.7 0 0 0 4 9.6c0 1 .4 2 1.2 2.7A3.5 3.5 0 0 0 7 18.6 3.2 3.2 0 0 0 10 21h2"/><path d="M15 3a3 3 0 0 1 3 3v.3A3.7 3.7 0 0 1 20 9.6c0 1-.4 2-1.2 2.7A3.5 3.5 0 0 1 17 18.6 3.2 3.2 0 0 1 14 21h-2"/><path d="M12 3v18"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"/><path d="M19 11a7 7 0 0 1-14 0"/><path d="M12 18v3"/></svg>',
  radio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 11a8 8 0 0 1 16 0"/><path d="M7 11a5 5 0 0 1 10 0"/><path d="M10 11a2 2 0 0 1 4 0"/><rect x="5" y="13" width="14" height="8" rx="2"/><path d="M8 17h.01"/><path d="M11 17h5"/></svg>',
};

function escapeHTML(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nui(action, data = {}) {
  return fetch(`https://${resourceName}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data),
  }).then((response) => response.json()).catch(() => ({ ok: false }));
}

function markUIReady() {
  document.documentElement.style.background = 'transparent';
  document.body.style.background = 'transparent';
  document.body.classList.remove('hud-initializing');
}

function setSelectOptions(select, values) {
  if (!select) return;
  select.innerHTML = values.map((value) => `<option value="${value}">${labels[value] || value}</option>`).join('');
}

function cacheStaticOptions() {
  setSelectOptions(document.getElementById('general-hud-position'), selectOptions.hudPosition);
  setSelectOptions(document.getElementById('general-minimap-style'), selectOptions.minimapStyle);
  setSelectOptions(document.getElementById('general-minimap-visibility'), selectOptions.minimapVisibility);
  setSelectOptions(document.getElementById('status-group-position'), selectOptions.itemPosition);
  setSelectOptions(document.getElementById('speedometer-position'), selectOptions.speedometerPosition);
  setSelectOptions(document.getElementById('speedometer-style'), selectOptions.speedometerStyle);
  setSelectOptions(document.getElementById('speedometer-unit'), selectOptions.unit);
  setSelectOptions(document.getElementById('logo-position'), selectOptions.logoPosition);
}

function getHudPositionClass(position) { return `hud-position-${position || 'bottom-left'}`; }
function getLogoPositionClass(position) { return `logo-${position || 'top-center'}`; }
function getSpeedometerPositionClass(position) { return `speedometer-${position || 'bottom-right'}`; }
function getItemPositionClass(position) { return `hud-anchor-${position || 'bottom-center'}`; }

const defaultElementLayout = {
  stamina: { position: 'bottom-center', free: true, x: 42, y: 95, scale: 100 },
  armor: { position: 'bottom-center', free: true, x: 45, y: 95, scale: 100 },
  health: { position: 'bottom-center', free: true, x: 48, y: 95, scale: 100 },
  voice: { position: 'top-right', free: true, x: 90, y: 10, scale: 100 },
  radio: { position: 'top-right', free: true, x: 80, y: 10, scale: 100 },
  hunger: { position: 'bottom-center', free: true, x: 54, y: 95, scale: 100 },
  thirst: { position: 'bottom-center', free: true, x: 57, y: 95, scale: 100 },
  oxygen: { position: 'bottom-center', free: true, x: 60, y: 95, scale: 100 },
  stress: { position: 'bottom-center', free: true, x: 63, y: 95, scale: 100 },
};


const defaultCommsOptions = {
  voice: { show_label: true, show_level_text: true, show_talking_text: true, inactive_opacity: 72 },
  radio: { show_frequency: true, show_inactive: true, show_talking_text: true, inactive_text: 'OFF', frequency_suffix: 'MHz' },
};

function withCommsOptions(key, options = {}) {
  return { ...(defaultCommsOptions[key] || {}), ...(options || {}) };
}

function voiceLevelFromStatus() {
  const raw = String(state.status.voiceMode || state.status.voiceLabel || '').toLowerCase();
  const value = Number(state.status.voice) || 66;
  if (raw.includes('baixo') || raw.includes('baixa') || raw.includes('whisper') || value <= 40) return { level: 1, key: 'low', label: 'Baixo' };
  if (raw.includes('alto') || raw.includes('alta') || raw.includes('shout') || value >= 90) return { level: 3, key: 'high', label: 'Alto' };
  return { level: 2, key: 'normal', label: 'Normal' };
}

function formatRadioFrequency(channel, suffix = 'MHz') {
  const numeric = Number(channel);
  if (!numeric || numeric <= 0) return '';
  const text = Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return `${text} ${suffix || 'MHz'}`;
}


function withStatusGroupDefaults(group = {}) {
  return {
    enabled: group.enabled !== undefined ? Boolean(group.enabled) : true,
    position: group.position || 'bottom-center',
    free: group.free !== undefined ? Boolean(group.free) : true,
    x: Number(group.x ?? 50),
    y: Number(group.y ?? 94),
    opacity: Number(group.opacity ?? 100),
    scale: Number(group.scale ?? 100),
    gap: Number(group.gap ?? 8),
  };
}

function statusGroupInlineStyle(group = {}) {
  const item = withStatusGroupDefaults(group);
  const opacity = Math.max(0, Math.min(100, Number(item.opacity) || 0)) / 100;
  const scale = Math.max(40, Math.min(200, Number(item.scale) || 100)) / 100;
  const x = Math.max(0, Math.min(100, Number(item.x) || 0));
  const y = Math.max(0, Math.min(100, Number(item.y) || 0));
  const gap = Math.max(0, Math.min(40, Number(item.gap) || 0));
  return `--group-opacity:${opacity};--group-scale:${scale};--group-x:${x}%;--group-y:${y}%;--group-gap:${gap}px`;
}

function getStatusGroupPositionClass(position) { return `hud-group-anchor-${position || 'bottom-center'}`; }

function withElementDefaults(key, entry = {}) {
  const layout = defaultElementLayout[key] || { position: 'bottom-center', free: true, x: 50, y: 95, scale: 100 };
  return {
    ...entry,
    position: entry.position || layout.position,
    free: entry.free !== undefined ? Boolean(entry.free) : Boolean(layout.free),
    x: Number(entry.x ?? layout.x),
    y: Number(entry.y ?? layout.y),
    scale: Number(entry.scale ?? layout.scale),
    opacity: Number(entry.opacity ?? 100),
    individual: entry.individual !== undefined ? Boolean(entry.individual) : (key === 'voice' || key === 'radio'),
    comms_options: (key === 'voice' || key === 'radio') ? withCommsOptions(key, entry.comms_options || {}) : entry.comms_options,
  };
}

function withSpeedometerDefaults(speedometer = {}) {
  return {
    enabled: speedometer.enabled !== undefined ? Boolean(speedometer.enabled) : true,
    position: speedometer.position || 'bottom-right',
    style: speedometer.style || 'digital',
    unit: speedometer.unit || 'kmh',
    show_speed: speedometer.show_speed !== undefined ? Boolean(speedometer.show_speed) : true,
    show_rpm: speedometer.show_rpm !== undefined ? Boolean(speedometer.show_rpm) : true,
    show_fuel: speedometer.show_fuel !== undefined ? Boolean(speedometer.show_fuel) : true,
    show_gear: speedometer.show_gear !== undefined ? Boolean(speedometer.show_gear) : true,
    show_seatbelt: speedometer.show_seatbelt === true,
    show_lights: speedometer.show_lights !== undefined ? Boolean(speedometer.show_lights) : true,
    show_engine: speedometer.show_engine !== undefined ? Boolean(speedometer.show_engine) : true,
    primary_color: speedometer.primary_color || '#ffffff',
    secondary_color: speedometer.secondary_color || '#3b82f6',
    accent_color: speedometer.accent_color || '#ef4444',
    background_color: speedometer.background_color || '#000000',
    opacity: Number(speedometer.opacity ?? 94),
    scale: Number(speedometer.scale ?? 100),
  };
}

function normalizeConfig(config) {
  if (!config) return config;
  const normalized = deepClone(config);
  normalized.general = normalized.general || {};
  normalized.general.status_group = withStatusGroupDefaults(normalized.general.status_group || {});
  normalized.speedometer = withSpeedometerDefaults(normalized.speedometer || {});
  normalized.elements = normalized.elements || {};
  Object.keys(normalized.elements).forEach((key) => {
    normalized.elements[key] = withElementDefaults(key, normalized.elements[key]);
  });
  return normalized;
}

function itemInlineStyle(key, entry) {
  const item = withElementDefaults(key, entry);
  const opacity = Math.max(0, Math.min(100, Number(item.opacity) || 0)) / 100;
  const scale = Math.max(40, Math.min(200, Number(item.scale) || 100)) / 100;
  const x = Math.max(0, Math.min(100, Number(item.x) || 0));
  const y = Math.max(0, Math.min(100, Number(item.y) || 0));
  return `--item-accent:${item.color};--item-value:${Math.max(0, Math.min(100, Number(state.status[key]) || 0))};--item-opacity:${opacity};--item-scale:${scale};--item-x:${x}%;--item-y:${y}%`;
}

function renderCommsItem(key, rawEntry) {
  const entry = withElementDefaults(key, rawEntry);
  const opts = withCommsOptions(key, entry.comms_options || {});
  const isRadio = key === 'radio';
  const icon = iconMap[entry.icon] || (isRadio ? iconMap.radio : iconMap.mic);
  const positionClass = entry.free ? 'hud-anchor-free' : getItemPositionClass(entry.position);
  const selected = state.editorOpen && state.selectedElement === key ? 'is-selected' : '';

  if (!isRadio) {
    const voice = voiceLevelFromStatus();
    const speaking = Boolean(state.status.talking);
    const talkingText = speaking ? 'Falando' : 'Em silêncio';
    return `
      <button class="hud-comms hud-comms-voice voice-level-${voice.key} ${speaking ? 'is-speaking' : ''} ${selected} ${positionClass}" data-hud-select="voice" title="Voz ${escapeHTML(voice.label)}" style="${itemInlineStyle(key, entry)};--comms-idle-opacity:${Math.max(0, Math.min(100, Number(opts.inactive_opacity) || 72)) / 100}">
        <div class="comms-icon-wrap"><div class="hud-icon">${icon}</div></div>
        <div class="voice-meter" aria-hidden="true">${[1, 2, 3].map((level) => `<span class="${level <= voice.level ? 'active' : ''}"></span>`).join('')}</div>
        <div class="comms-copy">
          ${opts.show_label ? '<strong>Voz</strong>' : ''}
          ${opts.show_level_text ? `<small>${escapeHTML(voice.label)}</small>` : ''}
          ${opts.show_talking_text ? `<em>${escapeHTML(talkingText)}</em>` : ''}
        </div>
      </button>
    `;
  }

  const channel = Number(state.status.radioChannel) || 0;
  const active = Boolean(state.status.radioActive || channel > 0);
  const talking = Boolean(state.status.radioTalking);
  if (!active && opts.show_inactive === false && !state.editorOpen) return '';
  const frequency = formatRadioFrequency(channel, opts.frequency_suffix);
  const mainText = active ? (opts.show_frequency ? frequency : 'Conectado') : (opts.inactive_text || 'OFF');
  const subText = active ? (talking ? 'Rádio falando' : 'Rádio online') : 'Sem rádio';
  return `
    <button class="hud-comms hud-comms-radio ${active ? 'is-radio-active' : 'is-radio-off'} ${talking ? 'is-speaking' : ''} ${selected} ${positionClass}" data-hud-select="radio" title="${escapeHTML(active ? frequency : 'Fora do rádio')}" style="${itemInlineStyle(key, entry)}">
      <div class="radio-signal"><span></span><span></span><span></span></div>
      <div class="comms-icon-wrap"><div class="hud-icon">${icon}</div></div>
      <div class="comms-copy"><strong>${escapeHTML(mainText)}</strong>${opts.show_talking_text ? `<small>${escapeHTML(subText)}</small>` : ''}</div>
    </button>
  `;
}

function renderHudItem(key, rawEntry, renderMode = 'single') {
  if ((key === 'voice' || key === 'radio') && renderMode !== 'group') return renderCommsItem(key, rawEntry);

  const entry = withElementDefaults(key, rawEntry);
  const value = Math.max(0, Math.min(100, Number(state.status[key]) || 0));
  const style = entry.style || 'circle';
  const extraClass = (key === 'voice' && state.status.talking) || (key === 'radio' && state.status.radioTalking) ? 'hud-speaking' : '';
  const isComms = key === 'voice' || key === 'radio';
  const selected = state.editorOpen && state.selectedElement === key ? 'is-selected' : '';
  const icon = iconMap[entry.icon] || iconMap.heart;
  const positionClass = renderMode === 'group' ? 'hud-anchor-grouped' : (entry.free ? 'hud-anchor-free' : getItemPositionClass(entry.position));
  const voiceClass = isComms ? 'hud-voice-item' : '';

  return `
    <button class="hud-item hud-style-${style} ${extraClass} ${selected} ${positionClass} ${voiceClass}" data-hud-select="${key}" title="${escapeHTML(key === 'voice' ? state.status.voiceLabel || entry.label : key === 'radio' ? state.status.radioLabel || entry.label : entry.label)}" style="${itemInlineStyle(key, entry)}">
      ${style === 'circle' ? `<div class="hud-ring"><div class="hud-center"><div class="hud-icon">${icon}</div></div></div>` : ''}
      ${style === 'bar' ? `<div class="hud-bar-box"><div class="hud-icon">${icon}</div><div class="hud-bar-track"><div class="hud-bar-fill" style="width:${value}%"></div></div></div>` : ''}
      ${style === 'square' ? `<div class="hud-square-box"><div class="hud-square-fill" style="height:${value}%"></div><div class="hud-icon">${icon}</div></div>` : ''}
      ${style === 'pill' ? `<div class="hud-pill-box"><div class="hud-icon">${icon}</div><span>${value}%</span></div>` : ''}
    </button>
  `;
}


function renderStatusGroup(keys, elements) {
  const group = withStatusGroupDefaults(state.config?.general?.status_group || {});
  if (!group.enabled || !keys.length) return '';
  const positionClass = group.free ? 'hud-group-anchor-free' : getStatusGroupPositionClass(group.position);
  return `<div class="hud-status-group ${positionClass}" style="${statusGroupInlineStyle(group)}">${keys.map((key) => renderHudItem(key, elements[key], 'group')).join('')}</div>`;
}

function renderHud() {
  if (!state.config) return;
  state.config = normalizeConfig(state.config);
  const general = state.config.general || {};
  const elements = state.config.elements || {};
  dom.hudContainer.className = 'hud-container hud-layout-free';
  dom.hudContainer.style.opacity = `${(general.global_opacity || 100) / 100}`;
  dom.hudContainer.style.transform = 'none';
  const orderedKeys = ['stamina', 'armor', 'health', 'hunger', 'thirst', 'oxygen', 'stress'];
  const communicationKeys = ['voice', 'radio'];
  const known = orderedKeys.filter((key) => elements[key]);
  const rest = Object.keys(elements).filter((key) => !known.includes(key) && !communicationKeys.includes(key));
  const allStatusKeys = [...known, ...rest].filter((key) => elements[key]?.enabled);
  const groupedKeys = allStatusKeys.filter((key) => !withElementDefaults(key, elements[key]).individual);
  const individualKeys = allStatusKeys.filter((key) => withElementDefaults(key, elements[key]).individual);
  const commsHtml = communicationKeys.filter((key) => elements[key]?.enabled).map((key) => renderHudItem(key, elements[key])).join('');
  dom.hudContainer.innerHTML = renderStatusGroup(groupedKeys, elements) + individualKeys.map((key) => renderHudItem(key, elements[key])).join('') + commsHtml;
  renderLogo();
  renderSpeedometer();
  applyVisibility();
}

function renderLogo() {
  const logo = state.config?.logo || {};
  const inVehicle = state.vehicle.visible;
  const shouldShow = logo.enabled && logo.image_url && (!logo.show_only_in_vehicle || inVehicle);
  if (!shouldShow) {
    dom.hudLogo.className = 'hud-logo hidden';
    dom.hudLogo.innerHTML = '';
    return;
  }
  dom.hudLogo.className = `hud-logo ${getLogoPositionClass(logo.position)}`;
  dom.hudLogo.style.opacity = `${(logo.opacity || 100) / 100}`;
  dom.hudLogo.innerHTML = '';
  const image = document.createElement('img');
  image.alt = 'HUD Logo';
  image.src = String(logo.image_url || '');
  image.style.width = `${logo.width}px`;
  image.style.height = `${logo.height}px`;
  dom.hudLogo.appendChild(image);
}

function speedometerIcon(name) {
  const icons = {
    fuel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18"/><path d="M7 7h4"/><path d="M15 8h2.5L20 10.5V17a2 2 0 0 0 4 0v-5l-3-3"/></svg>',
    belt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3 3 20h18L12 3Z"/><path d="M12 9v5"/><path d="M12 17h.01"/></svg>',
    light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z"/></svg>',
    engine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 10h3l2-3h5l2 3h3v8H6v-5H3v-3Z"/><path d="M18 13h3v3"/><path d="M10 7V4h4"/></svg>',
  };
  return icons[name] || '';
}

function speedometerIndicators(speedometer) {
  return `<div class="speedometer-indicators">
    ${speedometer.show_seatbelt && !state.vehicle.seatbelt ? `<span class="speedometer-indicator danger" title="Cinto">${speedometerIcon('belt')}</span>` : ''}
    ${speedometer.show_lights && state.vehicle.lights ? `<span class="speedometer-indicator" title="Faróis">${speedometerIcon('light')}</span>` : ''}
    ${speedometer.show_engine && !state.vehicle.engine ? `<span class="speedometer-indicator danger" title="Motor">${speedometerIcon('engine')}</span>` : ''}
  </div>`;
}

function renderSpeedometerDigital(speedometer, speed, rpm, fuel, gear, fuelLowClass) {
  return `<div class="speedometer-panel speedometer-digital">
    ${speedometer.show_speed ? `<div class="speedometer-speed-wrap"><div class="speedometer-speed">${speed}</div><div class="speedometer-unit">${escapeHTML(speedometer.unit || 'kmh')}</div></div>` : ''}
    ${speedometer.show_rpm ? `<div class="speedometer-rpm"><div class="speedometer-bar-track"><div class="speedometer-bar-fill" style="width:${rpm}%"></div></div><div class="speedometer-rpm-labels"><span>0</span><span>RPM</span><span>9</span></div></div>` : ''}
    <div class="speedometer-bottom-row">
      ${speedometer.show_gear ? `<div class="speedometer-gear">${escapeHTML(gear)}</div>` : ''}
      ${speedometer.show_fuel ? `<div class="speedometer-fuel ${fuelLowClass}">${speedometerIcon('fuel')}<div class="speedometer-fuel-track"><div style="width:${fuel}%"></div></div></div>` : ''}
    </div>
    ${speedometerIndicators(speedometer)}
  </div>`;
}

function renderSpeedometerMinimal(speedometer, speed, rpm, fuel, gear, fuelLowClass) {
  return `<div class="speedometer-panel speedometer-minimal">
    ${speedometer.show_speed ? `<div class="minimal-speed"><strong>${speed}</strong><span>${escapeHTML(speedometer.unit || 'kmh')}</span></div>` : ''}
    ${speedometer.show_gear ? `<div class="minimal-gear">${escapeHTML(gear)}</div>` : ''}
    ${speedometer.show_fuel ? `<div class="minimal-fuel ${fuelLowClass}">${speedometerIcon('fuel')}<div class="speedometer-fuel-track"><div style="width:${fuel}%"></div></div></div>` : ''}
    ${speedometer.show_rpm ? `<div class="rpm-leds">${Array.from({ length: 8 }, (_, i) => `<span class="${i < Math.ceil((rpm / 100) * 8) ? 'active' : ''} ${i > 5 ? 'hot' : ''}"></span>`).join('')}</div>` : ''}
    ${speedometerIndicators(speedometer)}
  </div>`;
}

function renderSpeedometerRacing(speedometer, speed, rpm, fuel, gear, fuelLowClass) {
  return `<div class="speedometer-panel speedometer-racing">
    ${speedometer.show_gear ? `<div class="racing-gear">${escapeHTML(gear)}</div>` : ''}
    <div class="racing-main">
      ${speedometer.show_speed ? `<div class="racing-speed"><strong>${speed}</strong><span>${escapeHTML(speedometer.unit || 'kmh')}</span></div>` : ''}
      ${speedometer.show_rpm ? `<div class="rpm-blocks">${Array.from({ length: 12 }, (_, i) => `<span class="${i < Math.ceil((rpm / 100) * 12) ? 'active' : ''} ${i > 8 ? 'hot' : ''}"></span>`).join('')}</div>` : ''}
    </div>
    <div class="racing-side">
      ${speedometer.show_fuel ? `<div class="racing-fuel ${fuelLowClass}"><div class="speedometer-fuel-track"><div style="width:${fuel}%"></div></div>${speedometerIcon('fuel')}</div>` : ''}
      ${speedometerIndicators(speedometer)}
    </div>
  </div>`;
}

function renderSpeedometerAnalog(speedometer, speed, rpm, fuel, gear, fuelLowClass, classic = false) {
  const maxSpeed = speedometer.unit === 'mph' ? (classic ? 120 : 160) : (classic ? 200 : 260);
  const safeSpeed = Math.max(0, Math.min(maxSpeed, Number(speed) || 0));
  const dash = classic ? 250 : 198;
  const progress = Math.max(0, Math.min(dash, (safeSpeed / maxSpeed) * dash));
  const needle = (safeSpeed / maxSpeed) * 240 - 120;
  const tickCount = classic ? 21 : 9;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const percent = tickCount === 1 ? 0 : i / (tickCount - 1);
    const angle = (percent * 240 - 120) * Math.PI / 180;
    const inner = classic ? (i % 4 === 0 ? 37 : 41) : 36;
    const outer = classic ? 45 : 42;
    const x1 = 50 + inner * Math.cos(angle);
    const y1 = 50 + inner * Math.sin(angle);
    const x2 = 50 + outer * Math.cos(angle);
    const y2 = 50 + outer * Math.sin(angle);
    return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="var(--speed-primary-soft)" stroke-width="${classic && i % 4 === 0 ? 2 : 1}" />`;
  }).join('');
  const numbers = classic ? [0, 40, 80, 120, 160, 200].map((num, i) => {
    const display = speedometer.unit === 'mph' ? Math.round(num * 0.621371) : num;
    const angle = ((i / 5) * 240 - 120) * Math.PI / 180;
    const x = 50 + 34 * Math.cos(angle);
    const y = 50 + 34 * Math.sin(angle) + 3;
    return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="middle">${display}</text>`;
  }).join('') : '';
  return `<div class="speedometer-panel ${classic ? 'speedometer-classic' : 'speedometer-analog'}">
    <div class="speedometer-gauge">
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" class="gauge-outer" />
        ${numbers}
        <circle cx="50" cy="50" r="42" class="gauge-bg" stroke-dasharray="${dash} 264" transform="rotate(150 50 50)" />
        <circle cx="50" cy="50" r="42" class="gauge-progress" stroke-dasharray="${progress.toFixed(1)} 264" transform="rotate(150 50 50)" />
        ${ticks}
        <line x1="50" y1="50" x2="50" y2="15" class="gauge-needle" transform="rotate(${needle.toFixed(2)} 50 50)" />
        <circle cx="50" cy="50" r="5" class="gauge-center" />
      </svg>
      <div class="gauge-center-text">
        ${speedometer.show_speed ? `<strong>${speed}</strong><span>${escapeHTML(speedometer.unit || 'kmh')}</span>` : ''}
        ${speedometer.show_gear ? `<em>${escapeHTML(gear)}</em>` : ''}
      </div>
    </div>
    <div class="gauge-side">
      ${speedometer.show_fuel ? `<div class="gauge-fuel ${fuelLowClass}">${speedometerIcon('fuel')}<span>${fuel}%</span></div>` : ''}
      ${speedometer.show_rpm ? `<div class="gauge-rpm"><div class="speedometer-bar-track"><div class="speedometer-bar-fill" style="width:${rpm}%"></div></div><small>RPM</small></div>` : ''}
      ${speedometerIndicators(speedometer)}
    </div>
  </div>`;
}

function renderSpeedometer() {
  if (!state.config) return;
  const speedometer = withSpeedometerDefaults(state.config.speedometer || {});
  const visible = Boolean(speedometer.enabled && state.vehicle.visible && state.speedometerVisible);
  if (!visible) {
    dom.speedometer.className = 'speedometer hidden';
    return;
  }
  const rpm = Math.max(0, Math.min(100, Number(state.vehicle.rpm) || 0));
  const fuel = Math.max(0, Math.min(100, Number(state.vehicle.fuel) || 0));
  const speed = Math.max(0, Number(state.vehicle.speed) || 0);
  const gear = state.vehicle.gear || 'N';
  const fuelLowClass = fuel < 20 ? 'is-low' : '';
  const style = ['digital', 'analog', 'minimal', 'racing', 'classic'].includes(speedometer.style) ? speedometer.style : 'digital';
  dom.speedometer.className = `speedometer speedometer-style-${style} ${getSpeedometerPositionClass(speedometer.position)} ${state.editorOpen && state.selectedElement === 'speedometer' ? 'is-selected' : ''}`;
  dom.speedometer.style.opacity = `${Math.max(0, Math.min(100, speedometer.opacity || 100)) / 100}`;
  dom.speedometer.style.setProperty('--speed-primary', speedometer.primary_color);
  dom.speedometer.style.setProperty('--speed-secondary', speedometer.secondary_color);
  dom.speedometer.style.setProperty('--speed-accent', speedometer.accent_color);
  dom.speedometer.style.setProperty('--speed-bg', speedometer.background_color);
  dom.speedometer.style.setProperty('--speed-primary-soft', `${speedometer.primary_color}80`);
  const speedTranslate = {
    'bottom-center': 'translateX(-50%) ',
    'top-center': 'translateX(-50%) ',
    'center-left': 'translateY(-50%) ',
    'center-right': 'translateY(-50%) ',
    center: 'translate(-50%, -50%) ',
  }[speedometer.position] || '';
  dom.speedometer.style.transform = `${speedTranslate}scale(${Math.max(60, Math.min(150, speedometer.scale || 100)) / 100})`;
  const html = {
    digital: renderSpeedometerDigital(speedometer, speed, rpm, fuel, gear, fuelLowClass),
    minimal: renderSpeedometerMinimal(speedometer, speed, rpm, fuel, gear, fuelLowClass),
    racing: renderSpeedometerRacing(speedometer, speed, rpm, fuel, gear, fuelLowClass),
    analog: renderSpeedometerAnalog(speedometer, speed, rpm, fuel, gear, fuelLowClass, false),
    classic: renderSpeedometerAnalog(speedometer, speed, rpm, fuel, gear, fuelLowClass, true),
  }[style];
  dom.speedometer.innerHTML = html;
}

function applyVisibility() {
  dom.hudContainer.classList.toggle('hidden', !state.hudVisible);
  if (!state.hudVisible) dom.hudLogo.classList.add('hidden');
  if (!state.speedometerVisible || !state.vehicle.visible || !state.config?.speedometer?.enabled) dom.speedometer.classList.add('hidden');
}

function setFormValue(id, value) {
  const field = document.getElementById(id);
  if (!field) return;
  if (field.type === 'checkbox') field.checked = Boolean(value);
  else field.value = value;
}

function elementSummary(key, entry) {
  return `${entry.enabled ? 'Ativado' : 'Desativado'} • ${labels[entry.style || 'circle'] || 'Círculo'} • ${entry.individual || key === 'voice' || key === 'radio' ? 'Separado' : 'No grupo'}`;
}

function renderElementsEditor(config) {
  const elements = config.elements || {};
  const orderedKeys = ['stamina', 'armor', 'health', 'hunger', 'thirst', 'oxygen', 'stress'];
  const blocked = ['voice', 'radio'];
  const keys = [...orderedKeys.filter((key) => elements[key]), ...Object.keys(elements).filter((key) => !orderedKeys.includes(key) && !blocked.includes(key))];
  dom.elementsEditor.innerHTML = keys.map((key) => {
    const entry = withElementDefaults(key, elements[key]);
    const expanded = state.selectedElement === key;
    const isVoice = key === 'voice' || key === 'radio';
    return `
      <div class="element-card ${expanded ? 'expanded' : ''} ${isVoice ? 'voice-card' : ''}" data-element="${key}" style="--item-accent:${entry.color}">
        <button class="element-card-head" type="button" data-select-element="${key}">
          <span class="element-icon-preview">${iconMap[entry.icon] || iconMap.heart}</span>
          <span><strong>${escapeHTML(entry.label)}${isVoice ? ' <em>aba voz</em>' : ''}</strong><small>${escapeHTML(elementSummary(key, entry))}</small></span>
          <input data-field="enabled" type="checkbox" ${entry.enabled ? 'checked' : ''} title="Ativado">
        </button>
        <div class="element-card-body">
          <div class="editor-mini-grid">
            <label><span>Ícone</span><select data-field="icon">${selectOptions.icon.map((icon) => `<option value="${icon}" ${icon === entry.icon ? 'selected' : ''}>${icon}</option>`).join('')}</select></label>
            <label><span>Posição rápida</span><select data-field="position">${selectOptions.itemPosition.map((position) => `<option value="${position}" ${position === entry.position ? 'selected' : ''}>${labels[position]}</option>`).join('')}</select></label>
          </div>
          <label><span>Formato</span><div class="style-options">${selectOptions.elementStyle.map((style) => `<button type="button" class="style-option ${style === (entry.style || 'circle') ? 'active' : ''}" data-style="${style}">${labels[style]}</button>`).join('')}</div><input data-field="style" type="hidden" value="${escapeHTML(entry.style || 'circle')}"></label>
          ${!isVoice ? `<label class="toggle-row"><span>Mover separado do grupo</span><input data-field="individual" type="checkbox" ${entry.individual ? 'checked' : ''}></label>` : `<input data-field="individual" type="hidden" value="true">`}
          <label class="toggle-row"><span>Posição livre em porcentagem</span><input data-field="free" type="checkbox" ${entry.free ? 'checked' : ''}></label>
          <div class="editor-mini-grid">
            <label><span>X (%)</span><input data-field="x" type="number" min="0" max="100" step="0.1" value="${entry.x}"></label>
            <label><span>Y (%)</span><input data-field="y" type="number" min="0" max="100" step="0.1" value="${entry.y}"></label>
          </div>
          <label><span>Cor</span><div class="color-line"><input data-field="color" type="color" value="${entry.color}"><input data-field="color_text" type="text" value="${escapeHTML(entry.color)}"></div><div class="preset-colors">${colorPresets.map((color) => `<button type="button" data-color-preset="${color}" style="--preset:${color}"></button>`).join('')}</div></label>
          <div class="editor-mini-grid">
            <label><span>Tamanho</span><input data-field="scale" type="range" min="50" max="180" value="${entry.scale}"></label>
            <label><span>Opacidade</span><input data-field="opacity" type="range" min="0" max="100" value="${entry.opacity}"></label>
          </div>
        </div>
      </div>`;
  }).join('');
}


function renderVoiceEditor(config) {
  if (!dom.voiceEditor) return;
  const elements = config.elements || {};
  const keys = ['voice', 'radio'].filter(function(key) { return elements[key]; });
  dom.voiceEditor.innerHTML = keys.map(function(key) {
    const entry = withElementDefaults(key, elements[key]);
    const opts = withCommsOptions(key, entry.comms_options || {});
    const expanded = state.selectedElement === key;
    const iconOptions = selectOptions.icon.map(function(icon) { return '<option value="' + icon + '" ' + (icon === entry.icon ? 'selected' : '') + '>' + icon + '</option>'; }).join('');
    const positionOptions = selectOptions.itemPosition.map(function(position) { return '<option value="' + position + '" ' + (position === entry.position ? 'selected' : '') + '>' + labels[position] + '</option>'; }).join('');
    const presets = colorPresets.map(function(color) { return '<button type="button" data-color-preset="' + color + '" style="--preset:' + color + '"></button>'; }).join('');
    const behavior = key === 'voice'
      ? '<div class="voice-options-box"><strong>Comportamento da voz</strong>' +
        '<label class="toggle-row"><span>Mostrar nome Voz</span><input data-comms-field="show_label" type="checkbox" ' + (opts.show_label ? 'checked' : '') + '></label>' +
        '<label class="toggle-row"><span>Mostrar Baixo/Normal/Alto</span><input data-comms-field="show_level_text" type="checkbox" ' + (opts.show_level_text ? 'checked' : '') + '></label>' +
        '<label class="toggle-row"><span>Mostrar Falando/Silêncio</span><input data-comms-field="show_talking_text" type="checkbox" ' + (opts.show_talking_text ? 'checked' : '') + '></label>' +
        '<label><span>Opacidade parado</span><input data-comms-field="inactive_opacity" type="range" min="25" max="100" value="' + (opts.inactive_opacity || 72) + '"></label></div>'
      : '<div class="voice-options-box"><strong>Comportamento do rádio</strong>' +
        '<label class="toggle-row"><span>Mostrar frequência/MHz</span><input data-comms-field="show_frequency" type="checkbox" ' + (opts.show_frequency ? 'checked' : '') + '></label>' +
        '<label class="toggle-row"><span>Aparecer mesmo desconectado</span><input data-comms-field="show_inactive" type="checkbox" ' + (opts.show_inactive ? 'checked' : '') + '></label>' +
        '<label class="toggle-row"><span>Mostrar estado falando/online</span><input data-comms-field="show_talking_text" type="checkbox" ' + (opts.show_talking_text ? 'checked' : '') + '></label>' +
        '<label><span>Texto desconectado</span><input data-comms-field="inactive_text" type="text" value="' + escapeHTML(opts.inactive_text || 'OFF') + '"></label>' +
        '<label><span>Sufixo da frequência</span><input data-comms-field="frequency_suffix" type="text" value="' + escapeHTML(opts.frequency_suffix || 'MHz') + '"></label></div>';
    return '<div class="element-card voice-card comms-card ' + (expanded ? 'expanded' : '') + '" data-element="' + key + '" style="--item-accent:' + entry.color + '">' +
      '<button class="element-card-head" type="button" data-select-element="' + key + '"><span class="element-icon-preview">' + (iconMap[entry.icon] || (key === 'radio' ? iconMap.radio : iconMap.mic)) + '</span><span><strong>' + escapeHTML(entry.label) + '</strong><small>Módulo próprio • ' + (key === 'radio' ? 'rádio/MHz' : 'voz 3 níveis') + '</small></span><input data-field="enabled" type="checkbox" ' + (entry.enabled ? 'checked' : '') + ' title="Ativado"></button>' +
      '<div class="element-card-body"><div class="editor-mini-grid"><label><span>Ícone</span><select data-field="icon">' + iconOptions + '</select></label><label><span>Posição rápida</span><select data-field="position">' + positionOptions + '</select></label></div>' +
      '<input data-field="style" type="hidden" value="comms"><input data-field="individual" type="hidden" value="true">' +
      '<label class="toggle-row"><span>Posição livre em porcentagem</span><input data-field="free" type="checkbox" ' + (entry.free ? 'checked' : '') + '></label>' +
      '<div class="editor-mini-grid"><label><span>X (%)</span><input data-field="x" type="number" min="0" max="100" step="0.1" value="' + entry.x + '"></label><label><span>Y (%)</span><input data-field="y" type="number" min="0" max="100" step="0.1" value="' + entry.y + '"></label></div>' +
      '<label><span>Cor principal</span><div class="color-line"><input data-field="color" type="color" value="' + entry.color + '"><input data-field="color_text" type="text" value="' + escapeHTML(entry.color) + '"></div><div class="preset-colors">' + presets + '</div></label>' +
      '<div class="editor-mini-grid"><label><span>Tamanho</span><input data-field="scale" type="range" min="50" max="180" value="' + entry.scale + '"></label><label><span>Opacidade</span><input data-field="opacity" type="range" min="0" max="100" value="' + entry.opacity + '"></label></div>' + behavior + '</div></div>';
  }).join('');
}

function populateEditor(config) {
  setFormValue('general-hud-position', config.general.minimap_position || config.general.hud_position || 'bottom-left');
  setFormValue('general-minimap-style', config.general.minimap_style);
  setFormValue('general-show-minimap', config.general.show_minimap);
  setFormValue('general-minimap-visibility', config.general.minimap_visibility || 'always');
  setFormValue('general-minimap-x', config.general.minimap_x ?? 24);
  setFormValue('general-minimap-y', config.general.minimap_y ?? 24);
  const statusGroup = withStatusGroupDefaults(config.general.status_group || {});
  setFormValue('status-group-enabled', statusGroup.enabled);
  setFormValue('status-group-position', statusGroup.position);
  setFormValue('status-group-free', statusGroup.free);
  setFormValue('status-group-x', statusGroup.x);
  setFormValue('status-group-y', statusGroup.y);
  setFormValue('status-group-scale', statusGroup.scale);
  setFormValue('status-group-opacity', statusGroup.opacity);
  setFormValue('status-group-gap', statusGroup.gap);
  setFormValue('general-global-opacity', config.general.global_opacity);
  setFormValue('general-scale', config.general.scale);
  setFormValue('speedometer-enabled', config.speedometer.enabled);
  config.speedometer = withSpeedometerDefaults(config.speedometer || {});
  setFormValue('speedometer-position', config.speedometer.position);
  setFormValue('speedometer-style', config.speedometer.style);
  setFormValue('speedometer-unit', config.speedometer.unit);
  setFormValue('speedometer-show-speed', config.speedometer.show_speed);
  setFormValue('speedometer-show-rpm', config.speedometer.show_rpm);
  setFormValue('speedometer-show-fuel', config.speedometer.show_fuel);
  setFormValue('speedometer-show-gear', config.speedometer.show_gear);
  setFormValue('speedometer-show-lights', config.speedometer.show_lights);
  setFormValue('speedometer-show-engine', config.speedometer.show_engine);
  setFormValue('speedometer-opacity', config.speedometer.opacity);
  setFormValue('speedometer-scale', config.speedometer.scale);
  setFormValue('speedometer-primary-color', config.speedometer.primary_color);
  setFormValue('speedometer-secondary-color', config.speedometer.secondary_color);
  setFormValue('speedometer-accent-color', config.speedometer.accent_color);
  setFormValue('speedometer-background-color', config.speedometer.background_color);
  setFormValue('logo-enabled', config.logo.enabled);
  setFormValue('logo-image-url', config.logo.image_url);
  setFormValue('logo-position', config.logo.position);
  setFormValue('logo-show-only-in-vehicle', config.logo.show_only_in_vehicle);
  setFormValue('logo-width', config.logo.width);
  setFormValue('logo-height', config.logo.height);
  setFormValue('logo-opacity', config.logo.opacity);
  renderElementsEditor(config);
  renderVoiceEditor(config);
}

function collectElementConfig() {
  const elements = {};
  [dom.elementsEditor, dom.voiceEditor].filter(Boolean).forEach((container) => {
    container.querySelectorAll('.element-card').forEach((card) => {
    const key = card.dataset.element;
    if (!key) return;
    elements[key] = {
      enabled: card.querySelector('[data-field="enabled"]').checked,
      label: state.config?.elements?.[key]?.label || key,
      icon: card.querySelector('[data-field="icon"]').value,
      style: card.querySelector('[data-field="style"]').value || 'circle',
      color: card.querySelector('[data-field="color_text"]').value,
      position: card.querySelector('[data-field="position"]').value || 'bottom-center',
      individual: card.querySelector('[data-field="individual"]')?.type === 'hidden' ? true : Boolean(card.querySelector('[data-field="individual"]')?.checked),
      free: card.querySelector('[data-field="free"]').checked,
      x: Number(card.querySelector('[data-field="x"]').value),
      y: Number(card.querySelector('[data-field="y"]').value),
      scale: Number(card.querySelector('[data-field="scale"]').value),
      opacity: Number(card.querySelector('[data-field="opacity"]').value),
    };
    const commsFields = card.querySelectorAll('[data-comms-field]');
    if (commsFields.length) {
      elements[key].comms_options = {};
      commsFields.forEach((field) => {
        const name = field.dataset.commsField;
        if (!name) return;
        if (field.type === 'checkbox') elements[key].comms_options[name] = field.checked;
        else if (field.type === 'range' || field.type === 'number') elements[key].comms_options[name] = Number(field.value);
        else elements[key].comms_options[name] = field.value;
      });
    } else if (state.config?.elements?.[key]?.comms_options) {
      elements[key].comms_options = state.config.elements[key].comms_options;
    }
    });
  });
  return elements;
}

function collectConfig() {
  return {
    general: {
      hud_position: document.getElementById('general-hud-position').value,
      minimap_position: document.getElementById('general-hud-position').value,
      minimap_style: document.getElementById('general-minimap-style').value,
      show_minimap: document.getElementById('general-show-minimap').checked,
      minimap_visibility: document.getElementById('general-minimap-visibility').value,
      minimap_x: Number(document.getElementById('general-minimap-x').value),
      minimap_y: Number(document.getElementById('general-minimap-y').value),
      status_group: {
        enabled: document.getElementById('status-group-enabled').checked,
        position: document.getElementById('status-group-position').value,
        free: document.getElementById('status-group-free').checked,
        x: Number(document.getElementById('status-group-x').value),
        y: Number(document.getElementById('status-group-y').value),
        scale: Number(document.getElementById('status-group-scale').value),
        opacity: Number(document.getElementById('status-group-opacity').value),
        gap: Number(document.getElementById('status-group-gap').value),
      },
      global_opacity: Number(document.getElementById('general-global-opacity').value),
      scale: Number(document.getElementById('general-scale').value),
    },
    speedometer: {
      enabled: document.getElementById('speedometer-enabled').checked,
      position: document.getElementById('speedometer-position').value,
      style: document.getElementById('speedometer-style').value,
      unit: document.getElementById('speedometer-unit').value,
      show_speed: document.getElementById('speedometer-show-speed').checked,
      show_rpm: document.getElementById('speedometer-show-rpm').checked,
      show_fuel: document.getElementById('speedometer-show-fuel').checked,
      show_gear: document.getElementById('speedometer-show-gear').checked,
      show_seatbelt: state.config?.speedometer?.show_seatbelt === true,
      show_lights: document.getElementById('speedometer-show-lights').checked,
      show_engine: document.getElementById('speedometer-show-engine').checked,
      opacity: Number(document.getElementById('speedometer-opacity').value),
      scale: Number(document.getElementById('speedometer-scale').value),
      primary_color: document.getElementById('speedometer-primary-color').value,
      secondary_color: document.getElementById('speedometer-secondary-color').value,
      accent_color: document.getElementById('speedometer-accent-color').value,
      background_color: document.getElementById('speedometer-background-color').value,
    },
    logo: {
      enabled: document.getElementById('logo-enabled').checked,
      image_url: document.getElementById('logo-image-url').value.trim(),
      position: document.getElementById('logo-position').value,
      show_only_in_vehicle: document.getElementById('logo-show-only-in-vehicle').checked,
      width: Number(document.getElementById('logo-width').value),
      height: Number(document.getElementById('logo-height').value),
      opacity: Number(document.getElementById('logo-opacity').value),
    },
    elements: collectElementConfig(),
  };
}

function applyEditorPreview() {
  if (!state.editorOpen) return;
  state.config = collectConfig();
  state.vehicle.visible = true;
  renderHud();
}

function openEditor(config) {
  if (!state.canManage || !config) return;
  state.editorOpen = true;
  state.realVehicleVisible = state.vehicle.visible;
  state.vehicle.visible = true;
  state.status = { ...state.status, voice: state.status.voice || 66, voiceLabel: state.status.voiceLabel || 'Normal', radioActive: state.status.radioActive || true, radioChannel: state.status.radioChannel || 91.7 };
  state.config = normalizeConfig(deepClone(config));
  dom.editorOverlay.classList.remove('hidden');
  dom.hudRoot.classList.add('editor-preview-mode');
  populateEditor(state.config);
  renderHud();
}

function closeEditor() {
  state.editorOpen = false;
  state.vehicle.visible = state.realVehicleVisible;
  dom.editorOverlay.classList.add('hidden');
  dom.hudRoot.classList.remove('editor-preview-mode');
  renderHud();
}

function bindActions() {
  dom.closeEditor.addEventListener('click', () => nui('closeEditor'));
  dom.saveConfig.addEventListener('click', () => nui('saveConfig', { config: collectConfig() }));
  dom.resetConfig.addEventListener('click', () => nui('resetConfig'));
  dom.previewNotify.addEventListener('click', () => nui('notifyPreview', { type: 'inform', description: 'Preview local do editor da HUD.' }));

  dom.editorOverlay.addEventListener('input', (event) => {
    const target = event.target;
    if (target?.dataset?.field === 'color') {
      const text = target.closest('.element-card')?.querySelector('[data-field="color_text"]');
      if (text) text.value = target.value;
    }
    if (target?.dataset?.field === 'color_text') {
      const picker = target.closest('.element-card')?.querySelector('[data-field="color"]');
      if (picker && /^#[0-9a-fA-F]{6}$/.test(target.value)) picker.value = target.value;
    }
    applyEditorPreview();
  });

  dom.editorOverlay.addEventListener('change', (event) => {
    const target = event.target;
    if (target && target.id === 'general-hud-position') {
      applyMinimapQuickPosition(target.value);
    }
    if (target && target.id === 'status-group-position') {
      applyStatusGroupQuickPosition(target.value);
    }
    applyEditorPreview();
  });

  dom.editorOverlay.addEventListener('click', (event) => {
    const elementButton = event.target.closest('[data-select-element]');
    if (elementButton) {
      state.selectedElement = elementButton.dataset.selectElement;
      state.config = collectConfig();
      renderElementsEditor(state.config);
      renderVoiceEditor(state.config);
      renderHud();
      return;
    }
    const styleButton = event.target.closest('[data-style]');
    if (styleButton) {
      const card = styleButton.closest('.element-card');
      card.querySelector('[data-field="style"]').value = styleButton.dataset.style;
      card.querySelectorAll('.style-option').forEach((btn) => btn.classList.toggle('active', btn === styleButton));
      applyEditorPreview();
      return;
    }
    const colorPreset = event.target.closest('[data-color-preset]');
    if (colorPreset) {
      const card = colorPreset.closest('.element-card');
      const color = colorPreset.dataset.colorPreset;
      card.querySelector('[data-field="color"]').value = color;
      card.querySelector('[data-field="color_text"]').value = color;
      applyEditorPreview();
      return;
    }
    const speedTheme = event.target.closest('[data-speed-theme]');
    if (speedTheme) {
      const theme = speedometerThemes[speedTheme.dataset.speedTheme];
      if (theme) {
        setFormValue('speedometer-primary-color', theme.primary_color);
        setFormValue('speedometer-secondary-color', theme.secondary_color);
        setFormValue('speedometer-accent-color', theme.accent_color);
        setFormValue('speedometer-background-color', theme.background_color);
        applyEditorPreview();
      }
    }
  });

  dom.hudRoot.addEventListener('click', (event) => {
    if (!state.editorOpen) return;
    const item = event.target.closest('[data-hud-select]');
    if (item) {
      state.selectedElement = item.dataset.hudSelect;
      state.config = collectConfig();
      renderElementsEditor(state.config);
      renderVoiceEditor(state.config);
      renderHud();
    }
  });
}

function handleMessage(event) {
  const data = event.data || {};
  if (data.action === 'bootstrap') {
    state.config = normalizeConfig(data.config);
    state.canManage = Boolean(data.canManage);
    state.hudVisible = data.hudVisible !== false;
    state.speedometerVisible = data.speedometerVisible !== false;
    markUIReady();
    renderHud();
    return;
  }
  if (data.action === 'applyConfig') {
    state.config = normalizeConfig(data.config);
    renderHud();
    return;
  }
  if (data.action === 'updateStatus') {
    state.status = { ...state.status, ...(data.status || {}) };
    renderHud();
    return;
  }
  if (data.action === 'updateVehicle') {
    const incoming = data.vehicle || {};
    if (!state.editorOpen) {
      state.vehicle = { ...state.vehicle, ...incoming };
      state.realVehicleVisible = state.vehicle.visible;
    }
    renderSpeedometer();
    renderLogo();
    applyVisibility();
    return;
  }
  if (data.action === 'setHudVisible') {
    state.hudVisible = Boolean(data.visible);
    applyVisibility();
    return;
  }
  if (data.action === 'setSpeedometerVisible') {
    state.speedometerVisible = Boolean(data.visible);
    applyVisibility();
    return;
  }
  if (data.action === 'openEditor') {
    state.config = normalizeConfig(data.config || state.config);
    state.canManage = Boolean(data.canManage ?? state.canManage);
    openEditor(state.config);
    return;
  }
  if (data.action === 'closeEditor') closeEditor();
}

window.addEventListener('message', handleMessage);
window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.style.background = 'transparent';
  document.body.style.background = 'transparent';
  cacheStaticOptions();
  bindActions();
  nui('ready');
});
