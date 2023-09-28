import type { Block } from "notion-types"

type NotionData = {
    id: string,
    tipo: Block['type'],
    contenido: any
}