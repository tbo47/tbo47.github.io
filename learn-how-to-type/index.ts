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
]
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
]

/**
 * Change the page according to the progress object
 */
const reactToUserTyping = (
    progress: Progress,
    model: HTMLElement,
    inputElement: HTMLElement,
    hands: HTMLImageElement
) => {
    model.innerHTML = CONTENT[progress.level][progress.step]
    document.getElementById('level')!.innerHTML = `${progress.level + 1}`
    inputElement.parentElement!.style.width = model.clientWidth + 'px'
    inputElement.parentElement!.style.marginLeft = model.offsetLeft + 'px'
    // const isCorrect = progress.input.split('').every((char, index) => char === model.innerHTML[index])
    const finger = findFinger(model.innerHTML[progress.input.length])
    hands.src = `hands${finger}.png`
    inputElement.innerHTML = ''
    progress.input.split('').forEach((char, index, arr) => {
        const span = document.createElement('span')
        span.innerHTML = char === ' ' ? '&nbsp;' : char
        inputElement.appendChild(span)
        const isCorrect = char === model.innerHTML[index]
        span.classList.add(isCorrect ? 'correct' : 'incorrect')
        span.classList.remove(isCorrect ? 'incorrect' : 'correct')
        if(index === arr.length - 1) span.classList.add('blink')
    })
}

/**
 *  Check if the user has completed the current level and move to the next one by incrementing the progress object
 */
const checkNextLevel = (progress: Progress, model: HTMLElement) => {
    if (progress.input.length === model.innerHTML.length) {
        //  TODO what to do here? progress.input === model.innerHTML
        progress.input = ''
        if (progress.step === CONTENT[progress.level].length - 1) {
            progress.level++
            progress.step = 0
        } else {
            progress.step++
        }
    }
}

/**
 * find which finger should be used to type the letter
 */
const findFinger = (letter: string) => {
    const f = FINGER_MAPPING.find(([finger, letters]) => (letters as string[]).includes(letter)) || [0, []]
    return f[0]
}

interface Progress {
    level: number // 0, 1, 2, 3, 4
    step: number // a level has 4 steps
    input: string // the user input
}

const main = () => {
    const progress = { level: 0, step: 0, input: '' }
    const model = document.getElementById('user-model')!
    const inputElement = document.getElementById('user-input')!
    window.addEventListener('contextmenu', (e) => e.preventDefault())
    const handsPic = document.getElementById('hands')! as HTMLImageElement
    reactToUserTyping(progress, model, inputElement, handsPic)
    document.addEventListener('keydown', ({key}) => {
        if (['Alt', 'Control', 'Shift'].includes(key) || key.startsWith('F')) return
        if (key === 'Backspace') {
            progress.input = progress.input.slice(0, -1)
        } else {
            progress.input += key
        }
        checkNextLevel(progress, model)
        reactToUserTyping(progress, model, inputElement, handsPic)
    })
}

main()
