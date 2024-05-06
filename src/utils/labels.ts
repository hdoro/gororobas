export const STRATUM_TO_LABEL = {
  EMERGENTE: 'Emergente',
  ALTO: 'Alto',
  MEDIO: 'Médio',
  BAIXO: 'Baixo',
  RASTEIRO: 'Rasteiro',
} as const

export const SUCCESSION_GROUP_TO_LABEL = {
  PIONEIRA: 'Pioneira',
  SECUNDARIA: 'Secundária',
  CLIMAX: 'Clímax',
} as const

export const LIGHT_ADAPTATION_TO_LABEL = {
  HELIOFITA: 'Heliófita',
  ESCIOFITA: 'Esciófita',
  MESOFITA: 'Mesófita',
} as const

export const DECIDUOUSNESS_TO_LABEL = {
  DECIDUA: 'Decídua (caducifólia)',
  SEMIDECIDUA: 'Semidecídua',
  PERENIFOLIA: 'Perenifólia',
} as const

export const VEGETABLE_LIFECYCLE_TO_LABEL = {
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
  BIENAL: 'Bienal',
  PERENE: 'Perene',
} as const

export const WATER_ADAPTATION_TO_LABEL = {
  HIGROFITA: 'Higrófita',
  XEROFITA: 'Xerófita',
  MESOFITA: 'Mesófita',
} as const

export const USAGE_TO_LABEL = {
  ALIMENTO_ANIMAL: 'Alimento Animal',
  ALIMENTO_HUMANO: 'Alimento Humano',
  CONSTRUCAO: 'Construção',
  MATERIA_ORGANICA: 'Matéria orgânica',
  MEDICINAL: 'Medicinal',
  COSMETIC: 'Cosmético',
  PAISAGISMO: 'Paisagismo',
  RITUALISTICO: 'Ritualístico',
} as const

export const EDIBLE_PART_TO_LABEL = {
  FRUTO: 'Fruto',
  FLOR: 'Flor',
  FOLHA: 'Folha',
  CAULE: 'Caule',
  SEMENTE: 'Semente',
  CASCA: 'Casca',
  BULBO: 'Bulbo',
  BROTO: 'Broto',
  /**
   * Raiz: responsável pela absorção de água e nutrientes
   *
   * Para adicionar à confusão, existem "raízes tuberosas". A principal diferença entre os dois reside
   * na parte da planta que se desenvolve para acumular energia. Tubérculos (como a batata) são estruturas
   * formadas no caule da planta, enquanto as raízes tuberosas são raízes que se especializam no
   * armazenamento de nutrientes.
   * Embora ambos cresçam debaixo da terra e possam ter uma aparência semelhante, eles são estruturalmente
   * diferentes e provêm de diferentes partes da planta.
   *
   * Exemplos: cenoura, beterraba, nabo
   */
  RAIZ: 'Raiz',
  /**
   * Tubérculo: órgãos de reserva de nutrientes.
   * Os tubérculos são capazes de produzir novas plantas.
   *
   * Exemplos: Mandioca, batata
   */
  TUBERCULO: 'Tubérculo',
  /**
   * Rizoma: caule subterrâneo que cresce horizontalmente e produz raízes e brotos.
   *
   * Exemplos: gengibre, açafrão-da-terra, cana-de-açúcar
   */
  RIZOMA: 'Rizoma',
} as const

export const PLANTING_METHOD_TO_LABEL = {
  SEMENTE: 'Semente',
  ESTACA: 'Estaca ou rama',
  ENXERTO: 'Enxerto',
  RIZOMA: 'Rizoma',
  BROTO: 'Broto',
  TUBERCULO: 'Tubérculo',
} as const

export const TIP_SUBJECT_TO_LABEL = {
  plantio: 'Plantio',
  crescimento: 'Crescimento',
  colheita: 'Colheita e pós colheita',
} as const

export const SOURCE_TYPE_TO_LABEL = {
  GOROROBAS: 'Pessoa no Gororobas',
  EXTERNAL: 'Externa',
} as const
