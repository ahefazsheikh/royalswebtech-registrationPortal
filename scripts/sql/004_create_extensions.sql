-- Enable pgcrypto for gen_random_uuid() if not already enabled.
create extension if not exists pgcrypto;
