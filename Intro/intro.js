// Intro page script: handles CTA and small demo interactions
const btnStart = document.getElementById('btn-start');
const btnSkip = document.getElementById('btn-skip');
const dots = Array.from(document.querySelectorAll('.dot'));
let step = 0;

function updateDots() {
  dots.forEach((d,i)=>d.classList.toggle('active', i===step));
}

// Cycle progress indicator as small demo
setInterval(()=>{
  step = (step + 1) % dots.length;
  updateDots();
}, 1800);

btnStart.addEventListener('click', ()=>{
  // Redirect to main index (adjust path if needed)
  window.location.href = '../index.html';
});

btnSkip.addEventListener('click', ()=>{
  window.location.href = '../index.html';
});

// Allow Enter to start
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter') btnStart.click();
});
