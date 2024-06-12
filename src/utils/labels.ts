import type {
	EdiblePart,
	EditSuggestionStatus,
	Gender,
	NoteType,
	PlantingMethod,
	SourceType,
	Stratum,
	TipSubject,
	VegetableLifeCycle,
	VegetableUsage,
	VegetableWishlistStatus,
} from '@/edgedb.interfaces'
import type { VegetableData } from '@/schemas'

export const STRATUM_TO_LABEL = {
	EMERGENTE: 'Emergente',
	ALTO: 'Alto',
	MEDIO: 'Médio',
	BAIXO: 'Baixo',
	RASTEIRO: 'Rasteiro',
} as const satisfies Record<Stratum, string>

export const VEGETABLE_LIFECYCLE_TO_LABEL = {
	SEMESTRAL: 'Semestral',
	ANUAL: 'Anual',
	BIENAL: 'Bienal',
	PERENE: 'Perene',
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
	ENXERTO: 'Enxerto',
	ESTACA: 'Estaca ou rama',
	RIZOMA: 'Rizoma',
	SEMENTE: 'Semente',
	TUBERCULO: 'Tubérculo',
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
} as const satisfies Record<NoteType, string>

export const EDIT_SUGGESTION_STATUS_TO_LABEL = {
	PENDING_REVIEW: 'Em revisão',
	MERGED: 'Aprovada',
	REJECTED: 'Rejeitada',
} as const satisfies Record<EditSuggestionStatus, string>

export const VEGETABLE_FIELD_LABELS_MAP: Record<
	Exclude<keyof typeof VegetableData.Encoded, 'id'>,
	string
> = {
	content: 'Conteúdo livre sobre o vegetal',
	edible_parts: 'Partes comestíveis',
	friends: 'Amigues',
	gender: 'Gênero gramatical',
	handle: 'Endereço no site',
	height_max: 'Altura adulta máxima',
	height_min: 'Altura adulta mínima',
	lifecycles: 'Ciclo de vida',
	names: 'Nomes',
	origin: 'Origem',
	photos: 'Fotos',
	planting_methods: 'Plantio por',
	scientific_names: 'Nomes científicos',
	sources: 'Fontes',
	strata: 'Estrato de cultivo',
	temperature_max: 'Temperatura ideal máxima',
	temperature_min: 'Temperatura ideal mínima',
	uses: 'Principais usos',
	varieties: 'Variedades',
}
