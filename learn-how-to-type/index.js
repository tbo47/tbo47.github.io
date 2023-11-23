"use strict";
let DATA = {};
let inModal = false;
const byId = (id) => document.getElementById(id);
/**
 * Change the page according to the progress object
 */
const reactToUserTyping = (progress, model, inputElement, hands, time) => {
    model.innerHTML = DATA.content[progress.level][progress.step];
    byId('level').innerHTML = `${progress.level + 1}`;
    inputElement.parentElement.style.width = model.clientWidth + 'px';
    inputElement.parentElement.style.marginLeft = model.offsetLeft + 'px';
    const finger = findFinger(model.innerHTML[progress.input.length]);
    hands.src = `../hands${finger}.png`;
    inputElement.innerHTML = '';
    progress.input.split('').forEach((char, index, arr) => {
        const span = document.createElement('span');
        span.innerHTML = char === ' ' ? '&nbsp;' : char;
        inputElement.appendChild(span);
        const isCorrect = char === model.innerHTML[index];
        span.classList.add(isCorrect ? 'correct' : 'incorrect');
        span.classList.remove(isCorrect ? 'incorrect' : 'correct');
        if (index === arr.length - 1)
            span.classList.add('blink');
    });
    byId('blink-left').style.display = progress.input.length ? 'none' : 'inline';
};
const askUserForNextStep = async (score, time) => {
    inModal = true;
    const showDialog = (show) => {
        byId('game').style.display = show ? 'none' : 'block';
        byId('dialog').style.display = show ? 'flex' : 'none';
    };
    showDialog(true);
    byId('score').innerHTML = score.toString();
    let comment = DATA.comments.not_enough;
    byId('dialog-again').style.display = 'block';
    byId('dialog-next').style.display = 'block';
    if (score < 90 || time > 30) {
        comment = DATA.comments.not_enough;
        byId('dialog-next').style.display = 'none';
    }
    else if (score < 95 || time > 15) {
        comment = DATA.comments.normal;
    }
    else {
        comment = DATA.comments.good;
    }
    byId('dialog-comment').innerHTML = comment;
    const userResponse = new Promise((resolve) => {
        byId('dialog-again').addEventListener('click', () => resolve('again'));
        byId('dialog-next').addEventListener('click', () => resolve('next'));
    });
    const response = await userResponse;
    showDialog(false);
    inModal = false;
    return response;
};
/**
 * Check if the user has completed the current level and move to the next one by incrementing the progress object
 * @returns true if the user has completed the current level
 */
const checkNextLevel = async (progress, model, time) => {
    if (progress.input.length === model.innerHTML.length) {
        const correct = progress.input.split('').filter((char, index) => char === model.innerHTML[index]);
        const score = Math.round((correct.length / model.innerHTML.length) * 100);
        const userChoose = await askUserForNextStep(score, time);
        progress.input = '';
        const goNextLevel = userChoose === 'next' && progress.step === DATA.content[progress.level].length - 1;
        const goNextStep = userChoose === 'next';
        if (goNextLevel) {
            progress.level++;
            progress.step = 0;
        }
        else if (goNextStep) {
            progress.step++;
        }
        return true;
    }
    return false;
};
/**
 * find which finger should be used to type the letter
 */
const findFinger = (letter) => {
    const f = DATA.finger_mapping.find(([finger, letters]) => letters.includes(letter)) || [0, []];
    return f[0];
};
const main = async () => {
    const data = await fetch('data.json');
    DATA = await data.json();
    const progress = { level: 0, step: 0, input: '' };
    const model = byId('user-model');
    const inputElement = byId('user-input');
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    const handsPic = byId('hands');
    document.addEventListener('click', () => byId('hidden-input').focus());
    let startDate = new Date();
    const getTime = () => {
        if (progress.input.length === 0)
            startDate = new Date();
        return Math.round((new Date().getTime() - startDate.getTime()) / 1000);
    };
    reactToUserTyping(progress, model, inputElement, handsPic, 0);
    document.addEventListener('keydown', async ({ key }) => {
        if (inModal)
            return;
        const time = getTime();
        if (key === 'Backspace') {
            progress.input = progress.input.slice(0, -1);
        }
        else if (key.length !== 1) {
            // if Alt, Control, Shift, F19, etc. are pressed, do nothing
            return;
        }
        else {
            progress.input += key;
            await checkNextLevel(progress, model, time);
        }
        reactToUserTyping(progress, model, inputElement, handsPic, time);
    });
    setInterval(() => {
        if (inModal)
            return;
        for (const el of document.getElementsByClassName('time')) {
            el.innerHTML = getTime().toString();
        }
    }, 400);
};
main();
//# sourceMappingURL=index.js.map