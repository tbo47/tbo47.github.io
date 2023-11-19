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

const model = document.getElementById('user-model')!
const input = document.getElementById('user-input')! as HTMLInputElement
const levelElement = document.getElementById('level')!
const handsPic = document.getElementById('hands')! as HTMLImageElement
console.log(navigator.language)

document.addEventListener('click', () => document.getElementById('user-input')!.focus())
const setHtmlLevel = (level: number) => (levelElement.innerHTML = `${level + 1}`)

const findFinger = (l: string) => {
    const f = FINGER_MAPPING.find(([finger, letters]) => (letters as string[]).includes(l)) || [0, []]
    return f[0]
}

const main = () => {
    let levelProgress = 0
    let progress = 0
    model.innerHTML = CONTENT[levelProgress][progress]
    setHtmlLevel(levelProgress)
    input.style.width = model.clientWidth + 'px'
    input.addEventListener('input', () => {
        if (input.value.length === model.innerHTML.length && input.value === model.innerHTML) {
            input.value = ''
            if (progress === CONTENT[levelProgress].length - 1) {
                levelProgress++
                progress = 0
                setHtmlLevel(levelProgress)
            }
            model.innerHTML = CONTENT[levelProgress][++progress]
        }
        const isCorrect = input.value.split('').every((char, index) => char === model.innerHTML[index])
        if (isCorrect) {
            input.classList.add('correct')
            input.classList.remove('incorrect')

            const nextLetter = model.innerHTML[input.value.length]
            const finger = findFinger(nextLetter)
            handsPic.src = `hands${finger}.png`
        } else {
            input.classList.add('incorrect')
            input.classList.remove('correct')
            handsPic.src = 'hands0.png'
        }
    })
}

main()
