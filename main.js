// ── VERCEL ANALYTICS ──
import { inject } from '@vercel/analytics';
inject();

gsap.registerPlugin(ScrollTrigger);

// ── THEME TOGGLE ──
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('gcb-theme') || 'light';
html.setAttribute('data-theme', saved);

themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('gcb-theme', next);
});

// ── NAV SCROLL ──
window.addEventListener('scroll', () => {
  document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 20);
});

// ── PRODUCTS ──
const products = [
  { id:1, name:"Flamin SweatShirt",     desc:"heavyweight cotton",  price:899,  badge:"New",  icon:"👕", img:"./image/1.png" },
  { id:2, name:"Raw Cut Hoodie", desc:"brushed fleece",      price:1799, badge:null,   icon:"🧥", img:"./image/2.png" },
  { id:3, name:"Street Cargo",   desc:"rip-stop canvas",     price:2299, badge:"New",  icon:"👖", img:"./image/3.png" },
  { id:4, name:"Acid Wash LS",   desc:"ghan-tee", price:1299, badge:null,   icon:"👔", img:"./image/4.png" },
  { id:5, name:"Void Bomber",    desc:"satin shell",         price:3499, badge:"Last", icon:"🧣", img:"./image/5.png" },
  { id:6, name:"ye Cap",     desc:"6-panel structured",  price:699,  badge:null,   icon:"🧢", img:"./image/6.png" },
  { id:7, name:"No Filter Tee",  desc:"ringspun cotton",     price:799,  badge:null,   icon:"👕", img:"./image/7.png" },
  { id:8, name:"Wreck Shorts",   desc:"cotton twill",        price:1099, badge:"Last", icon:"🩳", img:"./image/8.png" },
];

const grid = document.getElementById('productGrid');
products.forEach(p => {
  grid.innerHTML += `
    <div class="product-card">
      <div class="product-img">
        ${p.img ? `<img src="${p.img}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div class="product-img-inner"><span class="pi">${p.icon}</span><span>Product Image</span></div>`}
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <span class="product-price"><span class="currency">Rs</span>${p.price.toLocaleString('en-IN')}</span>
          <button class="add-btn" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-icon="${p.icon}">+ Add</button>
        </div>
      </div>
    </div>`;
});

// ── CART STATE ──
let cart = [];
const getItem = id => cart.find(i => i.id === id);

function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const sub   = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const badge = document.getElementById('cartCount');
  badge.textContent = total;
  badge.classList.add('pop');
  setTimeout(() => badge.classList.remove('pop'), 200);

  document.getElementById('subtotalVal').textContent = 'Rs' + sub.toLocaleString('en-IN');

  const el = document.getElementById('cartItems');
  if (!cart.length) {
    el.innerHTML = `<div class="cart-empty"><span class="empty-icon">∅</span><p>Bag is empty</p></div>`;
    return;
  }
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.icon}</div>
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">Rs${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
      <div class="cart-item-controls">
        <div class="qty-wrap">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeItem(${item.id})">Remove</button>
      </div>
    </div>`).join('');
}

function addToCart(id, name, price, icon) {
  const ex = getItem(id);
  if (ex) ex.qty++;
  else cart.push({ id, name, price, icon, qty: 1 });
  updateCartUI();
  const btn = document.querySelector(`.add-btn[data-id="${id}"]`);
  btn.textContent = '✓ Added';
  btn.classList.add('added');
  setTimeout(() => { btn.textContent = '+ Add'; btn.classList.remove('added'); }, 1200);
}

