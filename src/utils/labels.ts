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
import { m } from '@/paraglide/messages'
import type { ResourceData, VegetableData } from '@/schemas'

export const STRATUM_TO_LABEL = {
  get EMERGENTE() {
    return m.stratum_emergente()
  },
  get ALTO() {
    return m.stratum_alto()
  },
  get MEDIO() {
    return m.stratum_medio()
  },
  get BAIXO() {
    return m.stratum_baixo()
  },
  get RASTEIRO() {
    return m.stratum_rasteiro()
  },
} as const satisfies Record<Stratum, string>

export const STRATUM_EXPLAINERS = {
  get EMERGENTE() {
    return m.stratum_explainer_emergente()
  },
  get ALTO() {
    return m.stratum_explainer_alto()
  },
  get MEDIO() {
    return m.stratum_explainer_medio()
  },
  get BAIXO() {
    return m.stratum_explainer_baixo()
  },
  get RASTEIRO() {
    return m.stratum_explainer_rasteiro()
  },
} as const satisfies Record<Stratum, string>

export const VEGETABLE_LIFECYCLE_TO_LABEL = {
  get SEMESTRAL() {
    return m.vegetable_lifecycle_semestral()
  },
  get ANUAL() {
    return m.vegetable_lifecycle_anual()
  },
  get BIENAL() {
    return m.vegetable_lifecycle_bienal()
  },
  get PERENE() {
    return m.vegetable_lifecycle_perene()
  },
} as const satisfies Record<VegetableLifeCycle, string>

export const VEGETABLE_LIFECYCLE_EXPLAINERS = {
  get SEMESTRAL() {
    return m.vegetable_lifecycle_explainer_semestral()
  },
  get ANUAL() {
    return m.vegetable_lifecycle_explainer_anual()
  },
  get BIENAL() {
    return m.vegetable_lifecycle_explainer_bienal()
  },
  get PERENE() {
    return m.vegetable_lifecycle_explainer_perene()
  },
} as const satisfies Record<VegetableLifeCycle, string>

export const USAGE_TO_LABEL = {
  get ALIMENTO_ANIMAL() {
    return m.vegetable_usage_alimento_animal()
  },
  get ALIMENTO_HUMANO() {
    return m.vegetable_usage_alimento_humano()
  },
  get CONSTRUCAO() {
    return m.vegetable_usage_construcao()
  },
  get COSMETICO() {
    return m.vegetable_usage_cosmetico()
  },
  get MATERIA_ORGANICA() {
    return m.vegetable_usage_materia_organica()
  },
  get MEDICINAL() {
    return m.vegetable_usage_medicinal()
  },
  get ORNAMENTAL() {
    return m.vegetable_usage_ornamental()
  },
  get RITUALISTICO() {
    return m.vegetable_usage_ritualistico()
  },
  get ECOLOGICO() {
    return m.vegetable_usage_ecologico()
  },
} as const satisfies Record<VegetableUsage, string>

export const EDIBLE_PART_TO_LABEL = {
  get FRUTO() {
    return m.edible_part_fruto()
  },
  get FLOR() {
    return m.edible_part_flor()
  },
  get FOLHA() {
    return m.edible_part_folha()
  },
  get CAULE() {
    return m.edible_part_caule()
  },
  get SEMENTE() {
    return m.edible_part_semente()
  },
  get CASCA() {
    return m.edible_part_casca()
  },
  get BULBO() {
    return m.edible_part_bulbo()
  },
  get BROTO() {
    return m.edible_part_broto()
  },
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
  get RAIZ() {
    return m.edible_part_raiz()
  },
  /**
   * Tubérculo: órgãos de reserva de nutrientes.
   * Os tubérculos são capazes de produzir novas plantas.
   *
   * Exemplos: Mandioca, batata
   */
  get TUBERCULO() {
    return m.edible_part_tuberculo()
  },
  /**
   * Rizoma: caule subterrâneo que cresce horizontalmente e produz raízes e brotos.
   *
   * Exemplos: gengibre, açafrão-da-terra, cana-de-açúcar
   */
  get RIZOMA() {
    return m.edible_part_rizoma()
  },
} as const satisfies Record<EdiblePart, string>

