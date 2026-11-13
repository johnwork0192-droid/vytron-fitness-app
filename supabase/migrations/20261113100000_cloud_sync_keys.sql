alter table public.workout_sessions add column if not exists client_id text;
alter table public.workout_sessions drop constraint if exists workout_sessions_user_client_id_key;
alter table public.workout_sessions add constraint workout_sessions_user_client_id_key unique (user_id, client_id);

alter table public.body_metrics add column if not exists client_id text;
alter table public.body_metrics drop constraint if exists body_metrics_user_client_id_key;
alter table public.body_metrics add constraint body_metrics_user_client_id_key unique (user_id, client_id);
