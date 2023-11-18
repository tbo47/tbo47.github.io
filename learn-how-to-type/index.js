"use strict";
const CONTENT = [
    [
        'aaaa ssss dddd ffff aaaa ssss dddd ffff aaaa ssss dddd ffff',
        'aa ss dd ff aa ss dd ff aa ss dd ff',
        'asdf asdf asdf asdf asdf asdf asdf asdf',
        'fads dafs safd dsaf fasd adfs sdaf afds fdsa',
    ],
    ['jjj kkk lll ;;; jj kk ll ;; j k l ;', 'jj kk ll ;; jjj kkk lll ;;; j k l ;', ';lkj ;lkj jkl; jkl; jkl;'],
    [
        'fad fads lad lads lass alas salad salads dad dads lad lads salads alas',
        'ad add ads adds as ask asks la lad lads lass da dad dada dada sa sad salad',
        'all fall falls alf alfa alfas fad fads salsa ska skald skalds flak flask flasks',
    ],
];
const model = document.getElementById('user-model');
const input = document.getElementById('user-input');
const levelElement = document.getElementById('level');
const handsPic = document.getElementById('hands');
document.addEventListener('click', () => {
    document.getElementById('user-input').focus();
});
const setHtmlLevel = (level) => {
    levelElement.innerHTML = `${level + 1}`;
};
const findFinger = (nextLetter) => {
    if (nextLetter === ' ') {
        return 9;
    }
    else if (['a', 'q', 'z', '1'].includes(nextLetter)) {
        return 1;
    }
    else if (['s', 'w', 'x', '2'].includes(nextLetter)) {
        return 2;
    }
    else if (['d', 'e', 'c', '3'].includes(nextLetter)) {
        return 3;
    }
    else if (['f', 'r', 'v', '4'].includes(nextLetter)) {
        return 4;
    }
    else if (['g', 't', 'b', '5'].includes(nextLetter)) {
        return 4;
    }
    else if (['h', 'y', 'n', '6'].includes(nextLetter)) {
        return 5;
    }
    else if (['j', 'u', 'm', '7'].includes(nextLetter)) {
        return 5;
    }
    else if (['k', 'i', ',', '8'].includes(nextLetter)) {
        return 6;
    }
    else if (['l', 'o', '.', '9'].includes(nextLetter)) {
        return 7;
    }
    else if ([';', 'p', '/', '0'].includes(nextLetter)) {
        return 8;
    }
    else if (["'", '[', ']', '-'].includes(nextLetter)) {
        return 8;
    }
    else if (['\\', ']', '=', '+'].includes(nextLetter)) {
        return 8;
    }
    else {
        return 0;
    }
};
const main = async () => {
    let levelProgress = 0;
    let progress = 0;
    model.innerHTML = CONTENT[levelProgress][progress];
    setHtmlLevel(levelProgress);
    input.addEventListener('input', () => {
        if (input.value.length === model.innerHTML.length && input.value === model.innerHTML) {
            input.value = '';
            if (progress === CONTENT[levelProgress].length - 1) {
                levelProgress++;
                progress = 0;
                setHtmlLevel(levelProgress);
            }
            model.innerHTML = CONTENT[levelProgress][++progress];
        }
        const isCorrect = input.value.split('').every((char, index) => char === model.innerHTML[index]);
        if (isCorrect) {
            input.classList.add('correct');
            input.classList.remove('incorrect');
            const nextLetter = model.innerHTML[input.value.length];
            const finger = findFinger(nextLetter);
            handsPic.src = `hands${finger}.png`;
        }
        else {
            input.classList.add('incorrect');
            input.classList.remove('correct');
            handsPic.src = 'hands0.png';
        }
    });
};
main();
//# sourceMappingURL=index.js.map