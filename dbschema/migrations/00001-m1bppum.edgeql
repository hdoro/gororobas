CREATE MIGRATION m1bppummu4chycncb76rodrrin5do7siz5ccw6qu7sy3ery75rnafa
    ONTO initial
{
  CREATE EXTENSION pgcrypto VERSION '1.3';
  CREATE EXTENSION auth VERSION '1.0';
  CREATE SCALAR TYPE default::EdiblePart EXTENDING enum<FRUTO, FLOR, FOLHA, CAULE, SEMENTE, CASCA, BULBO, BROTO, RAIZ, TUBERCULO, RIZOMA>;
  CREATE SCALAR TYPE default::PlantingMethod EXTENDING enum<BROTO, ENXERTO, ESTACA, RIZOMA, SEMENTE, TUBERCULO>;
  CREATE SCALAR TYPE default::Stratum EXTENDING enum<EMERGENTE, ALTO, MEDIO, BAIXO, RASTEIRO>;
  CREATE SCALAR TYPE default::VegetableUsage EXTENDING enum<ALIMENTO_ANIMAL, ALIMENTO_HUMANO, CONSTRUCAO, MATERIA_ORGANICA, MEDICINAL, COSMETICO, PAISAGISMO, RITUALISTICO>;
  CREATE SCALAR TYPE default::Role EXTENDING enum<ADMIN, USER, MODERATOR>;
  CREATE TYPE default::User {
      CREATE REQUIRED LINK identity: ext::auth::Identity {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY created: std::datetime {
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
      };
      CREATE PROPERTY email: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
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
  CREATE ABSTRACT TYPE default::Auditable {
      CREATE LINK created_by: default::User {
          ON TARGET DELETE ALLOW;
      };
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
  CREATE ABSTRACT TYPE default::PublicRead {
      CREATE ACCESS POLICY public_read_only
          ALLOW SELECT ;
  };
  CREATE SCALAR TYPE default::SourceType EXTENDING enum<GOROROBAS, EXTERNAL>;
  CREATE ABSTRACT TYPE default::WithSource {
      CREATE MULTI LINK users: default::User;
      CREATE PROPERTY credits: std::str;
      CREATE PROPERTY source: std::str;
      CREATE PROPERTY sourceType: default::SourceType;
  };
  CREATE TYPE default::Photo EXTENDING default::WithSource, default::PublicRead, default::Auditable {
      CREATE PROPERTY label: std::str;
      CREATE REQUIRED PROPERTY sanityId: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE ABSTRACT TYPE default::WithHandle {
      CREATE REQUIRED PROPERTY handle: std::str {
          CREATE DELEGATED CONSTRAINT std::exclusive;
          CREATE CONSTRAINT std::min_len_value(2);
          CREATE CONSTRAINT std::regexp('^[a-z0-9-]+$');
          CREATE ANNOTATION std::title := 'An unique (per-type) URL-friendly handle';
      };
  };
  CREATE SCALAR TYPE default::TipSubject EXTENDING enum<PLANTIO, CRESCIMENTO, COLHEITA>;
  CREATE TYPE default::VegetableTip EXTENDING default::WithHandle, default::WithSource, default::PublicRead, default::Auditable {
      CREATE MULTI LINK content_links: default::WithHandle;
      CREATE REQUIRED PROPERTY content: std::json;
      CREATE REQUIRED PROPERTY subject: default::TipSubject;
  };
  CREATE TYPE default::VegetableVariety EXTENDING default::WithHandle, default::PublicRead, default::Auditable {
      CREATE MULTI LINK photos: default::Photo;
      CREATE REQUIRED PROPERTY names: array<std::str>;
  };
  CREATE SCALAR TYPE default::Gender EXTENDING enum<FEMININO, MASCULINO, NEUTRO>;
  CREATE TYPE default::Vegetable EXTENDING default::WithHandle, default::PublicRead, default::Auditable {
      CREATE PROPERTY edible_parts: array<default::EdiblePart>;
      CREATE PROPERTY planting_methods: array<default::PlantingMethod>;
      CREATE REQUIRED PROPERTY stratum: array<default::Stratum>;
      CREATE PROPERTY uses: array<default::VegetableUsage>;
      CREATE MULTI LINK photos: default::Photo;
      CREATE MULTI LINK tips: default::VegetableTip {
          CREATE CONSTRAINT std::exclusive;
          CREATE PROPERTY order_index: std::int16;
      };
      CREATE MULTI LINK varieties: default::VegetableVariety {
          CREATE CONSTRAINT std::exclusive;
          CREATE PROPERTY order_index: std::int16;
      };
      CREATE PROPERTY content: std::json;
      CREATE REQUIRED PROPERTY gender: default::Gender;
      CREATE PROPERTY height_max: std::float32;
      CREATE PROPERTY height_min: std::float32;
      CREATE REQUIRED PROPERTY names: array<std::str>;
      CREATE PROPERTY origin: std::str;
      CREATE REQUIRED PROPERTY scientific_names: array<std::str>;
      CREATE PROPERTY temperature_max: std::float32;
      CREATE PROPERTY temperature_min: std::float32;
  };
  CREATE GLOBAL default::current_user := (std::assert_single((SELECT
      default::User
  FILTER
      (.identity = GLOBAL ext::auth::ClientTokenIdentity)
  )));
  CREATE TYPE default::UserProfile EXTENDING default::WithHandle, default::PublicRead, default::Auditable {
      CREATE REQUIRED LINK user: default::User {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE ACCESS POLICY owner_has_full_access
          ALLOW ALL USING ((GLOBAL default::current_user ?= .user));
      CREATE LINK photo: default::Photo;
      CREATE PROPERTY bio: std::str;
      CREATE PROPERTY location: std::str;
  };
  ALTER TYPE default::Auditable {
      ALTER LINK created_by {
          CREATE REWRITE
              INSERT 
              USING (GLOBAL default::current_user);
      };
  };
  CREATE SCALAR TYPE default::HistoryAction EXTENDING enum<`INSERT`, `UPDATE`, `DELETE`>;
  CREATE TYPE default::HistoryLog {
      CREATE LINK performed_by: default::User;
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
                  performed_by := GLOBAL default::current_user,
                  old := <std::json>__old__
              });
      CREATE TRIGGER log_insert
          AFTER INSERT 
          FOR EACH DO (INSERT
              default::HistoryLog
              {
                  action := default::HistoryAction.`INSERT`,
                  target := __new__,
                  performed_by := GLOBAL default::current_user,
                  new := <std::json>__new__
              });
      CREATE TRIGGER log_update
          AFTER UPDATE 
          FOR EACH DO (INSERT
              default::HistoryLog
              {
                  action := default::HistoryAction.`UPDATE`,
                  target := __new__,
                  performed_by := GLOBAL default::current_user,
                  old := <std::json>__old__,
                  new := <std::json>__new__
              });
  };
  CREATE TYPE default::VegetableConsortium {
      CREATE REQUIRED MULTI LINK vegetables: default::Vegetable {
          CREATE PROPERTY order_index: std::int16;
      };
      CREATE PROPERTY notes: std::str;
  };
  ALTER TYPE default::Vegetable {
      CREATE LINK consortia := (.<vegetables[IS default::VegetableConsortium]);
  };
  CREATE SCALAR TYPE default::VegetableLifeCycle EXTENDING enum<SEMESTRAL, ANUAL, BIENAL, PERENE>;
};
