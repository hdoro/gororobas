# https://github.com/mulungood/gororobas/blob/ce3b0f1621f86034efb3cf534a20391efc5c5a42/edgedb/default.esdl
using extension auth;

module default {

  scalar type Role extending enum<ADMIN,USER,MODERATOR>;
  scalar type SourceType extending enum<GOROROBAS,EXTERNAL>;
  scalar type Gender extending enum<FEMININO,MASCULINO,NEUTRO>;
  scalar type VegetableUsage extending enum<ALIMENTO_ANIMAL,ALIMENTO_HUMANO,CONSTRUCAO,MATERIA_ORGANICA,MEDICINAL,COSMETICO,ORNAMENTAL,RITUALISTICO,ECOLOGICO>;
  scalar type EdiblePart extending enum<FRUTO,FLOR,FOLHA,CAULE,SEMENTE,CASCA,BULBO,BROTO,RAIZ,TUBERCULO,RIZOMA>;
  scalar type VegetableLifeCycle extending enum<SEMESTRAL,ANUAL,BIENAL,PERENE>;
  scalar type Stratum extending enum<EMERGENTE,ALTO,MEDIO,BAIXO,RASTEIRO>;
  scalar type PlantingMethod extending enum<BROTO,ENXERTO,ESTACA,RIZOMA,SEMENTE,TUBERCULO>;
  scalar type TipSubject extending enum<PLANTIO,CRESCIMENTO,COLHEITA>;
  scalar type NoteType extending enum<EXPERIMENTO,ENSINAMENTO,DESCOBERTA>;
  scalar type VegetableWishlistStatus extending enum<QUERO_CULTIVAR,SEM_INTERESSE,JA_CULTIVEI,ESTOU_CULTIVANDO>;
  scalar type EditSuggestionStatus extending enum<PENDING_REVIEW,MERGED,UNAPPROVED>;

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

  abstract type UserCanInsert {
    access policy authenticated_user_can_insert
      allow insert
      using (exists global current_user);
  }

  abstract type AdminCanDoAnything {
    access policy admin_can_do_anything
      allow all
      using (global current_user.userRole ?= Role.ADMIN);
  }

  # 🚧 WARNING: **access policy is deactivated**, any session can access User
  # 👉 Don't query/modify without first checking if the user has access
  # ❓ @TODO is there a way to implement access policies on User without getting `required link 'user' of object type 'default::UserProfile' is hidden by access policy`?
  #   - I've tried Elvis' suggestion of using an optional property but it doesn't work - https://discord.com/channels/841451783728529451/1118375623019221012/1118577633144348682
  #   - Created an issue in the Next template: https://github.com/edgedb/nextjs-edgedb-auth-template/issues/8
  type User {
    required identity: ext::auth::Identity {
      constraint exclusive;
      
      on target delete delete source;
    };
    email: str {
      constraint exclusive;
    };
    userRole: Role {
      default := "USER";
    };
    created: datetime {
      rewrite insert using (datetime_of_statement());
    };
    updated: datetime {
      rewrite insert using (datetime_of_statement());
      rewrite update using (datetime_of_statement());
    };
  }

  type UserProfile extending WithHandle, PublicRead {
    required user: User {
      constraint exclusive;

      on target delete delete source;
    };
    required name: str;
    bio: json;
    location: str;
    photo: Image;

    access policy owner_can_modify
      allow update
      using (global current_user ?= .user);
  }

  scalar type HistoryAction extending enum<`INSERT`, `UPDATE`, `DELETE`>;
  type HistoryLog {
    required action: HistoryAction;
    timestamp: datetime {
      default := datetime_current();
      readonly := true;
    };
    performed_by: UserProfile {
      on target delete allow;
    };;
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
    created_by: UserProfile {
      default := (global current_user_profile);
      on target delete allow;
    };

    trigger log_insert after insert for each do (
      insert HistoryLog {
        action := HistoryAction.`INSERT`,
        target := __new__,
        performed_by := __new__.created_by,
        new := <json>__new__
      }
    );

    trigger log_update after update for each do (
      insert HistoryLog {
        action := HistoryAction.`UPDATE`,
        target := __new__,
        performed_by := global current_user_profile,
        old := <json>__old__,
        new := <json>__new__,
      }
    );

    trigger log_delete after delete for each do (
      insert HistoryLog {
        action := HistoryAction.`DELETE`,
        target := __old__,
        performed_by := global current_user_profile,
        old := <json>__old__
      }
    );
  }

