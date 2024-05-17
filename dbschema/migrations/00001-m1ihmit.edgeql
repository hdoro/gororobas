CREATE MIGRATION m1ihmitfe7uzg4jiux4hmch6ak2mawa37feeg6btdb3heaumqlcawa
    ONTO initial
{
  CREATE EXTENSION pgcrypto VERSION '1.3';
  CREATE EXTENSION auth VERSION '1.0';
  CREATE SCALAR TYPE default::EdiblePart EXTENDING enum<FRUTO, FLOR, FOLHA, CAULE, SEMENTE, CASCA, BULBO, BROTO, RAIZ, TUBERCULO, RIZOMA>;
  CREATE SCALAR TYPE default::PlantingMethod EXTENDING enum<BROTO, ENXERTO, ESTACA, RIZOMA, SEMENTE, TUBERCULO>;
  CREATE SCALAR TYPE default::Stratum EXTENDING enum<EMERGENTE, ALTO, MEDIO, BAIXO, RASTEIRO>;
  CREATE SCALAR TYPE default::VegetableLifeCycle EXTENDING enum<SEMESTRAL, ANUAL, BIENAL, PERENE>;
  CREATE SCALAR TYPE default::VegetableUsage EXTENDING enum<ALIMENTO_ANIMAL, ALIMENTO_HUMANO, CONSTRUCAO, MATERIA_ORGANICA, MEDICINAL, COSMETICO, ORNAMENTAL, RITUALISTICO>;
  CREATE ABSTRACT TYPE default::AdminCanDoAnything;
  CREATE SCALAR TYPE default::Role EXTENDING enum<ADMIN, USER, MODERATOR>;
  CREATE TYPE default::User EXTENDING default::AdminCanDoAnything {
      CREATE REQUIRED LINK identity: ext::auth::Identity {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY created: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
      };
      CREATE PROPERTY email: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY updated: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
      CREATE PROPERTY userRole: default::Role {
          SET default := 'USER';
      };
  };
  CREATE GLOBAL default::current_user := (std::assert_single((SELECT
      default::User
  FILTER
      (.identity = GLOBAL ext::auth::ClientTokenIdentity)
  )));
  CREATE ABSTRACT TYPE default::PublicRead {
      CREATE ACCESS POLICY public_read_only
          ALLOW SELECT ;
  };
  CREATE ABSTRACT TYPE default::UserCanInsert {
      CREATE ACCESS POLICY authenticated_user_can_insert
          ALLOW INSERT USING (EXISTS (GLOBAL default::current_user));
  };
  CREATE ABSTRACT TYPE default::WithHandle {
      CREATE REQUIRED PROPERTY handle: std::str {
          CREATE DELEGATED CONSTRAINT std::exclusive;
          CREATE CONSTRAINT std::min_len_value(2);
          CREATE CONSTRAINT std::regexp('^[a-z0-9-]+$');
          CREATE ANNOTATION std::title := 'An unique (per-type) URL-friendly handle';
      };
  };
  CREATE SCALAR TYPE default::Gender EXTENDING enum<FEMININO, MASCULINO, NEUTRO>;
  CREATE ABSTRACT TYPE default::Auditable {
      CREATE PROPERTY created_at: std::datetime {
          SET default := (std::datetime_of_transaction());
          SET readonly := true;
      };
      CREATE PROPERTY updated_at: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  CREATE TYPE default::Vegetable EXTENDING default::WithHandle, default::PublicRead, default::Auditable, default::UserCanInsert, default::AdminCanDoAnything {
      CREATE PROPERTY edible_parts: array<default::EdiblePart>;
      CREATE PROPERTY planting_methods: array<default::PlantingMethod>;
      CREATE PROPERTY strata: array<default::Stratum>;
      CREATE PROPERTY lifecycles: array<default::VegetableLifeCycle>;
      CREATE PROPERTY uses: array<default::VegetableUsage>;
      CREATE PROPERTY content: std::json;
      CREATE PROPERTY gender: default::Gender;
      CREATE PROPERTY height_max: std::float32;
      CREATE PROPERTY height_min: std::float32;
      CREATE REQUIRED PROPERTY names: array<std::str>;
      CREATE PROPERTY origin: std::str;
      CREATE PROPERTY scientific_names: array<std::str>;
      CREATE PROPERTY temperature_max: std::float32;
      CREATE PROPERTY temperature_min: std::float32;
  };
  ALTER TYPE default::AdminCanDoAnything {
      CREATE ACCESS POLICY admin_can_do_anything
          ALLOW ALL USING (((GLOBAL default::current_user).userRole ?= default::Role.ADMIN));
  };
  CREATE SCALAR TYPE default::SourceType EXTENDING enum<GOROROBAS, EXTERNAL>;
  CREATE ABSTRACT TYPE default::WithSource {
      CREATE PROPERTY credits: std::str;
      CREATE PROPERTY source: std::str;
      CREATE PROPERTY sourceType: default::SourceType;
  };
  CREATE TYPE default::Image EXTENDING default::WithSource, default::PublicRead, default::Auditable, default::AdminCanDoAnything {
      CREATE PROPERTY crop: std::json;
      CREATE PROPERTY hotspot: std::json;
      CREATE PROPERTY label: std::str;
      CREATE REQUIRED PROPERTY sanity_id: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::User {
      CREATE ACCESS POLICY owner_can_select_or_delete
          ALLOW SELECT, DELETE USING (((GLOBAL default::current_user).identity ?= .identity));
  };
  CREATE TYPE default::UserProfile EXTENDING default::WithHandle, default::PublicRead {
      CREATE REQUIRED LINK user: default::User {
          ON TARGET DELETE DELETE SOURCE;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE LINK photo: default::Image;
      CREATE PROPERTY bio: std::str;
      CREATE PROPERTY location: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE ACCESS POLICY owner_has_full_access
          ALLOW ALL USING ((GLOBAL default::current_user ?= .user));
  };
  CREATE SCALAR TYPE default::VegetableWishlistStatus EXTENDING enum<QUERO_CULTIVAR, SEM_INTERESSE, JA_CULTIVEI, ESTOU_CULTIVANDO>;
  CREATE TYPE default::UserWishlist EXTENDING default::AdminCanDoAnything {
      CREATE REQUIRED LINK user_profile: default::UserProfile {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED LINK vegetable: default::Vegetable {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE CONSTRAINT std::exclusive ON ((.user_profile, .vegetable));
      CREATE REQUIRED PROPERTY status: default::VegetableWishlistStatus;
  };
  ALTER TYPE default::Auditable {
      CREATE LINK created_by: default::UserProfile {
          ON TARGET DELETE ALLOW;
      };
  };
  CREATE TYPE default::VegetableFriendship EXTENDING default::Auditable, default::PublicRead, default::AdminCanDoAnything {
      CREATE REQUIRED MULTI LINK vegetables: default::Vegetable {
          ON TARGET DELETE DELETE SOURCE;
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY unique_key: std::str {
          SET readonly := true;
      };
      CREATE CONSTRAINT std::exclusive ON (.unique_key);
  };
  ALTER TYPE default::WithSource {
      CREATE MULTI LINK users: default::UserProfile {
          ON TARGET DELETE ALLOW;
      };
  };
  CREATE SCALAR TYPE default::TipSubject EXTENDING enum<PLANTIO, CRESCIMENTO, COLHEITA>;
  CREATE TYPE default::VegetableTip EXTENDING default::WithHandle, default::WithSource, default::PublicRead, default::Auditable, default::AdminCanDoAnything {
      CREATE MULTI LINK content_links: default::WithHandle {
          ON TARGET DELETE ALLOW;
      };
      CREATE REQUIRED PROPERTY content: std::json;
      CREATE REQUIRED MULTI PROPERTY subjects: default::TipSubject;
  };
  CREATE TYPE default::VegetableVariety EXTENDING default::WithHandle, default::PublicRead, default::Auditable, default::UserCanInsert, default::AdminCanDoAnything {
      CREATE MULTI LINK photos: default::Image {
          CREATE PROPERTY order_index: std::int16;
      };
      CREATE REQUIRED PROPERTY names: array<std::str>;
  };
  CREATE GLOBAL default::current_user_profile := (std::assert_single((SELECT
      default::UserProfile
  FILTER
      (.user = GLOBAL default::current_user)
  )));
  ALTER TYPE default::UserWishlist {
      CREATE ACCESS POLICY owner_can_do_anything
          ALLOW ALL USING ((GLOBAL default::current_user_profile ?= .user_profile));
  };
  ALTER TYPE default::Vegetable {
      CREATE MULTI LINK friends := (.<vegetables[IS default::VegetableFriendship]);
  };
  ALTER TYPE default::Auditable {
      ALTER LINK created_by {
          CREATE REWRITE
              INSERT 
              USING (GLOBAL default::current_user_profile);
      };
  };
  CREATE SCALAR TYPE default::HistoryAction EXTENDING enum<`INSERT`, `UPDATE`, `DELETE`>;
  CREATE TYPE default::HistoryLog {
      CREATE LINK performed_by: default::UserProfile {
          ON TARGET DELETE ALLOW;
      };
      CREATE LINK target: default::Auditable {
          ON TARGET DELETE ALLOW;
      };
      CREATE REQUIRED PROPERTY action: default::HistoryAction;
      CREATE PROPERTY old: std::json;
      CREATE PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
      CREATE PROPERTY new: std::json;
  };
  ALTER TYPE default::Auditable {
      CREATE TRIGGER log_delete
          AFTER DELETE 
          FOR EACH DO (INSERT
              default::HistoryLog
              {
                  action := default::HistoryAction.`DELETE`,
                  target := __old__,
                  performed_by := GLOBAL default::current_user_profile,
                  old := <std::json>__old__
              });
      CREATE TRIGGER log_insert
          AFTER INSERT 
          FOR EACH DO (INSERT
              default::HistoryLog
              {
                  action := default::HistoryAction.`INSERT`,
                  target := __new__,
                  performed_by := GLOBAL default::current_user_profile,
                  new := <std::json>__new__
              });
      CREATE TRIGGER log_update
          AFTER UPDATE 
          FOR EACH DO (INSERT
              default::HistoryLog
              {
                  action := default::HistoryAction.`UPDATE`,
                  target := __new__,
                  performed_by := GLOBAL default::current_user_profile,
                  old := <std::json>__old__,
                  new := <std::json>__new__
              });
  };
  ALTER TYPE default::Vegetable {
      CREATE MULTI LINK photos: default::Image {
          CREATE PROPERTY order_index: std::int16;
      };
      CREATE MULTI LINK tips: default::VegetableTip {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE ALLOW;
          CREATE CONSTRAINT std::exclusive;
          CREATE PROPERTY order_index: std::int16;
      };
      CREATE MULTI LINK varieties: default::VegetableVariety {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE ALLOW;
          CREATE CONSTRAINT std::exclusive;
          CREATE PROPERTY order_index: std::int16;
      };
  };
};
