This is my Debian 12 configuration.

```
su -
apt update; apt dist-upgrade -y; apt autoremove -y
apt install sway swaylock swayidle grimshot nodejs npm vim thunderbird exa pavucontrol gimp silversearcher-ag rename
npm i -g npm-check-updates
```

Install [docker](https://docs.docker.com/engine/install/debian/), [discord](https://discord.com/download), [chrome](https://www.google.com/chrome/dr/download/), [syncthing](https://syncthing.net/), [amule](https://github.com/ngosang/docker-amule#ngosangamule), [globalprotect](https://github.com/yuezk/GlobalProtect-openconnect).

## Sway

[Sway](https://swaywm.org/) is a tiling windows manager.

Create the conf dir and copy the default sway conf file:
`mkdir -p ~/.config/sway/scripts/; cp /etc/sway/config ~/.config/sway/`

Create a file named `~/.config/sway/scripts/finance.js`:

```javascript
const https = require('https');
const name = process.argv.at(2) || 'ASTR' // RKLB
https.get(`https://query1.finance.yahoo.com/v8/finance/chart/${name}`, resp => {
  let data = ''
  resp.on('data', c => data += c)
  resp.on('end', () => console.log(JSON.parse(data).chart.result.at(0).meta.regularMarketPrice))
})
```

Create a file named `~/.config/sway/script/statusbar.sh` and make it executable `chmod +x ~/.config/sway/script/statusbar.sh`:

```bash
#!/bin/sh
rklb="RKLB \$$(node ~/.config/sway/scripts/finance.js RKLB)"
astr="ASTR \$$(node ~/.config/sway/scripts/finance.js ASTR)"
# node ~/.config/sway/scripts/wikimedia.js
# "stretch", "fill", "fit", "center", "tile"
# swaymsg 'output "*" background /tmp/wikimedia.jpg center'
while true
do
    date_dakar="$(TZ="Africa/Dakar" date +'%Y-%m-%d')"
    time_paris="Paris $(TZ="Europe/Paris" date +'%H:%M')"
    time_dakar="Dakar $(TZ="Africa/Dakar" date +'%H:%M')"
    time_sf="San Francisco $(TZ="America/Los_Angeles" date +'%H:%M')"
    printf "%s | %s | %s %s, %s, %s\n" "$rklb" "$astr" "$date_dakar" "$time_paris" "$time_dakar" "$time_sf"
    sleep 10
done
```

My `~/.config/sway/config` looks like:

```
...
output * bg /usr/share/backgrounds/sway/low-poly-bird.jpg fill
bindsym $mod+m output eDP-1 disable
bindsym $mod+n output eDP-1 enable
bindsym Print exec grimshot save area
...

bar {
    ...
    status_command ~/.config/sway/scripts/statusbar.sh
    ...
}
```

## Foot

[Foot](https://codeberg.org/dnkl/foot) is the default terminal for Sway.

`cp /etc/xdg/foot/foot.ini ~/.config/foot/` and tweak `~/.config/foot/foot.ini` if needed.

## Vim

`~/.vimrc`: 
```
:imap jk <Esc>
:syntax on
```
