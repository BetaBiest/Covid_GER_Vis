# Covid_GER_Vis
 a Covid-19 visualisation for Germany  

I like to run a few test builds and than start over with the new collected knowledge, but keep the first runs for reference till im done with my final build. Thats why you can have a look into my progression while I´m still developing:
- [V1](https://betabiest.github.io/Covid_GER_Vis/V1/)
- [V2](https://betabiest.github.io/Covid_GER_Vis/V2/)
- [V3](https://betabiest.github.io/Covid_GER_Vis/V3/)
- Final Version in process

## Documentation

Run `npm install` to install dependencies.  
Run `npm start` to start dev build.  
Run `npm build` to run production build.

Install TS support for packages with `npm i --save-dev @types/<packagename>`

Where do i find ..?
- Main script *"./src/index.tsx"*
  - React components *"./src/component"*
  - TS interfaces *"./src/model"*.
  - TS types *"./src/type"*.
- Stylesheets *"./src/style"*
  - Global parameters *"./src/style/parameter.scss"*
  - Global definitions *"./src/style/mixin"*
  - Styling for elements *"./src/style/element"*


## Source
- Covid-19 data: [RKI (ArgisHub)]()
- Germany map: [AliceWi (Github)](https://github.com/AliceWi/TopoJSON-Germany)
  - Changes:
    - *** Replaced Berlin with subdivisions ***
    - *** Merged LK_Göttingen ***
- Population (Record date: 30.12.2019):
  - [© Statistisches Bundesamt (Destatis), 2020 (12411-0015)](https://www-genesis.destatis.de/genesis//online)
  - [Statistik Berlin Brandenburg](https://www.statistik-berlin-brandenburg.de)

## Special Thanks
to [ulrichstark](https://github.com/ulrichstark) for providing the basic construct of the dev framework, help and support.
