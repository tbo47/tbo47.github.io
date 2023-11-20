"use strict";
const CONTENT = [
    [
        'aaaa ssss dddd ffff gggg aaaa ssss dddd ffff gggg aaaa ssss',
        'aa ss dd ff gg aa ss dd ff gg aa ss dd ff gg',
        'asdfg asdfg asdfg asdfg asdfg asdfg asdfg asdfg',
        'fgads dagfs gsafd dsagf fasdg gadfs sgdaf afgds fdsag',
    ],
    [
        'hhhh jjjj kkkk llll ;;;; hhhh jjjj kkkk llll ;;;; h j k l ;',
        'hh jj kk lll ;; hhhh jjj kkk lll ;;; h j k l ;',
        ';lkjh ;lkjh ;lkjh ;lkjh',
        'klhj; ;hkjh ;hljk h;jkj',
    ],
    [
        'fad fads lad lads lass halas salad salads dad gads salads',
        'ad add gads hadds has gask asks la lad lads lass da dad dada',
        'all fall falls alf alfa alfas fad fads salsa ska skald flasks',
    ],
    [
        'qqqq wwww eeee rrrr tttt qqqq wwww eeee rrrr tttt',
        'qq ww ee rr tt qq ww ee rr tt',
        'qwert qwert qwert qwert',
        'rqewt eqrwt wqrtw ewqrt tqerw weqtr rtewq',
    ],
    [
        'yyyy uuuu iiii oooo pppp yyyy uuuu iiii oooo pppp',
        'yy uu ii oo pp yy uu ii oo pp',
        'poyui ouyip youpi uypoi uoiyp',
    ],
];
const FINGER_MAPPING = [
    [9, [' ']],
    [1, ['a', 'q', 'z', '1']],
    [2, ['s', 'w', 'x', '2']],
    [3, ['d', 'e', 'c', '3']],
    [4, ['f', 'r', 'v', '4']],
    [4, ['g', 't', 'b', '5']],
    [5, ['h', 'y', 'n', '6']],
    [5, ['j', 'u', 'm', '7']],
    [6, ['k', 'i', ',', '8']],
    [7, ['l', 'o', '.', '9']],
    [8, [';', 'p', '/', '0']],
    [8, ["'", '[', ']', '-']],
    [8, ['\\', ']', '=', '+']],
];
/**
 * Change the page according to the progress object
 */
const reactToUserTyping = (progress, model, inputElement, hands) => {
    model.innerHTML = CONTENT[progress.level][progress.step];
    document.getElementById('level').innerHTML = `${progress.level + 1}`;
    inputElement.parentElement.style.width = model.clientWidth + 'px';
    inputElement.parentElement.style.marginLeft = model.offsetLeft + 'px';
    const finger = findFinger(model.innerHTML[progress.input.length]);
    hands.src = `hands${finger}.png`;
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
};
/**
 *  Check if the user has completed the current level and move to the next one by incrementing the progress object
 * @returns true if the user has completed the current level
 */
const checkNextLevel = (progress, model, start) => {
    if (progress.input.length === model.innerHTML.length) {
        const correct = progress.input.split('').filter((char, index) => char === model.innerHTML[index]);
        const score = Math.round((correct.length / model.innerHTML.length) * 100);
        const time = (new Date().getTime() - start.getTime()) / 1000;
        console.log(score, time);
        progress.input = '';
        if (progress.step === CONTENT[progress.level].length - 1) {
            progress.level++;
            progress.step = 0;
        }
        else {
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
    const f = FINGER_MAPPING.find(([finger, letters]) => letters.includes(letter)) || [0, []];
    return f[0];
};
const main = () => {
    const progress = { level: 0, step: 0, input: '' };
    const model = document.getElementById('user-model');
    const inputElement = document.getElementById('user-input');
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    const handsPic = document.getElementById('hands');
    document.addEventListener('click', () => document.getElementById('hidden-input').focus());
    reactToUserTyping(progress, model, inputElement, handsPic);
    let startDate = new Date();
    document.addEventListener('keydown', ({ key }) => {
        if (key === 'Backspace') {
            progress.input = progress.input.slice(0, -1);
        }
        else if (key.length !== 1) {
            // if Alt, Control, Shift, F19, etc. are pressed, do nothing
            return;
        }
        else {
            progress.input += key;
            if (checkNextLevel(progress, model, startDate))
                startDate = new Date();
        }
        reactToUserTyping(progress, model, inputElement, handsPic);
    });
};
main();
//# sourceMappingURL=index.js.map