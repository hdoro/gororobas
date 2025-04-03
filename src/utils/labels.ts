import type {
  EdiblePart,
  EditSuggestionStatus,
  Gender,
  NotePublishStatus,
  NoteType,
  PlantingMethod,
  ResourceFormat,
  SourceType,
  Stratum,
  TipSubject,
  VegetableLifeCycle,
  VegetableUsage,
  VegetableWishlistStatus,
} from '@/gel.interfaces'
import type { ResourceData, VegetableData } from '@/schemas'

export const STRATUM_TO_LABEL = {
  EMERGENTE: 'Emergente',
  ALTO: 'Alto',
  MEDIO: 'Médio',
  BAIXO: 'Baixo',
  RASTEIRO: 'Rasteiro',
} as const satisfies Record<Stratum, string>

export const STRATUM_EXPLAINERS = {
  EMERGENTE:
    'Plantas que devem estar acima de todas as outras e receber o máximo de luz - toleram até ~20% de sombra ao longo do dia',
  ALTO: 'Plantas que só ficam abaixo das de estrato emergente - toleram até ~40% de sombra ao longo do dia',
  MEDIO:
    'Plantas que ficam abaixo das de estrato alto - toleram até ~60% de sombra ao longo do dia',
  BAIXO:
    'Plantas que ficam abaixo das de estrato médio - toleram até ~80% de sombra ao longo do dia',
  RASTEIRO: 'Plantas de solo de floresta, sobrevivem sem luz direta',
} as const satisfies Record<Stratum, string>

export const VEGETABLE_LIFECYCLE_TO_LABEL = {
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
  BIENAL: 'Bienal',
  PERENE: 'Perene',
} as const satisfies Record<VegetableLifeCycle, string>

export const VEGETABLE_LIFECYCLE_EXPLAINERS = {
  SEMESTRAL:
    'Plantas que removemos ou colhemos em até 6 meses ou que morrem naturalmente nesse período',
  ANUAL:
    'Plantas que removemos ou colhemos entre 6 meses e 1 ano ou que morrem naturalmente nesse período',
  BIENAL:
    'Plantas que removemos ou colhemos em 1 a 2 anos ou que morrem naturalmente nesse período',
  PERENE:
    'Plantas que cultivamos por mais de 2 anos, como árvores frutíferas. "Perene" não significa pra sempre: muitas delas replantamos eventualmente para maximizar a produção, como o café, a banana, a parreira, etc.',
} as const satisfies Record<VegetableLifeCycle, string>

export const USAGE_TO_LABEL = {
  ALIMENTO_ANIMAL: 'Alimento Animal',
  ALIMENTO_HUMANO: 'Alimento Humano',
  CONSTRUCAO: 'Construção',
  COSMETICO: 'Cosmético',
  MATERIA_ORGANICA: 'Matéria orgânica',
  MEDICINAL: 'Medicinal',
  ORNAMENTAL: 'Ornamental',
  RITUALISTICO: 'Ritualístico',
  ECOLOGICO: 'Ecológico / ambiental',
} as const satisfies Record<VegetableUsage, string>

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
} as const satisfies Record<EdiblePart, string>

export const PLANTING_METHOD_TO_LABEL = {
  BROTO: 'Broto',
  ENXERTO: 'Enxerto ou clonagem',
  ESTACA: 'Estaca, rama ou folha',
  RIZOMA: 'Rizoma',
  SEMENTE: 'Semente',
  TUBERCULO: 'Tubérculo',
} as const satisfies Record<PlantingMethod, string>

export const PLANTING_METHOD_EXPLAINERS = {
  BROTO:
    'Brotos retirados da planta mãe, como gemas ou brotações laterais. Exemplos incluem batata doce, couve, mamão, etc.',
  ENXERTO:
    'Técnica de unir partes de duas plantas diferentes para combinar características desejáveis. Uma parte (o enxerto ou clone) é inserida em outra planta (o porta-enxerto ou cavalo) para que cresçam juntas. Grande parte da produção comercial de muitas frutíferas é feita assim (cacau, cítricas, amoras, etc.).',
  ESTACA:
    'Plantar um pedaço (estaca ou rama) do caule, folha ou raiz de uma planta. A estaca cria raízes e se desenvolve em uma nova planta geneticamente idêntica à original. Usado em roseiras, mandioca e muitas outras.',
  RIZOMA:
    'Rizomas são caules subterrâneos que crescem (também) horizontalmente e emitem raízes e brotos. Cortamos pedaços e plantamos, cada um originando uma nova planta. Banana é o exemplo clássico, mas também a cúrcuma, gengibre e bambu',
  /**
   * "Não jogue fora as sementes, guarde pra mim por amor" 🎶
   * Chegou até mim atráves de AS SEMENTES, de Marcelo D2, e de uma amiga (Bia) que trocou o "favor" por "amor" 🌻
   */
  SEMENTE:
    'Sejam plantadas diretamente no solo, ou em mudas a serem transplantadas',
  TUBERCULO:
    'Tubérculos são caules subterrâneos engrossados que armazenam nutrientes e possuem gemas que originam brotos. O plantio por tubérculo consiste em plantar o tubérculo inteiro ou seccionado, cada parte gerando uma nova planta. Nossas ancestrais já plantaram muuuita batata e inhame assim.',
} as const satisfies Record<PlantingMethod, string>

