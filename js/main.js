function expandCard(iconElement) {
    const cardContainer = iconElement.closest('.resource-card');
    const cardContent = cardContainer.querySelector('.resource-card-content');
    const expandIcon = cardContainer.querySelector('.fa-solid');
  
    if (cardContent.style.display === 'none' || cardContent.style.display === '') {
      cardContent.style.display = 'flex';
      expandIcon.classList.remove('fa-circle-plus');
      expandIcon.classList.add('fa-circle-minus');
    } else {
      cardContent.style.display = 'none';
      expandIcon.classList.remove('fa-circle-minus');
      expandIcon.classList.add('fa-circle-plus');
    }
  }
  
  
  /*Javascript to make the header change words on Blur*/  
  const textElement = document.getElementById('change-header');
  const texts = ["Managed Print Solutions", "Mailing Automation", "Document Management"];
  let currentTextIndex = 0;

  function headingBlur() {
  textElement.style.opacity = 1; 
  
  textElement.textContent = texts[currentTextIndex];

  currentTextIndex = (currentTextIndex + 1) % texts.length;

  textElement.animate([
    {opacity: 0.1},
    {opacity: 1}
  ], {
    duration: 3000,
    easing: 'ease-in-out'
  });

  setTimeout(() => {
    headingBlur();
  }, 3000);
  }

  headingBlur();
  