function changeQty(id, d) {
  const item = getItem(id);
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

grid.addEventListener('click', e => {
  const btn = e.target.closest('.add-btn');
  if (btn) addToCart(+btn.dataset.id, btn.dataset.name, +btn.dataset.price, btn.dataset.icon);
});

// ── CART OPEN / CLOSE ──
const sidebar  = document.getElementById('cartSidebar');
const overlay  = document.getElementById('cartOverlay');

function openCart() {
  document.body.classList.add('cart-open');
  overlay.classList.add('active');
  gsap.to(sidebar, { x: 0, duration: .48, ease: 'power3.out' });
}
function closeCart() {
  document.body.classList.remove('cart-open');
  overlay.classList.remove('active');
  gsap.to(sidebar, { x: '100%', duration: .38, ease: 'power3.in' });
}

document.getElementById('cartToggle').addEventListener('click', openCart);
document.getElementById('cartClose').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
updateCartUI();

// ── CHECKOUT MODAL ──
const checkoutModal = document.getElementById('checkoutModal');
const modalBackdrop = document.getElementById('modalBackdrop');

function openCheckout() {
  if (!cart.length) return;
  closeCart();
  // Populate order summary
  const summaryEl = document.getElementById('orderSummary');
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  summaryEl.innerHTML = cart.map(item =>
    `<div class="order-row"><span>${item.name} ×${item.qty}</span><span>Rs${(item.price * item.qty).toLocaleString('en-IN')}</span></div>`
  ).join('') + `<div class="order-row total"><span>Total</span><span>Rs${sub.toLocaleString('en-IN')}</span></div>`;

  // Reset to step 1
  showStep(1);
  setProgress(1);
  setTimeout(() => checkoutModal.classList.add('active'), 50);
}

function closeCheckout() {
  checkoutModal.classList.remove('active');
}

function showStep(n) {
  document.querySelectorAll('.modal-step').forEach(s => s.classList.remove('active'));
  const step = document.getElementById(`step${n}`);
  if (step) step.classList.add('active');
}

function setProgress(n) {
  document.querySelectorAll('.progress-step').forEach((s, i) => {
    s.classList.toggle('done', i < n);
  });
}

document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
modalBackdrop.addEventListener('click', closeCheckout);
document.getElementById('modalClose').addEventListener('click', closeCheckout);

// Step 1 → Step 2 (shipping)
document.getElementById('toStep2').addEventListener('click', () => {
  const name  = document.getElementById('f-name').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const addr  = document.getElementById('f-address').value.trim();
  if (!name || !email || !addr) {
    alert('Please fill in all required fields.');
    return;
  }
  showStep(2);
  setProgress(2);
});

// Step 2 → Step 3 (payment)
document.getElementById('toStep3').addEventListener('click', () => {
  showStep(3);
  setProgress(3);
});

// Step 3 → Step 4 (success)
document.getElementById('placeOrder').addEventListener('click', () => {
  const card = document.getElementById('f-card').value.trim();
  if (!card) { alert('Please enter your card number.'); return; }

  // Fake processing
  const btn = document.getElementById('placeOrder');
  btn.textContent = 'Processing...';
  btn.disabled = true;

  setTimeout(() => {
    // Generate fake order ID
    const orderId = 'GCB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById('orderId').textContent = orderId;
    showStep(4);
    setProgress(4);

    // Clear cart
    cart = [];
    updateCartUI();
    btn.textContent = 'Place Order';
    btn.disabled = false;
  }, 1800);
});

// Done → close
document.getElementById('doneShopping').addEventListener('click', closeCheckout);

// ── GSAP ANIMATIONS ──
document.body.classList.add('ready');

gsap.timeline({ defaults: { ease: 'power4.out' } })
  .to('#navLogo',        { opacity: 1, y: 0,  duration: .9 })
  .to('.anim-eyebrow',   { opacity: 1, y: 0,  duration: .6 },  '-=.45')
  .to('.anim-line span', { opacity: 1, y: 0,  duration: .85, stagger: .1 }, '-=.35')
  .to('.anim-herosub',   { opacity: 1, y: 0,  duration: .7 },  '-=.45')
  .to('.anim-heroact',   { opacity: 1, y: 0,  duration: .6 },  '-=.4')
  .to('.anim-heroimg',   { opacity: 1, x: 0,  duration: .85 }, '-=.65')
  .to('.anim-herotag',   { opacity: 1, x: 0,  duration: .5 },  '-=.3');

gsap.from('.section-title, .section-sub', {
  scrollTrigger: { trigger: '#shop',  start: 'top 82%' },
  y: 32, opacity: 0, duration: .75, stagger: .1, ease: 'power3.out'
});
gsap.from('.product-card', {
  scrollTrigger: { trigger: '#shop',  start: 'top 78%' },
  y: 44, opacity: 0, duration: .65, stagger: .07, ease: 'power3.out'
});
gsap.from('.about-tagline', {
  scrollTrigger: { trigger: '#about', start: 'top 78%' },
  x: -44, opacity: 0, duration: .85, ease: 'power3.out'
});
gsap.from('.about-content > *', {
  scrollTrigger: { trigger: '#about', start: 'top 78%' },
  y: 32, opacity: 0, duration: .65, stagger: .1, ease: 'power3.out'
});

// ── SIZE GUIDE MODAL ──
const sizeGuideModal   = document.getElementById('sizeGuideModal');
const sizeGuideBackdrop = document.getElementById('sizeGuideBackdrop');

function openSizeGuide(e) {
  e.preventDefault();
  sizeGuideModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSizeGuide() {
  sizeGuideModal.classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('sizeGuideLink').addEventListener('click', openSizeGuide);
document.getElementById('sizeGuideClose').addEventListener('click', closeSizeGuide);
sizeGuideBackdrop.addEventListener('click', closeSizeGuide);

// Tab switching
document.querySelectorAll('.sg-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.sg-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sg-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('sg-' + tab.dataset.tab).classList.add('active');
  });
});

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});
