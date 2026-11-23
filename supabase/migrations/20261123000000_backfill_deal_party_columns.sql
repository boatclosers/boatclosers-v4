-- Keep the old party columns in step with the ones the app reads.
-- initiator_id / other_party_id are the main columns; party_a_user_id /
-- party_b_user_id are the older names, still read as a fallback.
-- Only fills empty values; never overwrites anything.
update deals set party_b_user_id = other_party_id
  where other_party_id is not null and party_b_user_id is null;
update deals set other_party_id = party_b_user_id
  where party_b_user_id is not null and other_party_id is null;
update deals set party_a_user_id = initiator_id
  where initiator_id is not null and party_a_user_id is null;
update deals set initiator_id = party_a_user_id
  where party_a_user_id is not null and initiator_id is null;
