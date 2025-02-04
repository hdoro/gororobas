CREATE MIGRATION m1voec4cyoffuwlhauheulwtoc7irsvwhzrg23bnh4d7ylnmvkv6cq
    ONTO m17y62occggv2ptb6d7ua4wtemf72o3qxa75vrblknlt5pghsilifq
{
  ALTER TYPE default::Note {
      ALTER PROPERTY public {
          CREATE ANNOTATION std::deprecated := 'Use publish_status instead';
      };
  };
};
