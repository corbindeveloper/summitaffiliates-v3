function mobileMenu() {
    const mobileNavList = document.getElementById('mobile-nav-list');
  
    if (mobileNavList.style.display === 'none' || mobileNavList.style.display === '') {
      mobileNavList.style.display = 'block';
    } else {
      mobileNavList.style.display = 'none';
    }
}

function aboutDrop() {
  const aboutDrop = document.getElementById('about-navigation');
  const mfpDrop = document.getElementById('mfp-navigation');
  const mailDrop = document.getElementById('mail-navigation');
  const solutionsDrop = document.getElementById('solutions-navigation');

  if (aboutDrop.style.display === 'none' || aboutDrop.style.display === '') {
    aboutDrop.style.display = 'flex';
    mfpDrop.style.display = 'none';
    mailDrop.style.display = 'none';
    solutionsDrop.style.display = 'none';
  }

}


function mfpDrop() {
  const aboutDrop = document.getElementById('about-navigation');
  const mfpDrop = document.getElementById('mfp-navigation');
  const mailDrop = document.getElementById('mail-navigation');
  const solutionsDrop = document.getElementById('solutions-navigation');

  if (mfpDrop.style.display === 'none' || mfpDrop.style.display === '') {
    mfpDrop.style.display = 'flex';
    aboutDrop.style.display = 'none';
    mailDrop.style.display = 'none';
    solutionsDrop.style.display = 'none';
  }

}

function mailDrop() {
  const aboutDrop = document.getElementById('about-navigation');
  const mfpDrop = document.getElementById('mfp-navigation');
  const mailDrop = document.getElementById('mail-navigation');
  const solutionsDrop = document.getElementById('solutions-navigation');

  if (mailDrop.style.display === 'none' || mailDrop.style.display === '') {
    mailDrop.style.display = 'flex';
    mfpDrop.style.display = 'none';
    aboutDrop.style.display = 'none';
    solutionsDrop.style.display = 'none';
  }

}

function solutionsDrop() {
  const aboutDrop = document.getElementById('about-navigation');
  const mfpDrop = document.getElementById('mfp-navigation');
  const mailDrop = document.getElementById('mail-navigation');
  const solutionsDrop = document.getElementById('solutions-navigation');

  if (solutionsDrop.style.display === 'none' || solutionsDrop.style.display === '') {
    solutionsDrop.style.display = 'flex';
    mfpDrop.style.display = 'none';
    aboutDrop.style.display = 'none';
    mailDrop.style.display = 'none';
  }

}