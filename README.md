# Vignette ProseMirror Plugin For Licit

The Vignette Plugin provides a "vignette box" which allows the document to highlight or re-enforce information. They are used to describe emerging concepts, lessons learned, appropriate quotes, etc.  See the image below.  Blue background, darker blue outline, normal text/links/images inside of the box:. 

## Build

### Dependency

### Commands

- npm ci

- npm pack

#### To use this in Licit

Include plugin in licit component

- import VignettePlugins

- add VignettePlugins array in licit's plugin array

```

import { VignettePlugins }  from  '@modusoperandi/licit-vignette';


const  plugins = [...VignettePlugins]

ReactDOM.render(<Licit docID={0} plugins={plugins}/>


```
