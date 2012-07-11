-- Table: hell_data

-- DROP TABLE hell_data;

CREATE TABLE hell_data
(
  id bigserial NOT NULL,
  city text NOT NULL,
  street text,
  house text,
  flat text,
  contact text,
  phone text,
  required text,
  info text,
  lat double precision,
  lon double precision,
  CONSTRAINT hell_data_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
