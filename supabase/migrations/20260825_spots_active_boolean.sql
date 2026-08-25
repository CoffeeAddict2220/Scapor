alter table public.spots
    add column if not exists active boolean;

-- Bestehende freigegebene Spots bleiben sichtbar. Die Abfrage funktioniert
-- auch dann, wenn die alte status-Spalte später nicht mehr benötigt wird.
do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'spots'
          and column_name = 'status'
    ) then
        execute $sql$
            update public.spots
            set active = (status = 'active')
            where active is null
        $sql$;
    else
        update public.spots
        set active = false
        where active is null;
    end if;
end
$$;

alter table public.spots
    alter column active set default false,
    alter column active set not null;
