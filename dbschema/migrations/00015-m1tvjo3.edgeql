CREATE MIGRATION m1tvjo3c2lowk2vaerkakhpfjosw3wz2yardjfxoy33ht5qfds7leq
    ONTO m1voec4cyoffuwlhauheulwtoc7irsvwhzrg23bnh4d7ylnmvkv6cq
{
  ALTER TYPE default::Note {
      ALTER PROPERTY public {
          DROP ANNOTATION std::deprecated;
      };
  };
};
