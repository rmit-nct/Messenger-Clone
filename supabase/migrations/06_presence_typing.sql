-- 06_presence_typing.sql
-- Online presence and typing indicators are ephemeral and use Supabase Realtime
-- broadcast/presence channels, not database tables:
--   * typing  -> channel `conversation:{id}`, event `typing`
--   * presence -> channel `presence:online`, key = user id
-- Private-channel authorization is out of scope for this pass.
select 1;
