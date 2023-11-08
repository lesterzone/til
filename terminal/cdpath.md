When working with our terminal, we can configure [CDPATH](https://www.man7.org/linux/man-pages/man1/cd.1p.html#ENVIRONMENT_VARIABLES)

My configuration:

```sh
# ~/.zshrc
export CDPATH=:$HOME/develop:$HOME/Documents
```

I keep my projects under `develop/xx`

So I just type `cd xx` anywhere and I will get to `xx` folder.

The downside is that I get used to it.