onload = () => {
  const c = setTimeout(() => {
    document.body.classList.remove("not-loaded");

    const titleElement = document.getElementById('title');
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    const lovePhrases = [
      'I Love You ❤️',              // English
      'Mahal Kita ❤️',              // Tagalog (Filipino)
      '愛してる ❤️',                 // Japanese (Aishiteru)
      '사랑해 ❤️',                   // Korean (Saranghae)
      '我爱你 ❤️',                   // Chinese (Wǒ ài nǐ)
      'Je t\'aime ❤️',              // French
      'Te Amo ❤️',                  // Spanish
      'Ich liebe dich ❤️',          // German
      'Ti amo ❤️',                  // Italian
      'Я тебя люблю ❤️',            // Russian (Ya tebya lyublyu)
      'أحبك ❤️',                    // Arabic (Ana uhibbuka)
      'मैं तुमसे प्यार करता हूँ ❤️', // Hindi
      'Jag älskar dig ❤️',          // Swedish
      'Ik hou van jou ❤️',          // Dutch
      'Kocham cię ❤️',              // Polish
    ];

    function typeEffect() {
      if (isPaused) return;

      const currentPhrase = lovePhrases[phraseIndex];

      // Add a subtle glow pulse when the phrase is complete
      if (!isDeleting && charIndex === currentPhrase.length) {
        isPaused = true;
        titleElement.style.transition = 'text-shadow 0.5s ease';
        titleElement.style.textShadow = '0 0 30px white, 0 0 60px white';
        setTimeout(() => {
          titleElement.style.textShadow = '0px 0px 20px white';
          setTimeout(() => {
            isDeleting = true;
            isPaused = false;
            typeEffect();
          }, 500);
        }, 2500);
        return;
      }

      // Smoothly end delete and start next phrase
      if (isDeleting && charIndex === 0) {
        isPaused = true;
        titleElement.style.transition = 'opacity 0.3s ease';
        titleElement.style.opacity = '0';
        setTimeout(() => {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % lovePhrases.length;
          titleElement.textContent = '';
          titleElement.style.opacity = '1';
          isPaused = false;
          typeEffect();
        }, 300);
        return;
      }

      // Type or delete one character
      if (isDeleting) {
        titleElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        titleElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      // Dynamic speed for smoother feel
      // Type slower at start of phrase, faster toward end
      // Delete slower at start, faster toward end
      let typeSpeed;
      const phraseLength = currentPhrase.length;
      if (isDeleting) {
        // Delete faster as fewer chars remain (smooth acceleration)
        const progress = 1 - (charIndex / phraseLength);
        typeSpeed = Math.max(20, Math.round(80 * progress));
      } else {
        // Type slightly slower at start, faster later
        const progress = charIndex / phraseLength;
        typeSpeed = Math.max(60, Math.round(200 - (150 * progress)));
      }

      setTimeout(typeEffect, typeSpeed);
    }

    // Start the typing effect after a brief delay
    setTimeout(typeEffect, 800);

    // Start shooting stars after flower is fully bloomed (~7s total)
    setTimeout(() => {
      document.body.classList.add("stars-visible");
    }, 7000);

    clearTimeout(c);
  }, 1000);
};
