import {showFig} from 'plotive';

async function main() {
  const runButton = document.getElementById('run');
  if (!(runButton instanceof HTMLButtonElement)) {
    throw new Error('Missing #run button');
  }

  runButton.addEventListener('click', () => {
    showFig({
        title: "Title"
    });
  });
}

main().catch((error) => {
  console.error('Example failed to initialize', error);
});
