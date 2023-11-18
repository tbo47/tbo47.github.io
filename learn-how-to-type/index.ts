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

const model = document.getElementById('user-model')!
const input = document.getElementById('user-input')! as HTMLInputElement
const levelElement = document.getElementById('level')!

document.addEventListener('click', () => {
    document.getElementById('user-input')!.focus()
})

const setHtmlLevel = (level: number) => {
    levelElement.innerHTML = `${level + 1}`
}

const main = async () => {
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
        input.value.split('').every((char, index) => {
            if (char === model.innerHTML[index]) {
                input.classList.add('correct')
                input.classList.remove('incorrect')
                return true
            } else {
                input.classList.add('incorrect')
                input.classList.remove('correct')
                return false
            }
        })
    })
}

main()
