const GALLERY_SIZE = 4;
const API_URL = 'https://picsum.photos/v2/list?page=1&limit=100';

const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('loadMore');
const clearBtn = document.getElementById('clearGallery');
const removeLastBtn = document.getElementById('removeLast');
const reverseBtn = document.getElementById('reverseGallery');
const shuffleBtn = document.getElementById('shuffleGallery');

let picsumList = []; // all fetched images

async function fetchPicsumList(){
	try{
		const res = await fetch(API_URL);
		if(!res.ok) throw new Error('Network error');
		const data = await res.json();
		picsumList = data;
	}catch(err){
		console.error('Failed to fetch picsum list', err);
	}
}

function getDisplayedIds(){
	return Array.from(gallery.children).map(card => card.dataset.id);
}

function pickUniqueImages(count){
	const displayed = new Set(getDisplayedIds());
	const available = picsumList.filter(i => !displayed.has(String(i.id)));
	if(available.length === 0) return [];
	const chosen = [];
	// simple random pick without replacement from available
	while(chosen.length < count && available.length > 0){
		const idx = Math.floor(Math.random()*available.length);
		chosen.push(available.splice(idx,1)[0]);
	}
	return chosen;
}

function renderImage(item){
	const card = document.createElement('div');
	card.className = 'card';
	card.dataset.id = item.id;

	const img = document.createElement('img');
	img.src = `https://picsum.photos/id/${item.id}/600/400`;
	img.alt = item.author;
	img.title = `Author: ${item.author}`;
	img.addEventListener('click', ()=>openModal(item));

	const meta = document.createElement('div');
	meta.className = 'meta';
	meta.textContent = `Author: ${item.author}`;

	card.appendChild(img);
	card.appendChild(meta);
	gallery.appendChild(card);
}

function loadInitial(){
	const toAdd = pickUniqueImages(GALLERY_SIZE);
	toAdd.forEach(renderImage);
}

function loadMore(){
	const toAdd = pickUniqueImages(GALLERY_SIZE);
	if(toAdd.length === 0){
		alert('Більше унікальних картинок нема — перезавантажте сторінку, щоб завантажити список ще раз.');
		return;
	}
	toAdd.forEach(renderImage);
}

function clearGallery(){
	gallery.innerHTML = '';
}

function removeLast(){
	const last = gallery.lastElementChild;
	if(last) gallery.removeChild(last);
}

function reverseGallery(){
	const nodes = Array.from(gallery.children);
	nodes.reverse().forEach(n=>gallery.appendChild(n));
}

function shuffleGallery(){
	const nodes = Array.from(gallery.children);
	for(let i = nodes.length -1; i>0; i--){
		const j = Math.floor(Math.random()*(i+1));
		[nodes[i], nodes[j]] = [nodes[j], nodes[i]];
	}
	nodes.forEach(n=>gallery.appendChild(n));
}

/* Modal */
function openModal(item){
	const modal = document.createElement('div');
	modal.className = 'modal';
	modal.innerHTML = `
		<div class="inner">
			<img src="https://picsum.photos/id/${item.id}/1200/800" alt="${item.author}">
		</div>
		<div class="close" title="Close">✕</div>
	`;
	modal.querySelector('.close').addEventListener('click', ()=>document.body.removeChild(modal));
	modal.addEventListener('click', (e)=>{ if(e.target === modal) document.body.removeChild(modal); });
	document.body.appendChild(modal);
}

/* Wire up buttons */
loadMoreBtn.addEventListener('click', loadMore);
clearBtn.addEventListener('click', clearGallery);
removeLastBtn.addEventListener('click', removeLast);
reverseBtn.addEventListener('click', reverseGallery);
shuffleBtn.addEventListener('click', shuffleGallery);

(async function init(){
	await fetchPicsumList();
	if(picsumList.length === 0){
		gallery.textContent = 'Не вдалося завантажити список зображень.';
		return;
	}
	loadInitial();
})();
