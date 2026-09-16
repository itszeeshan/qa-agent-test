document.addEventListener('DOMContentLoaded', () => {
    const joinButton = document.getElementById('joinButton');
    const message = document.getElementById('message');
    const themeToggle = document.getElementById('themeToggle');
    const accountButton = document.getElementById('accountButton');

    if (joinButton && message) {
        joinButton.addEventListener('click', () => {
            message.innerText = "Welcome aboard! Let's find your next masterpiece.";
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
        });
    }

    if (accountButton && message) {
        accountButton.addEventListener('click', () => {
            message.innerText = 'Account menu coming soon.';
        });
    }
});
