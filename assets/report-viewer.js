/* Report viewer: opens report page images; blurred pages offer "request full report" */
(function(){
  var b=document.getElementById('lpBox');if(!b)return;
  var im=b.querySelector('img'),cap=b.querySelector('.cap'),group=[],i=0;
  function show(n){i=(n+group.length)%group.length;var btn=group[i];im.src=btn.querySelector('img').src;
    var locked=btn.getAttribute('data-locked')==='1';cap.style.display=locked?'block':'none';b.classList.add('on')}
  document.querySelectorAll('.lp-rep').forEach(function(g){
    var btns=g.querySelectorAll('button');
    btns.forEach(function(x,k){x.onclick=function(){group=[].slice.call(btns);show(k)}});
  });
  b.querySelector('.x').onclick=function(){b.classList.remove('on')};
  b.querySelector('.p').onclick=function(){show(i-1)};b.querySelector('.n').onclick=function(){show(i+1)};
  b.onclick=function(e){if(e.target===b)b.classList.remove('on')};
  document.addEventListener('keydown',function(e){if(!b.classList.contains('on'))return;if(e.key==='Escape')b.classList.remove('on');if(e.key==='ArrowRight')show(i+1);if(e.key==='ArrowLeft')show(i-1)});
  window.masloRequestFull=function(label){
    b.classList.remove('on');
    var c=document.getElementById('contact');if(!c)return;
    var f=c.querySelector('form');
    if(f){var h=f.querySelector('input[name=interest]');if(h)h.value=label||'Full sample report request';
      var s=f.querySelector('input[name=_subject]');if(s)s.value='Full sample report request - '+(label||'')+' (masloconsulting.com)';}
    c.scrollIntoView({behavior:'smooth',block:'start'});
    if(window.gtag)gtag('event','full_report_request_click',{report:label});
    var inp=f&&f.querySelector('input[type=text]');if(inp)setTimeout(function(){inp.focus({preventScroll:true})},600);
  };
})();
