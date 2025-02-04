CREATE MIGRATION m15d2gfyy5o6gpcsbsdvjx7sqk2vtxgfgxypizm3534qgtaw5xoo3q
    ONTO m1rto75zbakbhmcunzsb7x7ne33ttz6y5tdn74t4j5bxhmsgtvm3ia
{
  ALTER TYPE default::Note {
      ALTER PROPERTY public {
          CREATE ANNOTATION std::deprecated := 'Use publish_status instead.';
      };
  };
};
