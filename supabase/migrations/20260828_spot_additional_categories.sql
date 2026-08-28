-- Die bisherige category-Spalte bleibt die Pflicht-/Hauptkategorie.
-- Bestehende Spots erhalten eine leere Liste und müssen nicht geändert werden.
begin;

alter table public.spots
    add column additional_categories text[] not null default '{}';

alter table public.spots
    add constraint spots_additional_categories_valid check (
        cardinality(additional_categories) <= 2
        and (cardinality(additional_categories) = 0 or (
            array_ndims(additional_categories) = 1
            and array_lower(additional_categories, 1) = 1
            and category is not null
            and category = any(array[
                'Architecture', 'Astro', 'Carshooting', 'Carspotting',
                'Landscape', 'Nature', 'Planespotting', 'Portrait',
                'Trainspotting', 'Wildlife'
            ])
            and array_position(additional_categories, null) is null
            and additional_categories <@ array[
                'Architecture', 'Astro', 'Carshooting', 'Carspotting',
                'Landscape', 'Nature', 'Planespotting', 'Portrait',
                'Trainspotting', 'Wildlife'
            ]::text[]
            and not (category = any(additional_categories))
            and (cardinality(additional_categories) < 2
                or additional_categories[1] <> additional_categories[2])
        ))
    );

comment on column public.spots.additional_categories is
    'Bis zu zwei unterschiedliche Zusatzkategorien neben der Hauptkategorie (category).';

commit;
