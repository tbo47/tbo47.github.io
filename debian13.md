IMPORTANT: leave the root password blank, it will configure `sudo` automatically and it's what you want. 

This is my [Debian](https://www.debian.org/devel/debian-installer/) 13 (alias trixie) configuration after installation.

Run the following commands:

```
sudo apt install -y transmission gnome-software-plugin-flatpak gnome-console curl git zsh vlc
sudo apt remove -y firefox-esr
sudo flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
sudo flatpak install -y flathub com.discordapp.Discord
sudo flatpak install -y flathub org.mozilla.firefox
sudo flatpak install -y flathub org.pgadmin.pgadmin4
sudo flatpak install -y flathub io.neovim.nvim
gnome-software --mode=installed
flatpak run org.mozilla.firefox https://flathub.org/?category=popular
```

Note: trixie install [neovim 0.9](https://packages.debian.org/en/trixie/neovim) by default, we want [neovim 0.10](https://flathub.org/apps/io.neovim.nvim) from flatpak

For Chrome: 
[vimium](https://chromewebstore.google.com/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb), 
[ublock origin lite](https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh)

Neovim in vscode:
[vscode-neovim](https://marketplace.visualstudio.com/items?itemName=asvetliakov.vscode-neovim) 

In `.zshrc`:
```
alias vim=/var/lib/flatpak/app/io.neovim.nvim/x86_64/stable/active/export/bin/io.neovim.nvim
alias nvim=/var/lib/flatpak/app/io.neovim.nvim/x86_64/stable/active/export/bin/io.neovim.nvim
```

[Explore more apps from flatpak hub](https://flathub.org/?category=popular) and install them with the software app.

## dev environment

Install [ohmyz](https://ohmyz.sh/).

Download the `deb` files from [chrome](https://www.google.com/chrome/dr/download/), [vscode](https://code.visualstudio.com/)

And install the deb file with `sudo apt install ./chrome***.deb`

[Install nodejs with nvm](https://github.com/nvm-sh/nvm#install--update-script)

Make sure it added lines in `.zshrc` and not in `.bashrc`

Then re-open the console

```bash
nvm install --lts
npm install -g npm-check-updates npm tsx
```


In `.zshrc` add memory to nodejs with:
```bash
export NODE_OPTIONS=--max_old_space_size=8192
```
