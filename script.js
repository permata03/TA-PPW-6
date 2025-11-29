const API_KEY = '3f29404d0308fdbce132f3509341645b';
const GEO_LIMIT = 6;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
let currentUnit = 'metric'; 
let autoUpdateTimer = null;
let currentLocation = null; 
let isDark = false;

const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const searchBtn = document.getElementById('searchBtn');
const loadingCurrent = document.getElementById('loadingCurrent');
const currentContent = document.getElementById('currentContent');
const currentError = document.getElementById('currentError');
const locNameEl = document.getElementById('locName');
const timestampEl = document.getElementById('timestamp');
const weatherIcon = document.getElementById('weatherIcon');
const tempEl = document.getElementById('temp');
const condEl = document.getElementById('cond');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const feelsEl = document.getElementById('feels');

const loadingForecast = document.getElementById('loadingForecast');
const forecastList = document.getElementById('forecastList');
const forecastError = document.getElementById('forecastError');

const activityLog = document.getElementById('activityLog');
const refreshBtn = document.getElementById('refreshBtn');
const unitToggle = document.getElementById('unitToggle');
const themeToggle = document.getElementById('themeToggle');

const favoritesDiv = document.getElementById('favorites');
const saveFavBtn = document.getElementById('saveFav');
const favNameInput = document.getElementById('favName');

function logActivity(msg){
  const time = new Date().toLocaleTimeString();
  const el = document.createElement('div');
  el.textContent = `[${time}] ${msg}`;
  activityLog.prepend(el);
}

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }
function setError(el, msg){
  el.textContent = msg; show(el);
}
function clearError(el){ el.textContent=''; hide(el); }
function kelvinTo(unit, k){ 
  if(unit === 'metric') return Math.round(k - 273.15);
  return Math.round((k - 273.15) * 9/5 + 32);
}
function formatTemp(v){
  return `${Math.round(v)}°${currentUnit === 'metric' ? 'C' : 'F'}`;
}

let debounceTimer = null;
searchInput.addEventListener('input', e=>{
  const q = e.target.value.trim();
  if(debounceTimer) clearTimeout(debounceTimer);
  if(!q){ suggestions.innerHTML=''; return; }
  debounceTimer = setTimeout(()=> fetchGeoSuggest(q), 350);
});
async function fetchGeoSuggest(query){
  try{
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${GEO_LIMIT}&appid=${API_KEY}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();
    suggestions.innerHTML = '';
    list.forEach(item=>{
      const label = `${item.name}${item.state ? ', '+item.state : ''}, ${item.country}`;
      const opt = document.createElement('option');
      opt.value = label;
      suggestions.appendChild(opt);
    });
  }catch(err){
    logActivity('Autocomplete error: '+err.message);
  }
}

async function getCoordinates(city) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Geocode failed");

    const data = await response.json();
    if (data.length === 0) throw new Error("City not found");

    return {
        lat: data[0].lat,
        lon: data[0].lon
    };
}

async function fetchCurrent(lat, lon){
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`;
  const r = await fetch(url);
  if(!r.ok) throw new Error('Current weather fetch failed');
  return await r.json();
}
async function fetchForecast(lat, lon){
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${currentUnit}&appid=${API_KEY}`;
  const r = await fetch(url);
  if(!r.ok) throw new Error('Forecast fetch failed');
  return await r.json();
}


