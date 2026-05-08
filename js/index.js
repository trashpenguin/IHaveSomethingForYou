const title = document.querySelector('.title');
if (!title) {
  console.error("Error: Title element (.title) not found in the HTML.");
} else {
  const text = 'I Have Something For You'.split('');

  for (let index = 0; index < text.length; index++) {
    if (text[index] !== ' ') {
      title.innerHTML += `<span>${text[index]}</span>`;
    } else {
      title.innerHTML += `<span style='margin-right: 20px;'></span>`;
    }
  }

  const textElements = document.querySelectorAll('.title span');
  textElements.forEach((element) => {
    const randomDelay = Math.random() * 1; // Random delay between 0 and 1 second
    element.style.animationDelay = `${randomDelay}s`;
  });
}
