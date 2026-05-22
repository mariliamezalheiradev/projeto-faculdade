document.addEventListener('DOMContentLoaded', () => {

    // 1. ANIMAÇÃO + CONTADOR
    const motivos = document.querySelectorAll('.motivo');
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
  
          const counter = entry.target.querySelector('.contador');
          if (counter && !counter.started) {
            counter.started = true;
  
            const update = () => {
              const target = +counter.dataset.target;
              const current = +counter.innerText;
              const increment = target / 100;
  
              if (current < target) {
                counter.innerText = Math.ceil(current + increment);
                setTimeout(update, 20);
              } else {
                counter.innerText = target;
              }
            };
  
            update();
          }
        }
      });
    });
  
    motivos.forEach(m => observer.observe(m));
  

    const btn = document.getElementById('btnScroll');
    if(btn){
      btn.addEventListener('click', () => {
        document.getElementById('convite').scrollIntoView({
          behavior: 'smooth'
        });
      });
    }
  
    
    const images = document.querySelectorAll('.background img');
    let index = 0;
  
    if(images.length > 0) {
        setInterval(() => {
        images[index].classList.remove('active');
        index = (index + 1) % images.length;
        images[index].classList.add('active');
        }, 5000);
    }

    
    const btnFinalCadastro = document.getElementById('btn-final-cadastro');
    if(btnFinalCadastro) {
        btnFinalCadastro.addEventListener('click', () => {
            window.location.href = 'cadastro-salao.html';
        });
    }
  
  });