export const PLANTING_METHOD_TO_LABEL = {
  get BROTO() {
    return m.planting_method_broto()
  },
  get ENXERTO() {
    return m.planting_method_enxerto()
  },
  get ESTACA() {
    return m.planting_method_estaca()
  },
  get RIZOMA() {
    return m.planting_method_rizoma()
  },
  get SEMENTE() {
    return m.planting_method_semente()
  },
  get TUBERCULO() {
    return m.planting_method_tuberculo()
  },
} as const satisfies Record<PlantingMethod, string>

export const PLANTING_METHOD_EXPLAINERS = {
  get BROTO() {
    return m.planting_method_explainer_broto()
  },
  get ENXERTO() {
    return m.planting_method_explainer_enxerto()
  },
  get ESTACA() {
    return m.planting_method_explainer_estaca()
  },
  get RIZOMA() {
    return m.planting_method_explainer_rizoma()
  },
  /**
   * "Não jogue fora as sementes, guarde pra mim por amor" 🎶
   * Chegou até mim atráves de AS SEMENTES, de Marcelo D2, e de uma amiga (Bia) que trocou o "favor" por "amor" 🌻
   */
  get SEMENTE() {
    return m.planting_method_explainer_semente()
  },
  get TUBERCULO() {
    return m.planting_method_explainer_tuberculo()
  },
} as const satisfies Record<PlantingMethod, string>

export const TIP_SUBJECT_TO_LABEL = {
  get PLANTIO() {
    return m.tip_subject_plantio()
  },
  get CRESCIMENTO() {
    return m.tip_subject_crescimento()
  },
  get COLHEITA() {
    return m.tip_subject_colheita()
  },
} as const satisfies Record<TipSubject, string>

export const SOURCE_TYPE_TO_LABEL = {
  get GOROROBAS() {
    return m.source_type_gororobas()
  },
  get EXTERNAL() {
    return m.source_type_external()
  },
} as const satisfies Record<SourceType, string>

export const GENDER_TO_LABEL = {
  get FEMININO() {
    return m.gender_feminino()
  },
  get MASCULINO() {
    return m.gender_masculino()
  },
  get NEUTRO() {
    return m.gender_neutro()
  },
} as const satisfies Record<Gender, string>

export const WISHLIST_STATUS_TO_LABEL = {
  get QUERO_CULTIVAR() {
    return m.wishlist_status_quero_cultivar()
  },
  get SEM_INTERESSE() {
    return m.wishlist_status_sem_interesse()
  },
  get JA_CULTIVEI() {
    return m.wishlist_status_ja_cultivei()
  },
  get ESTOU_CULTIVANDO() {
    return m.wishlist_status_estou_cultivando()
  },
} as const satisfies Record<VegetableWishlistStatus, string>

export const NOTE_TYPE_TO_LABEL = {
  get DESCOBERTA() {
    return m.note_type_descoberta()
  },
  get ENSINAMENTO() {
    return m.note_type_ensinamento()
  },
  get EXPERIMENTO() {
    return m.note_type_experimento()
  },
  get PERGUNTA() {
    return m.note_type_pergunta()
  },
  get INSPIRACAO() {
    return m.note_type_inspiracao()
  },
} as const satisfies Record<NoteType, string>

export const EDIT_SUGGESTION_STATUS_TO_LABEL = {
  get PENDING_REVIEW() {
    return m.edit_suggestion_status_pending_review()
  },
  get MERGED() {
    return m.edit_suggestion_status_merged()
  },
  get REJECTED() {
    return m.edit_suggestion_status_rejected()
  },
} as const satisfies Record<EditSuggestionStatus, string>

export const NOTE_PUBLISH_STATUS_TO_LABEL = {
  get PRIVATE() {
    return m.publish_status_private()
  },
  get COMMUNITY() {
    return m.publish_status_community()
  },
  get PUBLIC() {
    return m.publish_status_public()
  },
} as const satisfies Record<NotePublishStatus, string>

