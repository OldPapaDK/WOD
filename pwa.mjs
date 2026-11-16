const $ = id => document.getElementById(id);
const installed = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
let installPrompt, registration, updateRequested = false;
const toolbar = document.createElement('section');
toolbar.className = 'app-toolbar';
toolbar.setAttribute('aria-label', 'App og forbindelse');
const status = document.createElement('span');status.className = 'app-connection';status.setAttribute('role', 'status');
const install = document.createElement('button');install.className = 'install-app';install.textContent = 'Installér app';
const update = document.createElement('button');update.className = 'update-app';update.hidden = true;update.textContent = 'Opdatér app';
toolbar.append(status, update, install);document.querySelector('header').after(toolbar);
function connection() {status.textContent = navigator.onLine ? 'DIN TIMER. KLAR TIL TRÆNING.' : 'Offline · timeren virker. Feedback og statistik kræver internet.';status.classList.toggle('offline', !navigator.onLine);}
connection();window.addEventListener('online', connection);window.addEventListener('offline', connection);
function installedState() {install.hidden = installed();document.documentElement.classList.toggle('installed-app', installed());}
installedState();matchMedia('(display-mode: standalone)').addEventListener('change', installedState);
window.addEventListener('beforeinstallprompt', event => {event.preventDefault();installPrompt = event;installedState();});
window.addEventListener('appinstalled', () => {installPrompt = null;install.hidden = true;});
function installHelp() {
 const dialog=document.createElement('dialog');dialog.className='install-help';dialog.setAttribute('aria-label','Installér WOD Timer');
 const title=document.createElement('h2');title.textContent='WOD Timer på din hjemmeskærm';
 const text=document.createElement('p');text.textContent='Åbn denne side i din almindelige browser, hvis du er inde i en anden app.';
 const android=document.createElement('p');android.textContent='Android: Åbn siden i Chrome. Tryk på de tre prikker og vælg “Installér app” eller “Føj til startskærm”. I Samsung Internet ligger valget typisk i browserens menu.';
 const ios=document.createElement('p');ios.textContent='iPhone: Åbn siden i Safari. Tryk Del og vælg “Føj til hjemmeskærm”. Slå “Åbn som webapp” til, hvis valget vises, og tryk Tilføj.';
 const note=document.createElement('p');note.className='hint';note.textContent='Åbn timeren online første gang, så den kan gøres klar til offlinebrug. Gemte workouts ligger på denne enhed. På iPhone kan den installerede app have separat lagring fra Safari.';
 const close=document.createElement('button');close.className='primary';close.textContent='Forstået';close.onclick=()=>dialog.close();dialog.append(title,text,android,ios,note,close);document.body.append(dialog);dialog.onclose=()=>dialog.remove();dialog.showModal();
}
install.onclick=async()=>{if(!installPrompt){installHelp();return;}const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();const choice=await prompt.userChoice;if(choice.outcome==='accepted')install.hidden=true;}catch{installHelp();}};
const activeWorkout=()=>Boolean($('pause')&&!$('pause').disabled);
function updateState(){if(!registration?.waiting||!navigator.serviceWorker.controller){update.hidden=true;return;}update.hidden=false;update.disabled=activeWorkout();update.textContent=activeWorkout()?'Opdatering klar efter træning':'Opdatér app';}
update.onclick=()=>{if(activeWorkout()||!registration?.waiting)return;updateRequested=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});};
new MutationObserver(updateState).observe($('pause'),{attributes:true,attributeFilter:['disabled']});
if('serviceWorker' in navigator){
 navigator.serviceWorker.addEventListener('controllerchange',()=>{updateState();if(updateRequested&&!activeWorkout())location.reload();});
 navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(reg=>{registration=reg;updateState();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{updateState();});});}).catch(()=>{if(navigator.onLine)status.textContent='Timer klar · offlinebrug kunne ikke klargøres. Prøv at genindlæse.';});
}
// Touch navigation gives the phone its own app layout, without changing saved workouts.
const tabs=document.createElement('nav');tabs.className='app-tabs';tabs.setAttribute('aria-label','Appnavigation');
for(const [view,label] of [['timer','Timer'],['workout','Workout'],['saved','Gemte']]){const button=document.createElement('button');button.textContent=label;button.dataset.view=view;button.onclick=()=>setView(view);tabs.append(button);}document.body.append(tabs);
function setView(view){document.body.dataset.appView=view;for(const button of tabs.children)button.setAttribute('aria-pressed',String(button.dataset.view===view));if(matchMedia('(max-width: 850px)').matches){window.scrollTo({top:0,behavior:'instant'});}}
setView('timer');
new MutationObserver(()=>{if(activeWorkout()&&document.body.dataset.appView!=='timer')setView('timer');}).observe($('pause'),{attributes:true,attributeFilter:['disabled']});
const quickActions=document.createElement('div');quickActions.className='mobile-start-actions';
const quickStart=document.createElement('button');quickStart.className='primary';quickStart.textContent='START WORKOUT';quickStart.onclick=()=>$('start').click();
const customize=document.createElement('button');customize.textContent='Tilpas workout';customize.onclick=()=>setView('workout');quickActions.append(quickStart,customize);document.querySelector('.controls').before(quickActions);
function quickState(){quickActions.hidden=activeWorkout();}quickState();new MutationObserver(quickState).observe($('pause'),{attributes:true,attributeFilter:['disabled']});
$('saved').addEventListener('click',event=>{const button=event.target.closest('button');if(button&&!button.disabled&&button.textContent!=='Slet'&&!activeWorkout())setView('workout');});
