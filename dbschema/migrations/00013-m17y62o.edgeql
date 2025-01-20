CREATE MIGRATION m17y62occggv2ptb6d7ua4wtemf72o3qxa75vrblknlt5pghsilifq
    ONTO m1puudca5fxucuugvtlji7eqmnye437bncaainifoukxlz7nc6fnda
{
  CREATE SCALAR TYPE default::NotePublishStatus EXTENDING enum<PRIVATE, COMMUNITY, PUBLIC>;
  ALTER TYPE default::Note {
      CREATE REQUIRED PROPERTY publish_status: default::NotePublishStatus {
          SET default := 'PRIVATE';
      };
  };
};