export const VEGETABLE_FIELD_LABELS_MAP: Record<
  Exclude<keyof typeof VegetableData.Encoded, 'id'>,
  string
> = {
  get content() {
    return m.vegetable_field_content()
  },
  get edible_parts() {
    return m.vegetable_field_edible_parts()
  },
  get friends() {
    return m.vegetable_field_friends()
  },
  get gender() {
    return m.vegetable_field_gender()
  },
  get handle() {
    return m.vegetable_field_handle()
  },
  get lifecycles() {
    return m.vegetable_field_lifecycles()
  },
  get names() {
    return m.vegetable_field_names()
  },
  get origin() {
    return m.vegetable_field_origin()
  },
  get photos() {
    return m.vegetable_field_photos()
  },
  get planting_methods() {
    return m.vegetable_field_planting_methods()
  },
  get scientific_names() {
    return m.vegetable_field_scientific_names()
  },
  get sources() {
    return m.vegetable_field_sources()
  },
  get strata() {
    return m.vegetable_field_strata()
  },
  get development_cycle_max() {
    return m.vegetable_field_development_cycle_max()
  },
  get development_cycle_min() {
    return m.vegetable_field_development_cycle_min()
  },
  get height_max() {
    return m.vegetable_field_height_max()
  },
  get height_min() {
    return m.vegetable_field_height_min()
  },
  get temperature_max() {
    return m.vegetable_field_temperature_max()
  },
  get temperature_min() {
    return m.vegetable_field_temperature_min()
  },
  get uses() {
    return m.vegetable_field_uses()
  },
  get varieties() {
    return m.vegetable_field_varieties()
  },
}

export const RESOURCE_FORMAT_TO_LABEL = {
  get BOOK() {
    return m.format_book()
  },
  get FILM() {
    return m.format_movie()
  },
  get SOCIAL_MEDIA() {
    return m.format_social_media()
  },
  get VIDEO() {
    return m.format_video()
  },
  get ARTICLE() {
    return m.format_article()
  },
  get PODCAST() {
    return m.format_podcast()
  },
  get COURSE() {
    return m.format_course()
  },
  get ACADEMIC_WORK() {
    return m.format_academic_work()
  },
  get DATASET() {
    return m.format_dataset()
  },
  get ORGANIZATION() {
    return m.format_organization()
  },
  get OTHER() {
    return m.format_other()
  },
} as const satisfies Record<ResourceFormat, string>

export const RESOURCE_FIELD_LABELS_MAP: Record<
  Exclude<keyof typeof ResourceData.Encoded, 'id'>,
  string
> = {
  get title() {
    return m.resource_field_title()
  },
  get format() {
    return m.resource_field_format()
  },
  get url() {
    return m.resource_field_url()
  },
  get description() {
    return m.resource_field_description()
  },
  get tags() {
    return m.resource_field_tags()
  },
  get related_vegetables() {
    return m.resource_field_related_vegetables()
  },
  get credit_line() {
    return m.resource_field_credit_line()
  },
  get thumbnail() {
    return m.resource_field_thumbnail()
  },
}

export const RESOURCE_FORMAT_ACTION_LABELS = {
  get BOOK() {
    return m.resource_format_action_book()
  },
  get FILM() {
    return m.resource_format_action_film()
  },
  get SOCIAL_MEDIA() {
    return m.resource_format_action_social_media()
  },
  get VIDEO() {
    return m.resource_format_action_video()
  },
  get ARTICLE() {
    return m.resource_format_action_article()
  },
  get PODCAST() {
    return m.resource_format_action_podcast()
  },
  get COURSE() {
    return m.resource_format_action_course()
  },
  get ACADEMIC_WORK() {
    return m.resource_format_action_academic_work()
  },
  get DATASET() {
    return m.resource_format_action_dataset()
  },
  get ORGANIZATION() {
    return m.resource_format_action_organization()
  },
  get OTHER() {
    return m.resource_format_action_other()
  },
} as const satisfies Record<ResourceFormat, string>
