This is my Debian 12 configuration.

```
su -
apt update; apt dist-upgrade -y; apt autoremove -y
apt install sway swaylock swayidle nodejs chromium vim thunderbird
```

Install [Docker](https://docs.docker.com/engine/install/debian/).

Install [Discord](https://discord.com/download).

## Vim

`~/.vimrc`: 
```
:imap jk <Esc>
:syntax on
```

## Sway

[Sway](https://swaywm.org/) is a windows manager.

Create a file named `getASTR.js`
```javascript
const https = require('https');
const name = process.argv.at(2) || 'ASTR'
https.get(`https://query1.finance.yahoo.com/v8/finance/chart/${name}`, resp => {
  let data = ''
  resp.on('data', c => data += c)
  resp.on('end', () => console.log(JSON.parse(data).chart.result.at(0).meta.regularMarketPrice))
})
// RKLB
```

Create `.config/sway/scripts/statusbar.sh` and make it executable `chmod +x statusbar.sh`

```bash
#!/bin/sh
astr="ASTR \$$(/home/user/.nvm/versions/node/v18.15.0/bin/node ~/getASTR.js)"
while true
do
    cpu_temp="CPU $(awk '{x += $1} END{ printf "%.2f", x / NR / 1000}' /sys/class/thermal/thermal_zone*/temp)°C"
    # date_and_time="$(date +'%Y-%m-%d %I:%M:%S %p')"
    date_dakar="$(TZ="Africa/Dakar" date +'%Y-%m-%d')"
    date_and_time_paris="Paris $(TZ="Europe/Paris" date +'%H:%M')"
    date_and_time_new_york="New York $(TZ="America/New_York" date +'%H:%M')"
    date_and_time_dakar="Dakar $(TZ="Africa/Dakar" date +'%H:%M')"
    date_and_time_sf="San Francisco $(TZ="America/Los_Angeles" date +'%H:%M')"
    printf "%s | %s | %s %s, %s, %s\n" "$astr" "$cpu_temp" "$date_dakar" "$date_and_time_paris" "$date_and_time_dakar" "$date_and_time_sf"
    sleep 30
done
```

`cp /etc/sway/config ~/.config/sway/`

In `~/.config/sway/config` change the `bar` section to have `status_command ~/.config/sway/scripts/statusbar.sh`

## Foot

[Foot](https://codeberg.org/dnkl/foot) is the default terminal for Sway.

`cp /etc/xdg/foot/foot.ini ~/.config/foot/` and tweak `~/.config/foot/foot.ini` if needed.

