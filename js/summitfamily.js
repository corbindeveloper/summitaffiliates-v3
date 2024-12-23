document.querySelectorAll('.company-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.querySelector('.company-card-logo').style.display = 'none';
        card.querySelector('.company-card-description').style.display = 'flex';
    });
    card.addEventListener('mouseleave', () => {
        card.querySelector('.company-card-logo').style.display = 'flex';
        card.querySelector('.company-card-description').style.display = 'none';
    });
});

