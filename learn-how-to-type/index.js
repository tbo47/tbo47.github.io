"use strict";
const CONTENT = [
    [
        'aaaa ssss dddd ffff gggg aaaa ssss dddd ffff gggg aaaa ssss dddd ffff gggg',
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
        'fad fads lad lads lass halas salad salads dad gads ladh lads salads gala alas',
        'ad add gads hadds has gask asks la lad lads lass da dad dada dada sa sad salad',
        'all fall falls alf alfa alfas fad fads salsa ska skald skalds flak flask flasks',
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
const reactToUserTyping = (progress, model, input, hands) => {
    model.innerHTML = CONTENT[progress.level][progress.step];
    document.getElementById('level').innerHTML = `${progress.level + 1}`;
    input.style.width = model.clientWidth + 'px';
    input.style.marginLeft = model.offsetLeft + 'px';
    const isCorrect = input.value.split('').every((char, index) => char === model.innerHTML[index]);
    const finger = findFinger(model.innerHTML[input.value.length]);
    hands.src = `hands${finger}.png`;
    input.classList.add(isCorrect ? 'correct' : 'incorrect');
    input.classList.remove(isCorrect ? 'incorrect' : 'correct');
};
/**
 *  Check if the user has completed the current level and move to the next one by incrementing the progress object
 */
const checkNextLevel = (progress, model, input) => {
    if (input.value.length === model.innerHTML.length && input.value === model.innerHTML) {
        input.value = '';
        if (progress.step === CONTENT[progress.level].length - 1) {
            progress.level++;
            progress.step = 0;
        }
        else {
            progress.step++;
        }
    }
};
/**
 * find which finger should be used to type the letter
 */
const findFinger = (letter) => {
    const f = FINGER_MAPPING.find(([finger, letters]) => letters.includes(letter)) || [0, []];
    return f[0];
};
const main = () => {
    const progress = { level: 0, step: 0 };
    const model = document.getElementById('user-model');
    const input = document.getElementById('user-input');
    document.addEventListener('click', () => input.focus());
    window.addEventListener('contextmenu', (e) => {
        input.focus();
        e.preventDefault();
    });
    const handsPic = document.getElementById('hands');
    reactToUserTyping(progress, model, input, handsPic);
    input.addEventListener('input', () => {
        checkNextLevel(progress, model, input);
        reactToUserTyping(progress, model, input, handsPic);
    });
};
main();
//# sourceMappingURL=index.js.map