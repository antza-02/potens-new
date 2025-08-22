-- =====================================================
-- CHECK VENUES TABLE STRUCTURE
-- =====================================================

-- Show all columns in venues table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'venues'
ORDER BY ordinal_position;

-- Show current data in venues table
SELECT * FROM venues LIMIT 5;
