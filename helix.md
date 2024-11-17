## Helix configuration for Angular

```
npm install -g @angular/cli @angular/language-service typescript @angular/language-server typescript-language-server vscode-langservers-extracted prettier
```


Here is what ~/.config/helix/config.toml looks like:
```
[editor]
rulers = [120]
```

Here is what ~/.config/helix/languages.toml looks like:

```toml
[language-server.angular]
command = "ngserver"
args = [
  "--stdio",
  "--tsProbeLocations",
  "$(npm root -g)/typescript/lib",
  "--ngProbeLocations",
  "$(npm root -g)/@angular/language-server/bin",
  ]
    
[[language]]
name ="html"
roots = ["angular.json"]
language-servers = ["angular","vscode-html-language-server"]

[[language]]
name = "typescript"
roots = ["tsconfig.json"]
auto-format = true
formatter = { command = "biome", args = ["format", "--stdin-file-path","*.ts"]}
language-servers = ["angular","typescript-language-server"]
```
