import { Client } from '@notionhq/client'
import { NotionToMarkdown } from "notion-to-md"
import type { BookmarkBlockObjectResponse, Heading2BlockObjectResponse, Heading3BlockObjectResponse, ImageBlockObjectResponse, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints"

const notion = new Client({
    auth: import.meta.env.NOTION_INTEGRATION_KEY
})

const n2m = new NotionToMarkdown({
    notionClient: notion,
    config: {
        separateChildPage: true
    }
})

let contadorH2 = 0
let contadorH3 = 0

n2m.setCustomTransformer('bookmark', async(bookmark) => {
    const { bookmark: { url } } = bookmark as BookmarkBlockObjectResponse

    return `<a class="w-full p-3 rounded-md border-2 border-dashed border-cendii-cyan italic text-cendii-cyan flex flex-col items-center" href="${url}">
        <span class="font-bold">Haga click para ir a</span><span>${url}</span>
        </a>`
})

n2m.setCustomTransformer('heading_2', (heading2) => {
    const { heading_2:{ rich_text } } = heading2 as Heading2BlockObjectResponse

    contadorH3 = 0
    return `<h2>${++contadorH2}. ${rich_text ? rich_text[0]?.plain_text : "(Vacío)"}</h2>`
})

n2m.setCustomTransformer('heading_3', (heading3) => {
    const { heading_3:{ rich_text } } = heading3 as Heading3BlockObjectResponse

    return `<h3>${contadorH2}.${++contadorH3}. ${rich_text ? rich_text[0]?.plain_text : "(Vacío)"}</h3>`
})

n2m.setCustomTransformer('column_list', async(columnList) => {
    const markdown = await n2m.pageToMarkdown(columnList.id)

    const html = markdown.map(mdBlock => `<div>\n\n${n2m.toMarkdownString(mdBlock.children).parent}</div>`)

    return `<div style="grid-template-columns: repeat(${markdown.length}, minmax(0, 1fr))" class="grid gap-2">${html.join('')}</div>`
})

n2m.setCustomTransformer('image', (image) => {
    const { image: img } = image as ImageBlockObjectResponse

    const src = img.type === 'external' ? img.external.url : img.file.url;
    const caption = img.caption[0] ? img.caption[0].plain_text : undefined

    return `<figure class="relative p-3 mx-auto rounded-lg border-2 border-dashed border-cendii-cyan ${caption ? 'pb-0' : ''}">
        <div class="absolute inset-0 bg-cendii-cyan opacity-10 z-[-1]"></div>
        <img class="w-[auto] max-h-[256px]" src="${src}" ${caption ? 'alt="' + caption + '"' : '' } />
        ${caption ? '<figcaption class="text-center italic">' + caption + '</figcaption>' : ''}</figure>`
})

export async function obtenerPáginasPublicadas() {
    const db = await notion.databases.query({
        database_id: import.meta.env.NOTION_DATABASE_ID,
        filter: {
            or: [
                {
                    property: 'Estado',
                    select: {
                        equals: 'Publicado'
                    }
                }
            ]
        },
        sorts: [
            {
                property: 'Orden',
                direction: 'ascending'
            }
        ]
    })

    return (db.results.filter(db => db.object === 'page') as PageObjectResponse[]).map(page => {
        const datos = page.properties['Páginas']
        if (datos.type === 'title') {
            const nombre = datos.title[0].plain_text

            return ({
                id: page.id,
                ruta: nombre === 'Inicio' ? undefined : nombre.toLowerCase(),
                nombre,
            })
        }
    }).filter(page => page) as {id: string, nombre: string, ruta: string | undefined }[]
}

export function obtenerExistencias(): Promise<{ tipo: string, código: string, título: string, autores: string }[]> {
    return new Promise( resolve  => {
        let existencias:{ tipo: string, código: string, título: string, autores: string }[] = []

        let start_cursor: string | null

        async function queryDatabase() {
            const resultado = await notion.databases.query({
                database_id: import.meta.env.NOTION_BOOK_DATABASE_ID,
                sorts: [
                    {
                        property: 'Código',
                        direction: 'ascending'
                    }
                ],
                start_cursor: start_cursor ? start_cursor : undefined
            })

            console.log('CURSOR:', start_cursor)
            
            const nuevasExistencias = (resultado.results.filter(res => res.object === 'page') as PageObjectResponse[]).map(page => {
                const tipo = page.properties['Tipo'].type === 'select' ? page.properties['Tipo'].select?.name || '' : ''
                const código = page.properties['Código'].type === 'rich_text' ? page.properties['Código'].rich_text[0].plain_text : ''
                const título = page.properties['Título'].type === 'title' ? page.properties['Título'].title[0].plain_text : ''
                const autores = page.properties['Autores'].type === 'rich_text' ? page.properties['Autores'].rich_text[0].plain_text : ''

                return { tipo, código, título, autores }
            })

            existencias = [...existencias, ...nuevasExistencias]
            
            if (resultado.has_more) {
                start_cursor = resultado.next_cursor
                setTimeout(queryDatabase, 600)
            } else {
                console.log("CURSOR: RETURNED")
                resolve(existencias)
            }
        }
        
        queryDatabase()
    })
}

export async function obtenerNavbar(rutaActual: string, rutasManuales: { nombre: string, ruta: string | undefined }[]): Promise<{ nombre: string, ruta: string, esActual: boolean }[]> {
    const páginasPublicadas = await obtenerPáginasPublicadas()

    return [...páginasPublicadas, ...rutasManuales].map(página => ({
        ruta: '/' + (página.ruta || ''),
        nombre: página.nombre,
        esActual: página.nombre === rutaActual
    }))
}

export async function obtenerPágina(páginaId: string, log:boolean = false) {
    contadorH2 = 0

    const markdown = await n2m.pageToMarkdown(páginaId)

    //if(log) console.log(markdown.map(({ children, ...md }) => ({...md, children: JSON.stringify(children)})))

    return n2m.toMarkdownString(markdown)
}

export default notion