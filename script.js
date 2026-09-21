const menuBtn = document.querySelector('.menu-btn');
const menu = document.querySelector('.menu');
const newsList = document.querySelector('#news-list');
const contactForm = document.querySelector('#contact-form');

menuBtn?.addEventListener('click', () => {
	const isOpen = menu.classList.toggle('open');
	menuBtn.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.menu a').forEach((link) => link.addEventListener('click', () => menu.classList.remove('open')));

const fallbackNews = [
	{
		category: 'FP · 08 SEPTIEMBRE 2026',
		title: '¡Ya estamos de vuelta en FP!',
		excerpt: 'El Ciclo Formativo de Grado Básico de Servicios Comerciales comienza un nuevo curso.',
		image: 'https://trabenco-pozo.es/wp-content/uploads/2026/09/Cartel-Exterior-Horario-Comercial-Simple-Amarillo-Negro-.png',
		url: 'https://trabenco-pozo.es/%f0%9f%93%9a-ya-estamos-de-vuelta-en-fp/'
	},
	{
		category: 'COLEGIO · JUNIO 2026',
		title: '¡Hasta la vuelta!',
		excerpt: 'Un curso lleno de aprendizajes, retos, proyectos compartidos y momentos especiales.',
		image: 'https://trabenco-pozo.es/wp-content/uploads/2026/06/WhatsApp-Image-2026-06-26-at-11.26.07.jpeg',
		url: 'https://trabenco-pozo.es/hasta-la-vuelta/'
	},
	{
		category: 'PROYECTOS · JUNIO 2026',
		title: 'Una jornada para recordar',
		excerpt: 'Actividades, convivencia y aprendizaje más allá de las aulas.',
		image: 'https://trabenco-pozo.es/wp-content/uploads/2026/06/WhatsApp-Image-2026-05-29-at-12.20.08-3.jpeg',
		url: 'https://trabenco-pozo.es/%f0%9f%8c%bf%e2%98%80%ef%b8%8f-un-dia-inolvidable-en-el-rio-alberche-%e2%98%80%ef%b8%8f%f0%9f%8c%bf/'
	}
];

function renderNews(news) {
	newsList.innerHTML = news.slice(0, 3).map((item, index) => `
		<article class="news-card${index === 0 ? ' featured' : ''}">
			${item.image ? `<div class="news-img"><img src="${item.image}" alt=""></div>` : ''}
			<small>${item.category || 'COLEGIO'}</small>
			<h3>${item.title}</h3>
			<p>${item.excerpt}</p>
			<a href="${item.url || '#noticias'}" ${item.url?.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>Leer noticia ↗</a>
		</article>`).join('');
	document.querySelectorAll('.news-card').forEach((card) => observer.observe(card));
}

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
	if (entry.isIntersecting) entry.target.classList.add('visible');
}), { threshold: .08 });

document.querySelectorAll('.stage-card,.manifesto-list>div').forEach((element) => observer.observe(element));
renderNews(fallbackNews);
fetch('/api/news').then((response) => response.ok ? response.json() : Promise.reject()).then(renderNews).catch(() => {});

contactForm?.addEventListener('submit', async (event) => {
	event.preventDefault();
	const status = contactForm.querySelector('.form-status');
	const button = contactForm.querySelector('button');
	button.disabled = true;
	status.textContent = 'Enviando...';
	try {
		const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(contactForm))) });
		const result = await response.json();
		if (!response.ok) throw new Error(result.error);
		status.textContent = result.message;
		contactForm.reset();
	} catch (error) {
		status.textContent = 'No se ha podido enviar el mensaje. Puedes escribirnos a colegio@trabenco.es.';
	} finally {
		button.disabled = false;
	}
});