function showCurrent(data, name){
  hide(loadingCurrent); clearError(currentError);
  show(currentContent);
  locNameEl.textContent = name || `${data.name}, ${data.sys?.country || ''}`;
  const ts = new Date(data.dt * 1000);
  timestampEl.textContent = ts.toLocaleString();
  const icon = data.weather?.[0]?.icon;
  if(icon){
    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIcon.alt = data.weather?.[0]?.description || 'weather';
  }
  tempEl.textContent = formatTemp(data.main.temp);
  condEl.textContent = data.weather?.[0]?.description || '-';
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${data.wind.speed} m/s`;
  feelsEl.textContent = formatTemp(data.main.feels_like);
}
function showForecast(data){
  hide(loadingForecast); 
  clearError(forecastError);
  forecastList.innerHTML = '';

  // data.list berisi 3 jam sekali, saya ambil 1 data per hari
  const dailyMap = {};

  data.list.forEach(entry => {
    const date = entry.dt_txt.split(" ")[0];
    if (!dailyMap[date]) {
      dailyMap[date] = entry;
    }
  });

  const days = Object.values(dailyMap).slice(0, 5);

  days.forEach(d => {
    const date = new Date(d.dt * 1000);
    const icon = d.weather[0].icon;

    const item = document.createElement('div');
    item.className = 'forecast-item';

    item.innerHTML = `
      <div class="date">${date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</div>
      <div class="icon"><img src="https://openweathermap.org/img/wn/${icon}.png"></div>
      <div class="desc">${d.weather[0].description}</div>
      <div class="temps">${Math.round(d.main.temp_min)} / ${Math.round(d.main.temp_max)}°</div>
    `;

    forecastList.appendChild(item);
  });
}

//Workflow: search / load 
async function loadByQuery(q, saveToHistory = true){
  try{
    hide(currentContent); hide(forecastList);
    show(loadingCurrent); show(loadingForecast);
    clearError(currentError); clearError(forecastError);
    logActivity('Mencari: '+q);

    const coords = await getCoordinates(q);
    coords.name = q;

    currentLocation = coords;

    const [cur, fc] = await Promise.all([
      fetchCurrent(coords.lat, coords.lon),
      fetchForecast(coords.lat, coords.lon)
    ]);

    showCurrent(cur, coords.name);
    showForecast(fc);

    logActivity('Sukses memuat cuaca untuk ' + coords.name);
    restartAutoUpdate();

  }catch(err){
    hide(loadingCurrent); hide(loadingForecast);
    setError(currentError, 'Gagal memuat: ' + err.message);
    setError(forecastError, 'Gagal memuat forecast: ' + err.message);
    logActivity('Error: ' + err.message);
  }
}

searchBtn.addEventListener('click', ()=> {
  const q = searchInput.value.trim();
  if(!q) return;
  loadByQuery(q);
});
searchInput.addEventListener('keydown', e=>{
  if(e.key === 'Enter'){ searchBtn.click(); }
});

//Favorites (localStorage)
const FAV_KEY = 'permata_weather_favs';
function loadFavorites(){
  const raw = localStorage.getItem(FAV_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveFavorites(list){
  localStorage.setItem(FAV_KEY, JSON.stringify(list));
  renderFavorites();
}
function renderFavorites(){
  const list = loadFavorites();
  favoritesDiv.innerHTML = '';
  list.forEach(f=>{
    const el = document.createElement('div');
    el.className = 'favorite-pill';
    el.textContent = f.label || f.name;
    el.onclick = ()=> loadByQuery(f.name);
    const del = document.createElement('button');
    del.textContent='✖'; del.style.marginLeft='8px'; del.onclick = (e)=>{
      e.stopPropagation();
      const filtered = list.filter(x=>x.name !== f.name);
      saveFavorites(filtered);
    };
    el.appendChild(del);
    favoritesDiv.appendChild(el);
  });
}
saveFavBtn.addEventListener('click', ()=>{
  const list = loadFavorites();
  if(!currentLocation) return alert('Pilih dulu kota yang ingin disimpan.');
  const label = favNameInput.value.trim() || currentLocation.name;
  if(list.some(x=>x.name === currentLocation.name)) { alert('Kota sudah ada di favorit'); return; }
  list.push({name: currentLocation.name, label});
  saveFavorites(list);
  favNameInput.value = '';
  logActivity('Simpan favorit: ' + currentLocation.name);
});

//Toggle (C/F)
unitToggle.addEventListener('click', ()=>{
  if(currentUnit === 'metric'){ currentUnit = 'imperial'; unitToggle.textContent = '°F'; }
  else { currentUnit = 'metric'; unitToggle.textContent = '°C'; }
  logActivity('Satuan diubah ke ' + currentUnit);
  if(currentLocation) loadByQuery(currentLocation.name);
});

themeToggle.addEventListener('click', ()=>{
  isDark = !isDark;
  document.body.classList.toggle('dark', isDark);
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  logActivity('Theme toggled: ' + (isDark ? 'dark' : 'light'));
});

refreshBtn.addEventListener('click', ()=> {
  if(currentLocation) loadByQuery(currentLocation.name);
  else logActivity('Tidak ada lokasi aktif untuk refresh');
});

function restartAutoUpdate(){
  if(autoUpdateTimer) clearInterval(autoUpdateTimer);
  autoUpdateTimer = setInterval(()=> {
    if(currentLocation){
      logActivity('Auto-update cuaca (interval 5 menit)');
      loadByQuery(currentLocation.name, false);
    }
  }, REFRESH_INTERVAL_MS);
}

(function init(){
  renderFavorites();
  logActivity('PermataWeather inisialisasi');
  const last = localStorage.getItem('permata_last_loc');
  if(last){
    try{
      const parsed = JSON.parse(last);
      loadByQuery(parsed.name);
    }catch(e){}
  }
})();
