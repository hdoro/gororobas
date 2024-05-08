using extension auth;

module default {
  # QUESTIONS:
  # 1. How do Enums evolve over time? Postgres doesn't allow modifying them
  #   ✨ EdgeDB win #1: enums can be easily modified
  # 2. How does removing an Enum option work?
  #   💩 EdgeDB failure #1: the schema migration doesn't handle that, and so they can't be applied if invalid values are found
  #   ❓ Caveat: Perhaps there's a way to handle this in the schema migration?
  # 3. Should I include public user data in the User type, or move it to a separate one that is linked to it?
  #   Data includes: name, location, photo
  # 
  # DECISIONS:
  # 1. I'll keep storing images in Sanity (good CDN, good pricing, familiar API)
  
  scalar type Role extending enum<ADMIN,USER,MODERATOR>;
  scalar type SourceType extending enum<GOROROBAS,EXTERNAL>;
  scalar type Gender extending enum<FEMININO,MASCULINO,NEUTRO>;
  scalar type VegetableUsage extending enum<ALIMENTO_ANIMAL,ALIMENTO_HUMANO,CONSTRUCAO,MATERIA_ORGANICA,MEDICINAL,COSMETICO,PAISAGISMO,RITUALISTICO>;
  scalar type EdiblePart extending enum<FRUTO,FLOR,FOLHA,CAULE,SEMENTE,CASCA,BULBO,BROTO,RAIZ,TUBERCULO,RIZOMA>;
  scalar type VegetableLifeCycle extending enum<SEMESTRAL,ANUAL,BIENAL,PERENE>;
  scalar type Stratum extending enum<EMERGENTE,ALTO,MEDIO,BAIXO,RASTEIRO>;
  scalar type PlantingMethod extending enum<BROTO,ENXERTO,ESTACA,RIZOMA,SEMENTE,TUBERCULO>;
  scalar type TipSubject extending enum<PLANTIO,CRESCIMENTO,COLHEITA>;

  global current_user := (
    assert_single((
      select User
      filter .identity = global ext::auth::ClientTokenIdentity
    ))
  );
  global current_user_profile := (
    assert_single((
      select UserProfile
      filter .user = global current_user
    ))
  );

  type User {
    required identity: ext::auth::Identity {
      constraint exclusive;
    };
    email: str;
  
    userRole: Role {
      default := "USER";
    };

    created: datetime {
      rewrite insert using (datetime_of_statement());
    }
    updated: datetime {
      rewrite insert using (datetime_of_statement());
      rewrite update using (datetime_of_statement());
    }
  }

  scalar type HistoryAction extending enum<`INSERT`, `UPDATE`, `DELETE`>;
  type HistoryLog {
    required action: HistoryAction;
    timestamp: datetime {
      default := datetime_current();
      readonly := true;
    };
    performed_by: User;
    old: json;
    new: json;
    target: Auditable {
      on target delete allow;
    };
  }

  abstract type Auditable {
    created_at: datetime {
      default := datetime_of_transaction();
      readonly := true;
    };
    updated_at: datetime {
      rewrite insert, update using (datetime_of_statement());
    };
    created_by: User {
      rewrite insert using (global current_user);
      on target delete allow;
    };

    trigger log_insert after insert for each do (
      insert HistoryLog {
        action := HistoryAction.`INSERT`,
        target := __new__,
        performed_by := global current_user,
        new := <json>__new__
      }
    );

    trigger log_update after update for each do (
      insert HistoryLog {
        action := HistoryAction.`UPDATE`,
        target := __new__,
        performed_by := global current_user,
        old := <json>__old__,
        new := <json>__new__,
      }
    );

    trigger log_delete after delete for each do (
      insert HistoryLog {
        action := HistoryAction.`DELETE`,
        target := __old__,
        performed_by := global current_user,
        old := <json>__old__
      }
    );
  }

  abstract type WithSource {
    sourceType: SourceType;
    credits: str;
    source: str;
    multi users: User;
  }

  abstract type PublicRead {
    access policy public_read_only
      allow select;
  }

  abstract type UserCanInsert {
    access policy authenticated_user_can_insert
      allow insert
      using (exists global current_user);
  }

  abstract type WithHandle {
    required handle: str {
      annotation title := 'An unique (per-type) URL-friendly handle';
      
      # Can't be modified after creation for URL integrity
      # @TODO can we have a `past_handles` array that keeps track of previous handles automatically?
      # readonly := true;

      # exclusive among the current object type
      delegated constraint exclusive;

      constraint min_len_value(2);
      # slugs-can-only-contain-numbers-letters-and-dashes
      constraint regexp(r'^[a-z0-9-]+$');
    };
  }

  type Photo extending WithSource, PublicRead, Auditable {
    required sanityId: str {
      constraint exclusive;
    };
    label: str;
  }

  type UserProfile extending WithHandle, PublicRead, Auditable {
    required user: User {
      constraint exclusive;
    };
    required name: str;
    bio: str;
    location: str;
    photo: Photo;

    access policy owner_has_full_access
      allow all
      using (global current_user ?= .user);
  }

  type VegetableVariety extending WithHandle, PublicRead, Auditable {
    required names: array<str>;
    multi photos: Photo;
  }

  type VegetableTip extending WithHandle, WithSource, PublicRead, Auditable {
    required subject: TipSubject;
    required content: json;

    multi content_links: WithHandle;
  }

  type Vegetable extending WithHandle, PublicRead, Auditable, UserCanInsert {
    required names: array<str>;
    required scientific_names: array<str>;
    required gender: Gender;
    required stratum: array<Stratum>;
    planting_methods: array<PlantingMethod>;
    edible_parts: array<EdiblePart>;
    uses: array<VegetableUsage>;
    origin: str;
    height_min: float32;
    height_max: float32;
    temperature_min: float32;
    temperature_max: float32;
    content: json;

    multi photos: Photo;
    multi varieties: VegetableVariety {
      constraint exclusive;
      order_index: int16;
    };
    multi tips: VegetableTip {
      constraint exclusive;
      order_index: int16;
    };

    # Computed
    consortia := .<vegetables[is VegetableConsortium];
  }

  type VegetableConsortium {
    required multi vegetables: Vegetable {
      order_index: int16;
    };
    notes: str;
  }
}