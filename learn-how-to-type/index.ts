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

const COMMENTS = {
    not_enough: "I'm sure you can do better",
    normal: 'Not bad',
    good: 'Good job!',
}

let inModal = false

const byId = (id: string) => document.getElementById(id)!
/**
 * Change the page according to the progress object
 */
const reactToUserTyping = (
    progress: Progress,
    model: HTMLElement,
    inputElement: HTMLElement,
    hands: HTMLImageElement,
    time: number
) => {
    model.innerHTML = CONTENT[progress.level][progress.step]
    byId('level').innerHTML = `${progress.level + 1}`
    inputElement.parentElement!.style.width = model.clientWidth + 'px'
    inputElement.parentElement!.style.marginLeft = model.offsetLeft + 'px'
    const finger = findFinger(model.innerHTML[progress.input.length])
    hands.src = `../hands${finger}.png`
    inputElement.innerHTML = ''
    progress.input.split('').forEach((char, index, arr) => {
        const span = document.createElement('span')
        span.innerHTML = char === ' ' ? '&nbsp;' : char
        inputElement.appendChild(span)
        const isCorrect = char === model.innerHTML[index]
        span.classList.add(isCorrect ? 'correct' : 'incorrect')
        span.classList.remove(isCorrect ? 'incorrect' : 'correct')
        if (index === arr.length - 1) span.classList.add('blink')
    })
    byId('blink-left').style.display = progress.input.length ? 'none' : 'inline'
}

const askUserForNextStep = async (score: number, time: number) => {
    inModal = true
    const showDialog = (show: boolean) => {
        byId('game').style.display = show ? 'none' : 'block'
        byId('dialog').style.display = show ? 'flex' : 'none'
    }
    showDialog(true)
    byId('score').innerHTML = score.toString()
    let comment = COMMENTS.not_enough
    byId('dialog-again').style.display = 'block'
    byId('dialog-next').style.display = 'block'
    if (score < 50 || time > 30) {
        comment = COMMENTS.not_enough
        byId('dialog-next').style.display = 'none'
    } else if (score < 80 || time > 20) {
        comment = COMMENTS.normal
    } else {
        comment = COMMENTS.good
    }
    byId('dialog-comment').innerHTML = comment

    const userResponse = new Promise<'again' | 'next'>((resolve) => {
        byId('dialog-again').addEventListener('click', () => resolve('again'))
        byId('dialog-next').addEventListener('click', () => resolve('next'))
    })
    const response = await userResponse
    showDialog(false)
    inModal = false
    return response
}

/**
 * Check if the user has completed the current level and move to the next one by incrementing the progress object
 * @returns true if the user has completed the current level
 */
const checkNextLevel = async (progress: Progress, model: HTMLElement, time: number) => {
    if (progress.input.length === model.innerHTML.length) {
        const correct = progress.input.split('').filter((char, index) => char === model.innerHTML[index])

        const score = Math.round((correct.length / model.innerHTML.length) * 100)
        const userChoose = await askUserForNextStep(score, time)

        progress.input = ''
        const goNextLevel = userChoose === 'next' && progress.step === CONTENT[progress.level].length - 1
        const goNextStep = userChoose === 'next'
        if (goNextLevel) {
            progress.level++
            progress.step = 0
        } else if (goNextStep) {
            progress.step++
        }
        return true
    }
    return false
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
    const model = byId('user-model')!
    const inputElement = byId('user-input')!
    window.addEventListener('contextmenu', (e) => e.preventDefault())
    const handsPic = byId('hands')! as HTMLImageElement
    document.addEventListener('click', () => byId('hidden-input')!.focus())

    let startDate = new Date()
    const getTime = (start: Date) => {
        if (progress.input.length === 0) startDate = new Date()
        return Math.round((new Date().getTime() - startDate.getTime()) / 1000)
    }

    reactToUserTyping(progress, model, inputElement, handsPic, 0)
    document.addEventListener('keydown', async ({ key }) => {
        if (inModal) return
        const time = getTime(startDate)
        if (key === 'Backspace') {
            progress.input = progress.input.slice(0, -1)
        } else if (key.length !== 1) {
            // if Alt, Control, Shift, F19, etc. are pressed, do nothing
            return
        } else {
            progress.input += key
            await checkNextLevel(progress, model, time)
        }
        reactToUserTyping(progress, model, inputElement, handsPic, time)
    })
    setInterval(() => {
        if (inModal) return
        Array.from(document.getElementsByClassName('time')).forEach((el) => {
            el.innerHTML = getTime(startDate).toString()
        })
    }, 400)
}

main()
