#
# rename pictures and videos from a gopro and my android phone
#
#
## sudo apt install rename mediainfo exiftool
#
#
#
copyrightme() {
    copyright="my name"
    exiftool -CaptionsAuthorNames="$copyright" -Author="$copyright" -artist="$copyright" -copyright="$(date +'%Y') $copyright" *jpg
    rm *jpg_original
}
rename_files() {
    rm -rf *THM # gopro thumbnail
    rm -rf *GPR # gopro raw
    rename "s/MP4$/mp4/" *.MP4
    rename "s/LRV$/lrv/" *.LRV # gopro low resolution video
    rename "s/JPG$/jpg/" *.JPG
    rename 's/^IMG_//' *
    rename 's/^IMG-//' *
    rename 's/^VID_//' *
    rename 's/^VID-//' *
    copyrightme
}
gopro() {
    rename_files
    ls *mp4 *lrv |
        while read line; do
            targetname=$(mediainfo $line | grep "Encoded date" | sort -u | awk '{print $4"_"$5}' | sed s/-//g | sed s/://g)
            echo "$line -> ${targetname}.mp4"
            mv $line ${targetname}.mp4
        done
    rename "s/JPG$/jpg/" *.JPG
    ls *jpg | while read line; do
        targetname=$(exiftool -DateTimeOriginal $line | awk '{print $4"_"$5}' | sed s/://g)
        echo "$line -> ${targetname}.jpg"
        mv $line ${targetname}.jpg
    done
}
# cd ~/Pictures/Camera/ ; rename_files
# cd 'DCIM Moto G Power/Camera'; rename_files
# cd 'DCIM Moto G Power/OpenCamera'; rename_files
cd ~/Pictures/2023-12-gopro
gopro
