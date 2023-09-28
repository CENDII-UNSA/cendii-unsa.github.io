import van from "vanjs-core"
import Fuse from "fuse.js"

const { tags:{ table, th, tr, td, span }, state: vanState } = van
const form = document.querySelector('form')
const database = document.querySelector('div#database')

if (form && database) {
    const existencias = JSON.parse(form.dataset.existencias || '[]') as { tipo: string, código: string, título: string, autores: string }[]
    const existenciasMostradas = vanState<{ tipo: string, código: string, título: string, autores: string }[]>([])

    form.addEventListener('submit', (e) => {
        e.preventDefault()

        const formData = new FormData(form)
        const texto = formData.get('texto')

        // Si el texto ingresado no es válido, no se hace nada
        if (!texto || texto.length < 2) return

        // Movemos la dirección a una donde esté la búsqueda realizada
        const url = new URL('/libros', window.location.origin)
        url.searchParams.set('q', texto.toString())
        window.location.assign(url)
    })

    window.addEventListener('DOMContentLoaded', () => {
        const texto = new URLSearchParams(window.location.search).get('q')

        if (texto) {
            const fuse = new Fuse(existencias, {
                includeScore: true,
                shouldSort: true,
                threshold: 0.5,
                keys: [
                    {
                        name: 'título',
                        weight: 2.5
                    },
                    {
                        name: 'autores',
                        weight: 1
                    },
                    {
                        name: 'etiquetas',
                        weight: 0.5
                    },
                    {
                        name: 'tipo',
                        weight: 0.01,
                    },
                    {
                        name: 'código',
                        weight: 0.2
                    }
                ]
            })

            const resultado = fuse.search(texto).filter(resultado => resultado.score).sort((rA, rB) => (rA.score || 0) - (rB.score || 0)).map(resultado => resultado.item)
            existenciasMostradas.val = resultado
            console.log("EXISTENCIAS:", existencias)
            console.log("RESULTADO: ", resultado)
        } else {
            existenciasMostradas.val = existencias
            console.log("EXISTENCIAS:", existencias)
        }
    })

    van.add(database, () => {
        if(existenciasMostradas.val.length === 0) return span({ class: 'italic' }, 'No se encontraron resultados para su búsqueda')

        return table({ class: 'w-full [&_:is(th,td)]:p-2' },
            tr({ class: '[&_th]:bg-cendii-cyan [&_th]:text-white' }, [
                th({ class: 'rounded-tl-lg' }, 'CÓDIGO'),
                th('TÍTULO'),
                th({ class: 'rounded-tr-lg' }, 'AUTORES')
            ]),
            existenciasMostradas.val.map(existencia => tr({ class: 'border-b-[1px] border-x-2 border-cendii-cyan hover:bg-cendii-cyan hover:text-white [&_span]:hover:border-[1px] [&_span]:hover:border-white' },
                td({ class: 'text-center' }, existencia.código),
                td(existencia.título),
                td(existencia.autores),
            ))
        )
    })
}