// js/main.js - central scripts for Part 3
document.addEventListener('DOMContentLoaded', ()=> {

  // 1) Accordion
  document.querySelectorAll('.acc-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const panel = btn.nextElementSibling;
      if (!expanded) panel.hidden = false;
      else panel.hidden = true;
    });
  });

  // 2) Lightbox gallery
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.85);align-items:center;justify-content:center;z-index:9999;';
  const lbimg = document.createElement('img');
  lbimg.style.maxWidth='95%'; lbimg.style.maxHeight='95%';
  lightbox.appendChild(lbimg);
  document.body.appendChild(lightbox);
  document.querySelectorAll('.gl').forEach(img=>{
    img.addEventListener('click', ()=> {
      lbimg.src = img.dataset.large || img.src;
      lbimg.alt = img.alt || '';
      lightbox.style.display = 'flex';
    });
  });
  lightbox.addEventListener('click', ()=> lightbox.style.display='none');

  // 3) Dynamic services loader and search
  const listEl = document.getElementById('list');
  if (listEl) {
    fetch('data/services.json')
      .then(r=>r.json())
      .then(items => {
        window._items = items;
        renderItems(items);
      }).catch(err=>{
        console.error('Could not load services.json', err);
        listEl.innerHTML = '<p>Services currently unavailable.</p>';
      });

    const search = document.getElementById('search');
    if (search) {
      search.addEventListener('input', e=>{
        const q = e.target.value.toLowerCase();
        renderItems(window._items.filter(i=> i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)));
      });
    }
  }

  function renderItems(items){
    const list = document.getElementById('list');
    if(!list) return;
    list.innerHTML = items.map(i=>`
      <article class="item">
        <h3>${i.title}</h3>
        <p>${i.description}</p>
        <p>Category: ${i.category} ${i.price ? '- R' + i.price : ''}</p>
      </article>`).join('');
  }

  // 4) Map init (Leaflet) if #map present
  const mapEl = document.getElementById('map');
  if (mapEl) {
    const css = document.createElement('link');
    css.rel='stylesheet';
    css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = ()=> {
      const map = L.map('map').setView([-26.55, 28.3333], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      L.marker([-26.55, 28.3333]).addTo(map).bindPopup('<strong>Ratanda GreenRoots</strong><br>Community Office').openPopup();
    };
    document.body.appendChild(script);
  }

  // 5) Enquiry form handling
  const enquiryForm = document.getElementById('enquiryForm');
  const enquiryResult = document.getElementById('enquiryResult');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const phone = document.getElementById('phone');
      const service = document.getElementById('service');
      const qty = document.getElementById('quantity');

      const fields = [name,email,phone,service,qty];
      const errors = fields.map(f => f.checkValidity() ? '' : (f.validationMessage || 'Invalid')).filter(Boolean);
      if (errors.length) {
        enquiryResult.innerHTML = '<p class="form-error">Please correct the highlighted fields.</p>';
        return;
      }

      let cost = 0;
      if (service.value === 'sponsor') cost = 300 * Number(qty.value);
      if (service.value === 'event') cost = 50 * Number(qty.value);

      let availability = 'Available';
      if (Number(qty.value) > 100) availability = 'Limited — contact us for bulk arrangements';

      enquiryResult.innerHTML = `
        <h3>Enquiry Summary</h3>
        <p>Name: ${name.value}</p>
        <p>Service: ${service.options[service.selectedIndex].text}</p>
        <p>Quantity: ${qty.value}</p>
        <p><strong>Estimated cost: R${cost.toFixed(2)}</strong></p>
        <p>Availability: ${availability}</p>
      `;
    });
  }

  // 6) Contact form handling with mailto fallback
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name = document.getElementById('cname');
      const email = document.getElementById('cemail');
      const type = document.getElementById('ctype');
      const msg = document.getElementById('cmessage');
      const status = document.getElementById('contactStatus');
      const recipient = 'recipient@example.org';

      if (![name,email,type,msg].every(f=>f.checkValidity())) {
        status.innerHTML = '<p class="form-error">Please complete all fields correctly.</p>';
        return;
      }

      const subject = encodeURIComponent(`Website contact: ${type.value} - ${name.value}`);
      const body = encodeURIComponent(`Name: ${name.value}\nEmail: ${email.value}\nType: ${type.value}\n\nMessage:\n${msg.value}`);

      // Fallback mailto
      const mailto = `mailto:${recipient}?subject=${subject}&body=${body}`;
      window.location.href = mailto;
      status.innerHTML = '<p>If your mail client did not open, copy the message and email it manually to ' + recipient + '.</p>';
    });
  }

});
