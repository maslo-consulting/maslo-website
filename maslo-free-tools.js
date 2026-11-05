/* Upsell helper used by the check pages */
window.masloPick=function(v){var s=document.querySelector('select[name=interest]');if(s)s.value=v;document.querySelectorAll('.up-opt').forEach(function(b){b.style.outline=(b.getAttribute('data-v')===v)?'3px solid #C9A84C':'none'});var f=s&&s.form;if(f){f.scrollIntoView({behavior:'smooth',block:'center'});var i=f.querySelector('input');if(i)setTimeout(function(){i.focus({preventScroll:true})},500)}if(window.gtag)gtag('event','upsell_pick',{choice:v})};
/* Maslo free-tools nudge: small, dismissible card; shows once per few days, never on the tool pages. */
(function(){
  var p=location.pathname;
  if(/maslo-posh-audit-page|maslo-labour-codes-check-page|maslo-hr-maturity-check-page/.test(p)){try{localStorage.setItem('maslo_ft_taken','1')}catch(e){}return;}
  var ls={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  var until=+ls.get('maslo_ft_until')||0; if(Date.now()<until) return;
  var m=new Date().getMonth(); /* Nov/Dec: POSH year-end first */
  var posh={h:'/maslo-posh-audit-page.html',t:'Year-end POSH check',s:'12 questions · 3 min · is your ICC audit-ready?',c:'#C9A84C'};
  var lab={h:'/maslo-labour-codes-check-page.html',t:'New Labour Codes check',s:'12 cards · 3 min · find your compliance gaps',c:'#3b82f6'};
  var hr={h:'/maslo-hr-maturity-check-page.html',t:'HR maturity check',s:'10 cards · 3 min · how mature is your HR?',c:'#16a06a'};
  var list=(m>=9&&m<=11)?[posh,lab]:[lab,posh];
  list.push(hr);
  var css='#mftBox{position:fixed;left:18px;bottom:20px;width:300px;max-width:calc(100vw - 100px);z-index:900;background:#0B1F3A;border:1px solid rgba(201,168,76,.5);border-radius:12px;box-shadow:0 12px 36px rgba(0,0,0,.3);font-family:"DM Sans",sans-serif;color:#fff;padding:14px 14px 12px;transform:translateY(30px);opacity:0;transition:all .45s cubic-bezier(.2,.8,.2,1)}#mftBox.on{transform:none;opacity:1}#mftBox h4{font-family:"Cormorant Garamond",serif;font-size:19px;font-weight:600;margin:0 22px 8px 0;color:#fff}#mftBox a.r{display:block;text-decoration:none;color:#fff;background:rgba(255,255,255,.06);border-left:3px solid var(--c);border-radius:6px;padding:8px 10px;margin-bottom:6px}#mftBox a.r:hover{background:rgba(255,255,255,.12)}#mftBox a.r b{display:block;font-size:13px;font-weight:500}#mftBox a.r span{font-size:11px;color:rgba(255,255,255,.6)}#mftBox .x{position:absolute;top:8px;right:10px;background:none;border:none;color:rgba(255,255,255,.6);font-size:20px;cursor:pointer;line-height:1}#mftBox .n{background:none;border:none;color:rgba(255,255,255,.5);font-size:11px;cursor:pointer;padding:2px 0;font-family:inherit}@media(max-width:600px){#mftBox{left:10px;bottom:14px;width:auto;right:84px;max-width:none}}';
  function show(){
    if(document.getElementById('mftBox'))return;
    var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
    var b=document.createElement('div');b.id='mftBox';b.setAttribute('role','complementary');b.setAttribute('aria-label','Free compliance checks');
    b.innerHTML='<button class="x" aria-label="Close">×</button><h4>Free 3-minute checks</h4>'+list.map(function(x){return '<a class="r" style="--c:'+x.c+'" href="'+x.h+'" data-ft="'+x.t+'"><b>'+x.t+' →</b><span>'+x.s+'</span></a>'}).join('')+'<button class="n">Not now</button>';
    document.body.appendChild(b);setTimeout(function(){b.classList.add('on')},30);
    function close(days){b.classList.remove('on');setTimeout(function(){b.remove()},500);ls.set('maslo_ft_until',String(Date.now()+days*864e5))}
    b.querySelector('.x').onclick=function(){close(7)};b.querySelector('.n').onclick=function(){close(3)};
    b.querySelectorAll('a.r').forEach(function(a){a.addEventListener('click',function(){ls.set('maslo_ft_until',String(Date.now()+7*864e5));if(window.gtag)gtag('event','free_tool_popup_click',{tool:a.getAttribute('data-ft')})})});
    if(window.gtag)gtag('event','free_tool_popup_view');
  }
  var fired=false;function go(){if(fired)return;fired=true;show()}
  setTimeout(go,12000);
  window.addEventListener('scroll',function(){var h=document.documentElement;if(h.scrollTop/(h.scrollHeight-h.clientHeight)>0.35)go()},{passive:true});
})();
