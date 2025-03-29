const BASE_FOLDER = 'scripts'
const RESOURCE_LIBRARY_FOLDER = `${BASE_FOLDER}/resource-library-bootstrap/resources`
const TAG_LIBRARY_FOLDER = `${BASE_FOLDER}/resource-library-bootstrap/tags`

export const SCRIPT_PATHS = {
  sourcing_db: `${BASE_FOLDER}/resource-sourcing/db`,
  images_downloading_cache: `${BASE_FOLDER}/resource-library-bootstrap/images-cache`,
  resources: {
    root: RESOURCE_LIBRARY_FOLDER,
    inbox: `${RESOURCE_LIBRARY_FOLDER}/inbox`,
    processed: `${RESOURCE_LIBRARY_FOLDER}/processed`,
    triage: `${RESOURCE_LIBRARY_FOLDER}/triage`,
    discarded: `${RESOURCE_LIBRARY_FOLDER}/discarded`,
  },
  tags: {
    root: TAG_LIBRARY_FOLDER,
    inbox: `${TAG_LIBRARY_FOLDER}/inbox`,
    processed: `${TAG_LIBRARY_FOLDER}/processed`,
  },
} as const
