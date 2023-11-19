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
