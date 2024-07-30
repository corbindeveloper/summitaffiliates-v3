document.querySelectorAll('.feature-faq-top').forEach(item => {
    item.addEventListener('click', () => {
        // Close all open FAQ answers
        document.querySelectorAll('.feature-faq-top').forEach(innerItem => {
            if (innerItem !== item) {
                innerItem.classList.remove('active');
                innerItem.nextElementSibling.style.display = 'none';
            }
        });

        // Toggle the clicked FAQ answer
        item.classList.toggle('active');
        const answer = item.nextElementSibling;
        if (item.classList.contains('active')) {
            answer.style.display = 'block';
        } else {
            answer.style.display = 'none';
        }
    });
});
