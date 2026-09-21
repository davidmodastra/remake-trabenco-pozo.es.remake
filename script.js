const menuBtn=document.querySelector('.menu-btn'),menu=document.querySelector('.menu');
menuBtn?.addEventListener('click',()=>menu.classList.toggle('open'));
document.querySelectorAll('.menu a').forEach(a=>a.addEventListener('click',()=>menu.classList.remove('open')));
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});
document.querySelectorAll('.stage-card,.news-card,.manifesto-list>div').forEach(el=>observer.observe(el));