export const TIP_SUBJECT_TO_LABEL = {
  PLANTIO: 'Plantio',
  CRESCIMENTO: 'Crescimento',
  COLHEITA: 'Colheita e pós colheita',
} as const satisfies Record<TipSubject, string>

export const SOURCE_TYPE_TO_LABEL = {
  GOROROBAS: 'Pessoa no Gororobas',
  EXTERNAL: 'Externa',
} as const satisfies Record<SourceType, string>

export const GENDER_TO_LABEL = {
  FEMININO: 'Feminino',
  MASCULINO: 'Masculino',
  NEUTRO: 'Neutro',
} as const satisfies Record<Gender, string>

export const WISHLIST_STATUS_TO_LABEL = {
  QUERO_CULTIVAR: 'Quero cultivar',
  SEM_INTERESSE: 'Sem interesse',
  JA_CULTIVEI: 'Já cultivei',
  ESTOU_CULTIVANDO: 'Estou cultivando',
} as const satisfies Record<VegetableWishlistStatus, string>

export const NOTE_TYPE_TO_LABEL = {
  DESCOBERTA: 'Descoberta',
  ENSINAMENTO: 'Me ensinaram',
  EXPERIMENTO: 'Experimento',
  PERGUNTA: 'Pergunta',
  INSPIRACAO: 'Inspiração',
} as const satisfies Record<NoteType, string>

export const EDIT_SUGGESTION_STATUS_TO_LABEL = {
  PENDING_REVIEW: 'Em revisão',
  MERGED: 'Aprovadas',
  REJECTED: 'Rejeitadas',
} as const satisfies Record<EditSuggestionStatus, string>

export const NOTE_PUBLISH_STATUS_TO_LABEL = {
  PRIVATE: 'Nota Privada',
  COMMUNITY: 'Nota da comunidade',
  PUBLIC: 'Nota Pública',
} as const satisfies Record<NotePublishStatus, string>

export const VEGETABLE_FIELD_LABELS_MAP: Record<
  Exclude<keyof typeof VegetableData.Encoded, 'id'>,
  string
> = {
  content: 'Conteúdo livre sobre o vegetal',
  edible_parts: 'Partes comestíveis',
  friends: 'Amigues',
  gender: 'Gênero gramatical',
  handle: 'Endereço no site',
  lifecycles: 'Ciclo de vida',
  names: 'Nomes',
  origin: 'Origem',
  photos: 'Fotos',
  planting_methods: 'Plantio por',
  scientific_names: 'Nomes científicos',
  sources: 'Fontes',
  strata: 'Estrato de cultivo',
  development_cycle_max: 'Tempo de desenvolvimento máximo',
  development_cycle_min: 'Tempo de desenvolvimento mínimo',
  height_max: 'Altura adulta máxima',
  height_min: 'Altura adulta mínima',
  temperature_max: 'Temperatura ideal máxima',
  temperature_min: 'Temperatura ideal mínima',
  uses: 'Principais usos',
  varieties: 'Variedades',
}

export const RESOURCE_FORMAT_TO_LABEL = {
  BOOK: 'Livro',
  FILM: 'Filme',
  SOCIAL_MEDIA: 'Rede Social',
  VIDEO: 'Vídeo',
  ARTICLE: 'Artigo',
  PODCAST: 'Podcast',
  COURSE: 'Curso',
  ACADEMIC_WORK: 'Trabalho Acadêmico',
  DATASET: 'Base de Dados',
  ORGANIZATION: 'Organização',
  OTHER: 'Outro',
} as const satisfies Record<ResourceFormat, string>

export const RESOURCE_FIELD_LABELS_MAP: Record<
  Exclude<keyof typeof ResourceData.Encoded, 'id'>,
  string
> = {
  title: 'Título',
  format: 'Formato',
  url: 'URL',
  description: 'Sobre esse material',
  tags: 'Classificação',
  related_vegetables: 'Vegetais relacionados',
  credit_line: 'Créditos ou autoria',
  thumbnail: 'Imagem de capa',
}

export const RESOURCE_FORMAT_ACTION_LABELS = {
  BOOK: 'Ler livro',
  FILM: 'Assistir',
  SOCIAL_MEDIA: 'Acessar',
  VIDEO: 'Assistir',
  ARTICLE: 'Ler artigo',
  PODCAST: 'Escutar',
  COURSE: 'Assistir',
  ACADEMIC_WORK: 'Ler',
  DATASET: 'Acessar',
  ORGANIZATION: 'Conhecer organização',
  OTHER: 'Acessar',
} as const satisfies Record<ResourceFormat, string>
