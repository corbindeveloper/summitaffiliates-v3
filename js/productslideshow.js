var slideIndex = 1;

function plusDivs(n) {
    showDivs(slideIndex += n);
}

function showDivs(n) {
    var i;
    var x = document.getElementsByClassName("products-card");
    
    if (n > x.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = x.length}
    
    for (i = 0; i < x.length; i++) {
       x[i].style.transform = "translateX(" + -100 * (slideIndex-1) + "%)";
    }
}

// This will ensure your slideshow starts with the first product when the page loads
showDivs(slideIndex);

