const $ = (s) => document.querySelector(s);
let devices = [];
const money = (n) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Math.max(0,n));
const fmt = (n) => Number(n || 0).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2});
const tariff = () => Math.max(0, Number($('#tariff').value) || 0);
function deviceKwh(d, hours=d.hours) { return d.watt * d.qty * hours * 30 / 1000; }
function totalEnergy(list=devices) { return list.reduce((sum,d)=>sum+deviceKwh(d),0); }
function getRules(d) {
  const dailyKwh = d.watt*d.qty*d.hours/1000;
  const results = [];
  if (d.hours >= 8) results.push({title:`Evaluasi durasi ${d.name}`,desc:`Perangkat digunakan sekitar ${d.hours} jam per hari. Tinjau apakah durasi tersebut bisa dikurangi saat tidak diperlukan.`,cut:0.15,reason:'Pengurangan durasi pemakaian'});
  if (d.watt >= 500 && d.hours >= 3) results.push({title:`Atur pemakaian ${d.name}`,desc:`Daya perangkat relatif besar (${d.watt} W). Gunakan seperlunya dan hindari menyalakan saat tidak dibutuhkan.`,cut:0.10,reason:'Optimasi pemakaian perangkat berdaya besar'});
  if (/lampu|light/i.test(d.name) && d.hours >= 5) results.push({title:'Matikan lampu saat ruangan kosong',desc:'Manfaatkan cahaya alami pada siang hari dan matikan lampu di area yang tidak digunakan.',cut:0.20,reason:'Kebiasaan penggunaan lampu'});
  if (/ac|air conditioner|pendingin/i.test(d.name)) results.push({title:'Gunakan AC dengan bijak',desc:'Atur suhu nyaman, tutup pintu dan jendela, serta bersihkan filter secara berkala.',cut:0.12,reason:'Penggunaan pendingin ruangan'});
  if (/tv|televisi|monitor|komputer|pc|laptop/i.test(d.name)) results.push({title:`Kurangi waktu siaga ${d.name}`,desc:'Matikan perangkat sepenuhnya atau gunakan mode hemat daya ketika tidak dipakai.',cut:0.08,reason:'Mengurangi pemakaian saat tidak aktif'});
  if (!results.length && d.hours > 0) results.push({title:`Pantau pola penggunaan ${d.name}`,desc:'Catat durasi pemakaian dan matikan perangkat ketika tidak diperlukan untuk menghindari konsumsi yang tidak perlu.',cut:0.05,reason:'Pemantauan kebiasaan harian'});
  return results.map(r=>({...r,kwh:deviceKwh(d)*r.cut,deviceId:d.id}));
}
function recommendations() {
  return devices.flatMap(getRules).sort((a,b)=>b.kwh-a.kwh).slice(0,5);
}
function renderDevices() {
  $('#deviceCount').textContent = devices.length;
  $('#listCounter').textContent = `${devices.length} ITEM`;
  if (!devices.length) {
    $('#deviceList').innerHTML = '<div class="empty-state"><span>ϟ</span><b>Belum ada perangkat</b><small>Tambahkan perangkat atau muat contoh data.</small></div>';
    return;
  }
  $('#deviceList').innerHTML = devices.map(d=>`<div class="device-item"><div><b>${escapeHtml(d.name)}</b><small>${d.watt} W · ${d.qty} unit · ${d.hours} jam/hari</small></div><div class="energy">${fmt(deviceKwh(d))}<small>kWh/bln</small></div><button class="remove-device" type="button" data-remove="${d.id}" aria-label="Hapus ${escapeHtml(d.name)}">×</button></div>`).join('');
  $('#deviceList').querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{devices=devices.filter(d=>d.id!==Number(btn.dataset.remove));update();}));
}
function escapeHtml(str) { return String(str).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function update() {
  const kwh = totalEnergy();
  const cost = kwh*tariff();
  const recs = recommendations();
  const savedKwh = recs.reduce((s,r)=>s+r.kwh,0);
  const safeSaved = Math.min(kwh,savedKwh);
  const afterKwh = Math.max(0,kwh-safeSaved);
  const savedCost = safeSaved*tariff();
  $('#totalKwh').textContent=fmt(kwh);
  $('#heroKwh').innerHTML=`${fmt(kwh)} <small>kWh/bln</small>`;
  $('#totalCost').textContent=money(cost);
  $('#potentialSave').textContent=money(savedCost);
  $('#beforeCost').textContent=money(cost);
  $('#beforeEnergy').textContent=`${fmt(kwh)} kWh/bln`;
  $('#afterCost').textContent=money(afterKwh*tariff());
  $('#afterEnergy').textContent=`${fmt(afterKwh)} kWh/bln`;
  const pct=kwh>0?safeSaved/kwh*100:0;
  $('#savingPercent').textContent=`${Math.round(pct)}%`;
  $('#savingBar').style.width=`${Math.min(100,pct)}%`;
  $('#savingAmount').textContent=money(savedCost);
  renderDevices();
  $('#recommendationSubtitle').textContent=recs.length?`${recs.length} saran prioritas dari aturan sistem`:'Tambahkan perangkat untuk melihat saran.';
  $('#recommendationList').innerHTML=recs.length?recs.map((r,i)=>`<article class="recommendation"><div class="recommendation-icon">${['☼','↘','⌁','ϟ','✓'][i%5]}</div><div><h4>${escapeHtml(r.title)}</h4><p>${escapeHtml(r.desc)}</p><span class="saving-hint">Potensi simulasi: ${fmt(r.kwh)} kWh/bln</span></div></article>`).join(''):'<div class="empty-recs">Rekomendasi akan muncul setelah kamu memasukkan data perangkat.</div>';
}
$('#deviceForm').addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('#deviceName').value.trim(),watt=Number($('#deviceWatt').value),qty=Number($('#deviceQty').value),hours=Number($('#deviceHours').value);
  if(!name||!Number.isFinite(watt)||!Number.isFinite(qty)||!Number.isFinite(hours)||watt<=0||qty<1||hours<=0||hours>24){alert('Periksa kembali nama, daya, jumlah unit, dan jam pemakaian.');return;}
  devices.push({id:Date.now()+Math.floor(Math.random()*1000),name,watt,qty,hours});
  e.target.reset();$('#deviceQty').value=1;update();
});
$('#tariff').addEventListener('input',update);
$('#clearAll').addEventListener('click',()=>{devices=[];update();});
$('#loadExample').addEventListener('click',()=>{devices=[{id:1,name:'Lampu LED',watt:10,qty:5,hours:6},{id:2,name:'Televisi',watt:90,qty:1,hours:5},{id:3,name:'Kipas angin',watt:45,qty:2,hours:8},{id:4,name:'AC',watt:750,qty:1,hours:6}];update();});
$('#year').textContent=new Date().getFullYear();
update();
