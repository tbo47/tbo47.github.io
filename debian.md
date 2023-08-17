This is my Debian 12 configuration.

```
su -
apt update; apt dist-upgrade -y; apt autoremove -y
apt install sway swaylock swayidle grimshot nodejs npm vim thunderbird exa pavucontrol
```

Install [Docker](https://docs.docker.com/engine/install/debian/), [Discord](https://discord.com/download), [Chrome](https://www.google.com/chrome/dr/download/).

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

Create a file named `~/.config/sway/script/statusbar.sh`:

```bash
#!/bin/sh
rklb="RKLB \$$(node ~/.config/sway/scripts/finance.js RKLB)"
astr="ASTR \$$(node ~/.config/sway/scripts/finance.js ASTR)"
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
swaymsg 'output "*" background /tmp/wikimedia.jpg fill'
bindsym $mod+m output eDP-1 disable
bindsym $mod+n output eDP-1 enable
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
