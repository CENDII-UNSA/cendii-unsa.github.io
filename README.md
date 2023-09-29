# CENDII UNSA

Este es el código de la página del Centro de Documentación de Ingeniería Industrial de la UNSA

## Instalación

```sh
git clone https://github.com/CENDII-UNSA/cendii-unsa.github.io.git cendii

cd cendii

npm install

npm run dev
```

## Funcionamiento

La página integra [Notion](https://www.notion.so/) como una CMS para diversas fuentes de información.

Sirve como forma de generar las páginas a mostrar de manera sencilla sin necesidad de que el editor sepa programar.

También permite mostrar todos los libros / tesis / proyectos que están en la biblioteca al público.

## Tecnologías Usadas

- **[Astro JS](https://astro.build/):** Retorna HTML compilado en el servidor, reduciendo significativamente la cantidad de código enviado al usuario
- **[FuseJS](https://www.fusejs.io/):** Permite realizar búsquedas difusas de la información de los libros sin necesidad de algo como [Algolia](https://www.algolia.com/)
- **[VanJS](https://vanjs.org/):** Facilidad de tener reactividad en el lado del cliente y de muy poco peso sin necesidad de un framework grande como [React](https://react.dev/) o [Vue](https://vuejs.org/)
- **[Tailwind CSS](https://tailwindcss.com/):** Estilizado fácil de los diferentes elementos de la página

## Colaboración

Estamos completamente abiertos a contribuciones, ya sea en forma de *pull requests*, creando *issues*, etc.

Estamos a favor de las tecnologías de código abierto, por lo que compartimos la filosofía de las contribuciones.