  type Source extending PublicRead, UserCanInsert, AdminCanDoAnything {
    required type: SourceType;
    credits: str;
    origin: str;
    comments: json;
    multi users: UserProfile {
      on target delete allow;
      on source delete allow;
    };
  }

  abstract type PublicRead {
    access policy public_read_only
      allow select;
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

  type Image extending PublicRead, Auditable, UserCanInsert, AdminCanDoAnything {
    required sanity_id: str {
      constraint exclusive;
    };
    label: str;
    # Sanity-compliant values
    hotspot: json;
    crop: json;

    multi sources: Source {
      on target delete allow;
      on source delete allow;
    }
  }

  type VegetableVariety extending WithHandle, PublicRead, Auditable, UserCanInsert, AdminCanDoAnything {
    required names: array<str>;
    multi photos: Image {
      order_index: int16;
      on target delete allow;
      on source delete allow;
    };
  }

  type VegetableTip extending WithHandle, PublicRead, Auditable, AdminCanDoAnything {
    required multi subjects: TipSubject;
    required content: json;

    multi sources: Source {
      on target delete allow;
      on source delete allow;
    };
  }

  type Vegetable extending WithHandle, PublicRead, Auditable, UserCanInsert, AdminCanDoAnything {
    required names: array<str>;
    scientific_names: array<str>;
    gender: Gender;
    multi strata: Stratum;
    multi planting_methods: PlantingMethod;
    multi edible_parts: EdiblePart;
    multi lifecycles: VegetableLifeCycle;
    multi uses: VegetableUsage;
    origin: str;
    height_min: float32;
    height_max: float32;
    temperature_min: float32;
    temperature_max: float32;
    content: json;

    multi photos: Image {
      order_index: int16;
      on target delete allow;
      on source delete allow;
    };

    multi varieties: VegetableVariety {
      constraint exclusive;
      order_index: int16;
      
      on target delete allow;
      # When a vegetable is deleted, delete all of its varieties
      on source delete delete target;
    };

    multi tips: VegetableTip {
      constraint exclusive;
      order_index: int16;
      
      on target delete allow;
      # When a vegetable is deleted, delete all of its tips
      on source delete delete target;
    };

    multi sources: Source {
      on target delete allow;
      on source delete allow;
    };

    # Computed
    multi friends := (
      with parent_id := .id
      select .<vegetables[is VegetableFriendship].vegetables
      filter .id != parent_id
    );
    multi wishlisted_by := (
      with parent_id := .id
      select .<vegetable[is UserWishlist]
          filter .status != <VegetableWishlistStatus>'SEM_INTERESSE'
    );
  }

  type VegetableFriendship extending Auditable, PublicRead, AdminCanDoAnything {
    required multi vegetables: Vegetable {
      # Can't modify a friendship after it's created
      readonly := true;
      
      on target delete delete source;
    };
    required unique_key: str {
      readonly := true;
    };

    constraint exclusive on (.unique_key);
  }

  type UserWishlist extending PublicRead {
    required user_profile: UserProfile {
      on target delete delete source;
    };
    required vegetable: Vegetable {
      on target delete delete source;
    };
    required status: VegetableWishlistStatus;

    constraint exclusive on ((.user_profile, .vegetable));
    
    access policy owner_can_do_anything
      allow all
      using (global current_user_profile ?= .user_profile);
  }

  type Note extending WithHandle, Auditable, AdminCanDoAnything {
    required public: bool;
    required published_at: datetime {
      default := datetime_of_transaction();
    };
    required multi types: NoteType;

    required title: json;
    body: json;

    # Related with AI
    multi related_vegetables: Vegetable {
      on target delete allow;
      on source delete allow;
    };
    multi related_notes: Vegetable {
      on target delete allow;
      on source delete allow;
    };

    access policy visible_if_public
      allow select
      using (.public);

    access policy owner_can_do_anything
      allow all
      using (global current_user_profile ?= .created_by);
  }

  type EditSuggestion extending Auditable, AdminCanDoAnything, UserCanInsert {
    required target_object: Vegetable;
    required diff: json;
    required snapshot: json;
    required status: EditSuggestionStatus;
  }
}